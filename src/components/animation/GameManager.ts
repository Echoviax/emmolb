import { Event } from "@/types/Event";
import { TeamManager } from "./TeamManager";
import { Game } from "@/types/Game";
import { Announcer } from "./Announcer";
import { Bases } from "@/types/Bases";
import { Baserunner, ProcessMessage } from "../BaseParser";
import { inverseFielderLabels, positions } from "./Constants";
import { Ball } from "./Ball";
import { RefObject } from "react";
import { Vector2 } from "@/types/Vector2";
import { capitalize } from "@/helpers/StringHelper";
import { AnimatedPlayer } from "./PlayerClass";
import { AnimatedText } from "./Text";
import { Crowd } from "./Crowd";

export class GameManager {
    homeTeam: TeamManager;
    awayTeam: TeamManager;
    game: Game;
    crowd: Crowd;
    eventLog: Event[];
    announcer: Announcer;
    private svgRef: RefObject<SVGSVGElement | null>
    private eventIndex: number = 0;
    private intervalID: number | null = null;
    private isPlaying: boolean = false;
    private fieldingTeam: TeamManager | null = null;
    private battingTeam: TeamManager | null = null;
    private baseStates: {bases: Bases, baseQueue: Baserunner[]}[] = [];
    private players: string[] = [];
    private animationQueue: Promise<void> = Promise.resolve();

    constructor({homeTeam, awayTeam, game, eventLog, announcer, crowd, svgRef,}: {homeTeam: TeamManager; awayTeam: TeamManager, game: Game, eventLog: Event[]; announcer: Announcer; crowd: Crowd; svgRef: RefObject<SVGSVGElement | null>;}) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.game = game;
        this.eventLog = eventLog;
        this.announcer = announcer;
        this.svgRef = svgRef;
        this.crowd = crowd;

