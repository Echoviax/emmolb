// /components/BaseParser.tsx
// Authors: Navy, Luna
'use client'

import { Bases } from "@/types/Bases";
import { Event } from "@/types/Event";
import { BatterGameStats, GameStats, PitcherGameStats } from "@/types/GameStats";

function extractPlayers(message: string, playerList: string[], check: string): string[] {
    if (!message.includes(check))
        return [];

    return playerList.filter(player => message.includes(`${player} ${check}`));
}

function assignBases(event: Event, queue: Baserunner[]): Bases {
    const { on_1b, on_2b, on_3b } = event;

    let third = null, second = null, first = null;
    let queueIndex = 0;

    if (on_3b) third = queue[queueIndex++]?.runner ?? 'Unknown';
    if (on_2b) second = queue[queueIndex++]?.runner ?? 'Unknown';
    if (on_1b) first = queue[queueIndex++]?.runner ?? 'Unknown';

    return { first, second, third };
}

export interface Baserunner {
    runner: string;
    pitcher?: string;
}

export function ProcessMessage(event: Event, players: string[], queue: Baserunner[], gameStats?: GameStats,): {bases: Bases; baseQueue: Baserunner[]} {
    const message = event.message;
    const runners = queue.map(x => x.runner);
    const newQueue = [...queue];
    let pitcher = (typeof event.pitcher === 'object' && event.pitcher !== null) ? event.pitcher.name : event.pitcher;
    const batter = (typeof event.batter === 'object' && event.batter !== null) ? event.batter.name : event.batter;

    const startsInning = /starts the inning on/i.test(message);
    const hit = /(singles on|doubles on|triples on)/i.test(message);
    const homer = /(homers on|grand slam)/i.test(message);
    const walk = /^Ball 4. /i.test(message);
    const hbp = /was hit by the pitch/i.test(message);
    const error = /(fielding error|throwing error)/i.test(message);
    const sacFly = /sacrifice fly/i.test(message);
    const doublePlay = /double play/i.test(message);
    const out = !sacFly && /(grounds out|lines out|flies out|pops out)/i.test(message);
    const strikeout = /struck out/i.test(message);
    const fc = !error && /(fielder's choice|force out)/i.test(message);
    const ball = walk || hbp || /^Ball/.test(message);
    const strike = hit || homer || error || out || fc || strikeout || /(^Strike, |^Foul ball|^Foul tip)/.test(message);
    const balk = /^Balk. /.test(message);
    const caughtStealing = /caught stealing/i.test(message);
    const stealsHome = /steals home/i.test(message);
    const inningEnd = event.outs === null || event.outs === undefined;
    const scoreCount = (message.match(/scores!/g) ?? []).length + (stealsHome ? 1 : 0) + (homer ? 1 : 0);
    const pitcherEjected = pitcher && message.match(`ROBO-UMP ejected.*${pitcher} takes the mound`) !== null;
    const batterEjected = batter && message.match(`ROBO-UMP ejected.*${batter}.*for.*Bench Player`) !== null;

    const {scoreboard, batterStats, pitcherStats} = (() => {
        if (!gameStats) return {scoreboard: null, batterStats: null, pitcherStats: null};

        const scoreboard = (event.inning_side === 0) ? gameStats.away : gameStats.home;
        if (scoreboard.runsByInning.length < event.inning)
            scoreboard.runsByInning.push(0);

        if (batter && !gameStats.batters[batter]) {
            scoreboard.battingOrder.push(batter);
            gameStats.batters[batter] = BatterGameStats();
        }
        const batterStats = (batter) ? gameStats.batters[batter] : null;

        if (pitcherEjected) {
            const pitchingOrder = ((event.inning_side === 0) ? gameStats.home : gameStats.away).pitchingOrder;
            pitcher = pitchingOrder[pitchingOrder.length - 1];
        }
        if (pitcher && !gameStats.pitchers[pitcher]) {
            ((event.inning_side === 0) ? gameStats.home : gameStats.away).pitchingOrder.push(pitcher);
            gameStats.pitchers[pitcher] = PitcherGameStats();
        }
        const pitcherStats = (pitcher) ? gameStats.pitchers[pitcher] : null;

        for (let i = 0; i < scoreCount; i++) {
            const scoringPlayer = newQueue[i];
            if (scoringPlayer && scoringPlayer.runner && scoringPlayer.runner != 'Unknown') {
                gameStats.batters[scoringPlayer.runner].runs++;
                if (scoringPlayer.pitcher) gameStats.pitchers[scoringPlayer.pitcher].earnedRuns++;
            }
        }
        if (scoreCount > 0) {
            scoreboard.runsByInning[event.inning - 1] += scoreCount;
        }

        return {scoreboard, batterStats, pitcherStats};
    })();
    
    if (gameStats) {
        if (hit || homer) {
            scoreboard!.hits++;
        } else if (error) {
            ((event.inning_side === 0) ? gameStats.home : gameStats.away).errors++;
        }

        if (batterStats) {
            if (hit || homer || out || strikeout || fc || doublePlay || error) batterStats.atBats++;
            if (hit || homer) batterStats.hits++;
            if (homer) {
                batterStats.homeRuns++;
                batterStats.runs++;
            }
            if (scoreCount > 0 && !error && !doublePlay && !stealsHome && !balk) batterStats.rbi += scoreCount;
            if (batterEjected) batterStats.ejected = true;
        }

        if (pitcherStats) {
            if (strike) pitcherStats.strikesThrown++;
            if (strike || ball) pitcherStats.pitchCount++;
            if (hit || homer) pitcherStats.hits++;
            if (homer) pitcherStats.earnedRuns++;
            if (out || strikeout || fc || sacFly) pitcherStats.outsRecorded++;
            if (caughtStealing) pitcherStats.outsRecorded++;
            if (doublePlay) pitcherStats.outsRecorded += 2;
            if (strikeout) pitcherStats.strikeouts++;
            if (walk) pitcherStats.walks++;
            if (pitcherEjected) pitcherStats.ejected = true;
        }
    }

    for (let i = 0; i < scoreCount; i++) {
        newQueue.shift();
    }

    if (startsInning) {
        const starters = extractPlayers(message, players, 'starts the inning on');
        newQueue.push(...starters.map(runner => ({runner})));
    }

    if (hit || walk || hbp || error || fc)
        newQueue.push({runner: batter ?? 'Unknown', pitcher: !error ? pitcher : undefined});

    let outs = extractPlayers(message, runners, 'out at');
    outs = outs.concat(extractPlayers(message, runners, 'is caught stealing'));
    outs = outs.concat(extractPlayers(message, runners, 'steals home'));
    for (const player of outs) {
        const index = newQueue.findIndex(p => p.runner == player);
        if (index !== -1) newQueue.splice(index, 1);
    }

    if (inningEnd && gameStats) {
        scoreboard!.leftOnBase += newQueue.length;
    }

    if (homer || inningEnd)
        newQueue.length = 0;

    const bases = assignBases(event, newQueue);

    return {
        bases,
        baseQueue: newQueue
    };
}