        this.players = [...this.homeTeam.allPlayers.map((p) => (p.name)), ...this.awayTeam.allPlayers.map((p) => (p.name))];
        this.processBases();
    }

    private processBases() {
        const lastProcessed = Math.max(this.baseStates?.length - 1, 0);
        for (let i = lastProcessed; i < this.eventLog.length; i++) {
            const prevQueue = i > 0 ? this.baseStates[i-1].baseQueue ?? [] : [];
            this.baseStates.push(ProcessMessage(this.eventLog[i], this.players, prevQueue));
        }
    }

    updateEventLog(eventLog: Event[]) {
        this.eventLog = eventLog;
        this.processBases();
    }

    getEventIndex(): number {
        return this.eventIndex;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.processNextEvent();
    }

    stop() {
        this.isPlaying = false;
        if (this.intervalID !== null) clearTimeout(this.intervalID);
    }

    togglePause() {
        if (this.isPlaying) this.stop();
        else this.start();
    }

    isComplete(): boolean {
        return this.eventLog[this.eventLog.length - 1].event === 'Recordkeeping';
    }

    getIsPlaying(): boolean {
        return this.isPlaying;
    }

    getBasePaths(prevBases: Bases, curBases: Bases): Record<string, string[]> {
        const paths: Record<string, string[]> = {};
        const baseOrder = ['first', 'second', 'third'];
        const positionOrder = ['First', 'Second', 'Third', 'Home'];



        for (const base of baseOrder) {
            const baseStateKey = base as keyof Bases;
            const player = prevBases[baseStateKey];
            if (!player) continue;

            let toBase = baseOrder.find(b => curBases[b as keyof Bases] === player);
            if (!toBase) toBase = 'Home'; // Assume they scored (Will do parsing later)
            if (toBase === base) continue;

            const fromIndex = positionOrder.indexOf(capitalize(base));
            const toIndex = positionOrder.indexOf(capitalize(toBase));

            if (fromIndex < 0 || toIndex < 0 || toIndex < fromIndex) continue;
            paths[player] = positionOrder.slice(fromIndex + 1, toIndex + 1);
        }

        // Check for batter (not in prev)
        for (const base of baseOrder) {
            const baseStateKey = base as keyof Bases;
            const player = curBases[baseStateKey];
            if (!player) continue;
            if (Object.values(prevBases).includes(player)) continue;

            const toIndex = positionOrder.indexOf(capitalize(base));
            if (toIndex < 0) continue; // Skip if invalid

            paths[player] = positionOrder.slice(0, toIndex + 1);
        }

        return paths;
    }

    skipTo(eventIndex: number) {
        // Set up the prior event, and then call next() to animate current
        this.stop();
        const finalIndex = Math.max(0, Math.min(this.isComplete() ? this.eventLog.length - 1 : this.eventLog.length - 2, eventIndex));
        this.eventIndex = finalIndex;

        const cur = this.eventLog[this.eventIndex-1]
        const curBatter = (typeof cur.batter === 'object' && cur.batter !== null) ? cur.batter.name : cur.batter ?? '';
        const curPitcher = (typeof cur.pitcher === 'object' && cur.pitcher !== null) ? cur.pitcher.name : cur.pitcher ?? '';

        if (cur.inning !== 0){
            this.fieldingTeam = cur.inning_side === 0 ? this.homeTeam : this.awayTeam;
            this.battingTeam = cur.inning_side === 0 ? this.awayTeam : this.homeTeam;

            this.fieldingTeam?.hardSwitchPitcher(curPitcher);
            this.battingTeam?.hardSwitchBatter(curBatter);

            this.fieldingTeam?.resetPlayers(true);
            this.battingTeam?.setBases(this.baseStates[finalIndex].bases);
            this.battingTeam.resetPlayers(false);
        }

        this.announcer.setMessage(this.eventLog[this.eventIndex-1].message);
    }

    next() {
        this.processNextEvent();
    }

    private processNextEvent() {
        if (this.eventIndex >= this.eventLog.length - 1) {
            this.intervalID = window.setTimeout(() => {
                if (this.isPlaying) this.processNextEvent();
            }, 6000);
            return;
        }

        const prev = this.eventLog[this.eventIndex - 1] || null;
        const cur = this.eventLog[this.eventIndex];
        const next = this.eventLog[this.eventIndex + 1] || null;

        this.handleEvent({prev, cur, next});
        this.eventIndex++;

        this.intervalID = window.setTimeout(() => {
            if (this.isPlaying) this.processNextEvent();
        }, 6000);
    }

    private createBall(startPos: Vector2): Ball {
        const ball = new Ball(startPos);
        this.svgRef.current?.appendChild(ball.group);
        return ball;
    }

    private createText(startPos: Vector2, duration: number, fade: boolean, color: string, size: number, text: string): AnimatedText {
        const textObj = new AnimatedText(startPos, duration, fade, color, size, text);
        this.svgRef.current?.appendChild(textObj.group);
        return textObj;
    }

    private async foulBallAnimation(hand: 'L' | 'R') {
        const foulPositions: Record<string, Vector2> = {'L': new Vector2(0, 300), 'R': new Vector2(1000, 300)};
        const ball = this.createBall(positions['Home']);
        const hitPos = Math.random() >= 0.3 ? foulPositions[hand] : foulPositions[hand === 'L' ? 'R' : 'L'];
        await ball.throwTo(new Vector2((hitPos.x-30)+Math.random()*60, hitPos.y), 250+Math.random()*50);
        this.svgRef.current?.removeChild(ball.group);
    }

    private parseThrowChain(msg: string, start: keyof typeof positions): (keyof typeof positions)[] {
        const chain: (keyof typeof positions)[] = ["Home", start];
        const [, throwPart] = msg.split(",", 2);
        const matches = [...(throwPart?.matchAll(/\b([1-3][B]|SS|[LRC]F)\b/g) ?? [])].slice(1); // Remove the duplicate 'start' position
        for (const match of matches) {
            const pos = inverseFielderLabels[match[1]];
            if (pos) chain.push(pos); // Only add defined ones
        }
        return chain;
    }

    getPlayerByName(name: string | undefined) {
        if (!name) return undefined;
        return this.battingTeam?.playersByName[name] ?? this.fieldingTeam?.playersByName[name];
    }

    parseOuts(message: string): { name: string, base: keyof typeof positions }[] {
        const batterName = this.battingTeam?.currentBatter?.name ?? '';
        const outs: { name: string, base: keyof typeof positions }[] = [];

        // All of this is for the weird batting formatting
        const outPatterns = [
            { regex: new RegExp(`${batterName} (lines|flies|pops|grounds) out`, 'i'), base: 'First' },
            { regex: new RegExp(`${batterName} out at (first|second|third|home)`, 'i') },
            { regex: /double play.*out at (first|second|third|home)/gi },
            { regex: /triple play.*out at (first|second|third|home)/gi }
        ];

        for (const pattern of outPatterns) {
            const match = pattern.regex.exec(message);
            if (match) {
                let base = match[1]?.toLowerCase() as string;
                if (pattern.base) base = 'First'; // default for batter if not specified
                const outBase = capitalize(base) as keyof typeof positions;
                outs.push({ name: batterName, base: outBase });
            }
        }

        // XXX out at YYY for base runners
        const runnerOuts = [...message.matchAll(/([\w.'-]+) out at (first|second|third|home)/gi)];
        for (const [, name, base] of runnerOuts) {
            outs.push({
                name,
                base: capitalize(base) as keyof typeof positions
            });
        }

        return outs;
    }

    private jitterPosition(position: Vector2, bounds: [number, number, number, number] = [20, 20, 20, 20]): Vector2 {
        const diffX = (Math.random() * (bounds[0] + bounds[1])) - bounds[0];
        const diffY = (Math.random() * (bounds[2] + bounds[3])) - bounds[2];
        return new Vector2(position.x + diffX, position.y + diffY);
    }

    private computePlayerPath(start: string, end: string): string[] {
        const pathMap: Record<string, string[]> = { 
            home: ['First', 'Second', 'Third', 'Home'], 
            first: ['Second', 'Third', 'Home'], 
            second: ['Third', 'Home'], 
            third: ['Home'] 
        };
        const fullPath = pathMap[start.toLowerCase()] || [];
        const endIndex = fullPath.findIndex(b => b.toLowerCase() === end.toLowerCase());
        return endIndex === -1 ? [end] : fullPath.slice(0, endIndex + 1); // Return just end base if it errors
    };

    private async resolvePlay(index: number) {
        this.crowd.cheer(this.battingTeam === this.awayTeam ? 'Away' : 'Home', 'Light');
        const ball = this.createBall(positions.Home);
        ball.hide();

        const curEvent = this.eventLog[index];
        const nextEvent = this.eventLog[index + 1];
        const isHomer = nextEvent.message.includes('homers') || nextEvent.message.includes('grand slam');
        if (!curEvent || !nextEvent || !this.battingTeam || !this.fieldingTeam) return; // Uhhh. Shouldn't run. My sanity

        const batCaughtReg = new RegExp(`(lines|flies|pops) out`, 'i');
        const isHitCaught = batCaughtReg.exec(nextEvent.message);
    
        const initialOuts = curEvent.outs;
        const newOuts = this.parseOuts(nextEvent.message);
        const hitLocation = this.getHitLocation(curEvent.message);
        const throwChain = this.parseThrowChain(nextEvent.message, hitLocation);
    
        const runners = new Map<string, AnimatedPlayer | undefined>([
            ['first', this.battingTeam.firstBaseRunner],
            ['second', this.battingTeam.secondBaseRunner],
            ['third', this.battingTeam.thirdBaseRunner],
            ['batter', this.battingTeam.currentBatter],
        ]);
        
        const baseToFielder: Record<string, keyof typeof positions> = { 
            first: 'FirstBaseman', 
            second: 'SecondBaseman', 
            third: 'ThirdBaseman', 
            home: 'Catcher',
        };
    
        // Timeline for the ball
        const batterName = this.battingTeam.currentBatter?.name;
        const batterOutInfo = batterName ? newOuts.find(o => o.name === batterName) : undefined;
        const throwTimeline: { toPos: keyof typeof positions, catchTime: number, speed: number, to: Vector2, startTime: number }[] = [];
        let cumulativeTime = 0;
    
        if (isHomer) this.crowd.cheer(this.battingTeam === this.awayTeam ? 'Away' : 'Home', 'Heavy');

        if (!isHomer) {
            for (let i = 1; i < throwChain.length; i++) {
                let isBeforeBatterOut = false; // Speed stuff up if it is before the batter gets out. Helps slightly with batter walk times
                if (batterOutInfo) {
                    const outFielderForBatter = baseToFielder[batterOutInfo.base.toLowerCase()];
                    const outThrowIndex = throwChain.findIndex(p => p === outFielderForBatter);
                    if (outThrowIndex !== -1 && i <= outThrowIndex) {
                        isBeforeBatterOut = true;
                    }
                }
        
                const fromPos = throwChain[i - 1];
                const toPos = throwChain[i];
                const fromVec = (i > 1 ? throwTimeline[i - 2].to : positions[fromPos]);
                const toVec = this.jitterPosition(positions[toPos]);
                const distance = Vector2.distance(fromVec, toVec);
                
                const isHit = (i === 1);
                
                const throwDuration = isHit ? 1400 : (isBeforeBatterOut ? 950 : 1100);
                const holdTime = isBeforeBatterOut ? 350 : 700;
                const speed = distance / (throwDuration / 1000);
                
                const startTime = cumulativeTime;
                const catchTime = startTime + throwDuration;
                cumulativeTime = catchTime + holdTime;
                
                throwTimeline.push({toPos, catchTime, speed, to: toVec, startTime});
            }
        } else {
            // Home run
            const toPos = this.jitterPosition(positions[throwChain[throwChain.length-1]]);
            const outOfFieldPos = new Vector2(toPos.x, -200);
            throwTimeline.push({toPos: 'Home'/* filler */, catchTime: 5000, speed: 250, to: outOfFieldPos, startTime: 0});
        }


    
        // Calculate when outs occur
        const outEvents = newOuts.map(out => {
            const outFielderPos = baseToFielder[out.base.toLowerCase()];
            const throwToOutBase = throwTimeline.find(t => t.toPos === outFielderPos);
            return {time: throwToOutBase ? throwToOutBase.catchTime : Infinity};
        }).sort((a, b) => a.time - b.time);
    
        // Calculate when (if) third out occurs
        let thirdOutTime = Infinity;
        const thirdOutIndex = 3 - initialOuts - 1; // -1 to account for index 0
        if (thirdOutIndex >= 0 && thirdOutIndex < outEvents.length) {
            thirdOutTime = outEvents[thirdOutIndex].time;
        }
    
        const animationTasks: (() => Promise<void>)[] = [];
    
        // Create Ball animations
        const ballAnimations = async () => {
            ball.show();
            let currentTime = 0;
            for (let i = 0; i < throwTimeline.length; i++) {
                const seg = throwTimeline[i];
                await this.sleep(Math.max(0, seg.startTime - currentTime));
                await ball.throwTo(seg.to, seg.speed);
                if (isHitCaught && i==0) this.createText(new Vector2(seg.to.x, seg.to.y-40), 2500, true, 'white', 16, 'Caught!');
                currentTime = seg.catchTime;
            }
            if (throwTimeline.length > 0) await this.sleep(cumulativeTime - currentTime); // Final sleep
            if (!isHomer) await ball.throwTo(positions['Pitcher']); // Pass back to mound
            this.svgRef.current?.removeChild(ball.group); // I think this is what they call an Orchiectomy
        };
        animationTasks.push(ballAnimations);
    
        // Create fielder animations
        for (const seg of throwTimeline) {
            const fielderAnimations = async () => {
                const fielder = this.fieldingTeam?.playersByPosition[seg.toPos];
                if (!fielder) return; // This one could run! On a home run! (New as of 7-24)
                
                const moveStartTime = seg.catchTime - 200 - fielder.getWalkDuration(seg.to); // Walk to the catch position before the ball (get there 200ms prior)
                await this.sleep(Math.max(0, moveStartTime));
                await fielder.walkTo(seg.to);
    
                const outBase = newOuts.find(o => baseToFielder[o.base.toLowerCase()] === fielder.position);
                if (outBase) { // Walk to the base to 'tag'
                    ball.moveTo(positions[outBase.base], 150)
                    await fielder.walkTo(positions[outBase.base], 150);
                    this.createText(new Vector2(positions[outBase.base].x, positions[outBase.base].y - 40), 2500, true, 'white', 16, "Out!");
                    await this.sleep(250); // A little pause in case that is the end of events
                }
            };
            animationTasks.push(fielderAnimations);
        }
    
        // Runner animations :(
        const nextBases = this.baseStates[index + 1].bases;
        for (const [startBase, player] of runners.entries()) {
            if (!player) continue; // No one on base, this one will actually run
            
            const runnerAnimations = async () => {
                const outInfo = newOuts.find(o => o.name === player.name);
                const isOut = !!outInfo;
                const isBatter = player === this.battingTeam?.currentBatter;
                const endBaseKey = isOut ? outInfo.base.toLowerCase() : Object.entries(nextBases).find(([_, p]) => p === player.name)?.[0] ?? 'home'; // They scored if not out and not on base in next event
    
                const path = this.computePlayerPath(startBase === 'batter' ? 'home' : startBase, endBaseKey);
                if (path.length === 0) return; // No bases run? No animations
    
                let reactionTime = 150 + (Math.random() * 100); // Just a random wait to make it seem like they thought
                await this.sleep(reactionTime);
    
                // Out but not batter. Should wait at base until right before the throw that gets them out is thrown.
                if (isOut && !isBatter) {
                    const outFielderPos = baseToFielder[endBaseKey];
                    const throwToOutBase = throwTimeline.find(t => t.toPos === outFielderPos);
                    if (throwToOutBase) {
                        const hesitationTime = throwToOutBase.startTime - reactionTime;
                        if (hesitationTime > 0) {
                            await this.sleep(hesitationTime);
                            reactionTime += hesitationTime;
                        }
                        const arrivalTime = throwToOutBase.catchTime + 250 + Math.random() * 250; // Arrive .25-5s after the ball
                        const totalRunDuration = Math.max(200, arrivalTime - reactionTime);
                        let totalDistance = 0;
                        let lastPos = player.posVector;
                        for(const base of path) {
                            totalDistance += Vector2.distance(lastPos, positions[base]); // Around 200, but does vary ever slightly
                            lastPos = positions[base];
                        }
                        const requiredSpeed = totalDistance / (totalRunDuration / 1000);
                        for (const base of path) await player.walkTo(positions[base], requiredSpeed);
                        await this.sleep(500);
                        await player.walkOff();
                    } else {
                        for (const base of path) await player.walkTo(positions[base], 125); // This shouldn't really ever run. It would mean the player getting out but there is no throw to the baseman to get them out
                    }
                // Even if batter is out, they should still run right when the ball is hit. Override the hesitation
                } else if (isOut && isBatter) {
                    const outFielderPos = baseToFielder[endBaseKey];
                    const throwToOutBase = throwTimeline.find(t => t.toPos === outFielderPos);
                    if (throwToOutBase) {
                        // This results in the batter sometimes walking reallllly slowly. Uhhh, nothing to do about it with this set up
                        const arrivalTime = throwToOutBase.catchTime + 250 + Math.random() * 250; // Arive .25-.5s after the ball
                        const totalRunDuration = Math.max(200, arrivalTime - reactionTime);
                        const requiredSpeed = Vector2.distance(player.posVector, positions[path[0]]) / (totalRunDuration / 1000);
                        await player.walkTo(positions[path[0]], requiredSpeed);
                        await this.sleep(500);
                        await player.walkOff();
                    } else {
                        await player.walkTo(positions[path[0]], 125); // See above
                    }
                // This is a safe runner
                } else {
                    // Each base
                    for (let i = 0; i < path.length; i++) {
                        const base = path[i];
                        const speed = 110 + Math.random() * 20; // Eh, they're safe, just some random speed
                        const duration = player.getWalkDuration(positions[base], speed);
                        
                        if (reactionTime + duration > thirdOutTime) break; 
                        
                        await player.walkTo(positions[base], speed);
                        reactionTime += duration;
    
                        const isFinalBase = (i === path.length - 1);
                        if (!isFinalBase && !isHomer) {
                            const contemplationTime = 300 + Math.random() * 400; // Still have some fake thinking every base
                            if (reactionTime + contemplationTime > thirdOutTime) break;
                            await this.sleep(contemplationTime);
                            reactionTime += contemplationTime;
                        }
                    }
                    // Prevent them from walking home on the third out. They instead walk off a little after it
                    if (path[path.length - 1] === 'Home' && reactionTime < thirdOutTime) {
                        await this.sleep(1500); // Still needs micro-adjustments to feel right.
                        await player.walkOff();
                    }
                }
                await player.faceDirection("front");
            };
            animationTasks.push(runnerAnimations);
        }
        
        await this.runParallel(animationTasks);
        this.battingTeam.setBases(nextBases);
        this.battingTeam.currentBatter = undefined;
        this.fieldingTeam.allPlayers.forEach(p => void p.returnToPosition());
        // And breathe. Deep breath. In. And out. In. And out
    }

    // Okay. I've tried this many times before, but it evidently is not working. So I'll do the age-old whiteboarding/pseudocode/rubber duck/sanity check approach

    /*
    Hello and welcome back to the daily sanity check, starring your host, as always, me! Luna! I named myself after the moon because sometimes I wish I was as removed from the events that take place on Earth as the moon is.
    Today's sanity check is on the meat of this application. How can I line up the ball throws and the base running while still keeping them unique and realistic? I have 12 seconds (two phases) to cover base movement and ball throwing.
    
    I'm working with 9 things to start
    - The Current Event (a 'Pitch')
    - The Next Event (a 'Field')
    - Current Bases
    - Next Bases
    - Outs {name: string, base: string as keyof Bases}
    - ThrowChain: A string array of all the locations the ball must visit, in order
    
    Two options for how we start this. 
    We can either make all the walking animations and then use their lengths to calculate when the ball should be thrown
    Or... We can calculate the ball throws and then use that to find how long the base walks should be.
    In terms of realism, it's likely better to go with the first option. Going with the first option means we always know where the ball will be at a given moment
    We can use our knowledge of the ball's location to make it look like the runners are 'judging' whether they should run or not before they run.
    For example, If a runner advances from first to third throughout the entire play, and we know the ball goes from LF to RF. They can stand on second and not run until the ball is mid-throw to RF.

    So we'll need to start by calculating the throw times. BUT the issue now is assuming the fielders don't always catch the ball. But, actually, it seems that if they don't catch the ball it's considered an error?
    Well if it is an error, we already know MMOLB parses and tells us about those. So we can parse their message and determine who catches the ball and who doesn't, based on if anyone errors.

    Okay, so now we assume a max of 12 seconds for 4 total base runs. We won't ever have someone advance all 4 bases in one hit while there is passing going on, but let's assume we will.
    2s to run to each base
    1s of contemplation
    4 bases
    12 total seconds maximum (not including the pitch, blah blah)
    So ball passes should take probably 2-3 seconds each? With some time after the catch for the catcher to presumably get the ball out of their glove, decide who to pass to next, and then actually make that pass.
    Average base distance is 200px, and we'll say it's about 300-400 for the distance the ball will travel each pitch. So a ball covering 1.5-2x the distance in the same time, plus some down time for getting the ball out of the glove and so on.
    That means the players are running at 100pps, which is the default speed. This math is good and nice and I like it!

    So, let's assume the runners will run before the pass happens that gets them out. Maybe they start running like as the ball hits the air, but then realize too late that they'll get out.
    I'm saying this because it makes it easy to calculate. *where is the ball? lf. where is the ball? lf. where is the ball? in-air (to 2B). okay, now have the first runner think they can make it to second and start sprinting. Oh no, they're out*

    So what will I need to implement this?
    A function that can calculate the time it will take to pass a ball from x to y
    A function that can take a current time, end time, and distance, then calculate the speed the runner should run (tell it the runner should arrive 200ms before or after the ball, etc).
    Distance function (builtin to Vector2. As long as my math there is right)
    some other stuff. I'm not good at writing things out ahead of time

    So that is my daily sanity check. Now to implement what is written here
    */

    /*
    Hello and welcome back to the daily sanity check, starring your host, as always, me! Luna! I named myself after the moon because sometimes I wish I was as removed from the events that take place on Earth as the moon is.
    Today's sanity check is on the same thing as yesterday's, and the day prior.
    
    I've given it some thought, and here is my conclusion. We can make a function that looks at the max bases run (first to third is two, etc), and how many passes there are
    As well as all the outs and where they are, and the throw order. We can then make runners default to running, unless their next base is a base they get out at, in which case
    They will wait until right before the ball is thrown to the location that gets them out, and then start running, so they arrive after the ball.

    Walking bases to a safe base technically it doesn't matter where the ball is, so they can just run by default.
    Fielders should pause on getting the ball to simulate reaction time and deciding where to pass
    Runners should pause on each base a little bit to simulate debating to run to the next base
    All runners shuld hold for a little, including batter after the ball is hit, to simulate reaction time and decisions

    If the batter gets out on a hit, and that involves a pass, speed up the logic so the batter isn't paused at home forever, and also so they don't walk painfully slow to first base
    */

    private getHitLocation(msg: string): keyof typeof positions {
        if (msg.includes("to center field")) return "CenterFielder";
        if (msg.includes("to left field")) return "LeftFielder";
        if (msg.includes("to right field")) return "RightFielder";
        if (msg.includes("to first base")) return "FirstBaseman";
        if (msg.includes("to second base")) return "SecondBaseman";
        if (msg.includes("to third base")) return "ThirdBaseman";
        if (msg.includes("to the shortstop")) return "Shortstop";
        if (msg.includes("to the pitcher")) return "Pitcher";
        return "Home";
    }

    private advanceBases(index: number, removeBatter: boolean = true) {
        if (!this.battingTeam || !this.fieldingTeam) return;

        const prevBases = this.baseStates[index-1];
        const curBases = this.baseStates[index];
        if (removeBatter) this.battingTeam.currentBatter = undefined;
        this.battingTeam.firstBaseRunner = curBases.bases.first ? this.battingTeam.playersByName[curBases.bases.first] : undefined;
        this.battingTeam.secondBaseRunner = curBases.bases.second ? this.battingTeam.playersByName[curBases.bases.second] : undefined;
        this.battingTeam.thirdBaseRunner = curBases.bases.third ? this.battingTeam.playersByName[curBases.bases.third] : undefined;

        if (!prevBases || !curBases) return;
        const paths = this.getBasePaths(prevBases.bases, curBases.bases);

        const tasks = Object.entries(paths).map(([playerName, path]) => async () => {
            const player = this.battingTeam?.playersByName[playerName];
            if (!player) return;

            for (const base of path) {
                await player.walkTo(positions[base]);
            }
            player.faceDirection('front');
            if (path[path.length - 1] === 'Home') await player.walkOff();
        });

        this.runParallel(tasks);
    }

    // Scrapping this for now. It would need to be called the event prior, and with current pitch speeds, the runner moving would be really slow with a lead-off
    // I'll instead move onto other fixes, like pitch speed displaying
    // private async handleSteals(curIndex: number) {
    //     const message = this.eventLog[curIndex].message.split(". ").slice(1).join(". ");
    //     const caught = message.includes('caught stealing');
    //     const match = message.match(/([\w.'-]+) (is caught stealing|steals)/i)
    //     const player = match ? this.getPlayerByName(match[1]) : undefined;
    //     this.battingTeam.leadOff(player); // It is easier to make a leadOff in TeamManager as it knows what base that player is on
    // }

    private async handleEvent({prev, cur, next}: {prev: Event | null, cur: Event, next: Event | null}) {
        const curBatter = (typeof cur.batter === 'object' && cur.batter !== null) ? cur.batter.name : cur.batter ?? '';
        const curPitcher = (typeof cur.pitcher === 'object' && cur.pitcher !== null) ? cur.pitcher.name : cur.pitcher ?? '';

        this.fieldingTeam = cur.inning_side === 0 ? this.homeTeam : this.awayTeam;
        this.battingTeam = cur.inning_side === 0 ? this.awayTeam : this.homeTeam;

        if (cur.pitcher !== prev?.pitcher && cur.pitcher) this.fieldingTeam.switchPitcher(curPitcher);
        if (cur.batter !== prev?.batter) {
            this.battingTeam.switchBatter(curBatter);
            this.crowd.cheer(this.battingTeam === this.awayTeam ? 'Away' : 'Home', 'Idle');
        }

        const outsIncreased = (cur.outs ?? 0) > (prev?.outs ?? 0);
        const strikesIncreased = (cur.strikes ?? 0) > (prev?.strikes ?? 0);
        const ballsIncreased = (cur.balls ?? 0) > (prev?.balls ?? 0);
        const resultTextLocation = new Vector2(positions['Home'].x, positions['Home'].y - 40);
        let resultText = '';
        if (outsIncreased)
            resultText = 'Strikeout!';
        else if (cur.message.includes('Foul'))
            resultText = 'Foul!'
        else if (strikesIncreased)
            resultText = 'Strike!';
        else if (ballsIncreased)
            resultText = 'Ball!';

        switch (cur.event) {
            case 'InningEnd':
            case 'PlayBall':  // 'PlayBall' to catch the first inning's start
                if (next?.event === 'InningStart'){
                    this.fieldingTeam.endFieldingInning();
                    this.battingTeam.startFieldingInning();
                }
                this.crowd.cheer('Home', 'Idle');
                this.crowd.cheer('Away', 'Idle');
                break;
            case 'Pitch': {
                this.createText(new Vector2(positions['Pitcher'].x, positions['Pitcher'].y - 40,), 3000, true, 'white', 12, cur.pitch_info);
                if (next?.event === 'Field') {
                    const ball = this.createBall(positions['Pitcher']);
                    await ball.throwTo(positions['Home']);
                    this.svgRef.current?.removeChild(ball.group);
                    this.resolvePlay(cur.index);
                }
                else {
                    if (cur.message.includes('steals')) this.advanceBases(cur.index, false);
                    if (cur.message.includes('📣')) this.crowd.cheer(this.battingTeam === this.awayTeam ? 'Away' : 'Home', 'Heavy');
                    const ball = this.createBall(positions['Pitcher']);
                    await ball.throwTo(positions['Home']);
                    this.svgRef.current?.removeChild(ball.group);
                    this.createText(resultTextLocation, 2500, true, 'white', 16, resultText);
                    if (cur.message.includes('walks') || cur.message.includes('hit by the pitch')) this.advanceBases(cur.index);
                    if (cur.message.includes('Foul') && !cur.message.includes('tip')) this.foulBallAnimation(this.battingTeam.currentBatter?.posVector === positions['LeftHandedBatter'] ? 'L' : 'R');
                }
            }
        }

        // Default message shows on page load
        this.announcer.sayMessage({text: cur.message ?? "Howdy! If you're on mobile, this page is fully intended to be viewed in landscape mode. Report any bugs in the offical MMOLB Discord please.", duration: 4000});
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private runParallel(tasks: (() => Promise<void>)[]): Promise<void> {
        return Promise.all(tasks.map(task => task().catch(() => {}))).then(() => {});    
    }

    private queue(task: () => Promise<void>) {
        this.animationQueue = this.animationQueue.then(task).catch(() => {});
    }
}