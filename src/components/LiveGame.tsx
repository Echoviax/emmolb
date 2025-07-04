'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { GameHeader } from '@/components/GameHeader';
import { GameStateDisplay } from '@/components/GameStateDisplay';
import { EventBlock } from './EventBlock';
import { CopiedPopup } from './CopiedPopup';
import PlayerStats from './PlayerStats';
import { useSettings } from './Settings';
import { ProcessMessage } from './BaseParser';
<<<<<<< HEAD

type Event = any; // ahhhh

type EventMessage = {
  index: number;
  message: string;
  pitchSpeed?: string | null;
  pitchZone?: string | null;
}
=======
import { Bases } from '@/types/Bases';
import { MapAPITeamResponse, Team } from '@/types/Team';
import { Game, MapAPIGameResponse } from '@/types/Game';
import { Event } from '@/types/Event';
>>>>>>> dcab695 (Proper Typing (sort of))

type EventBlockGroup = {
    emoji?: string;
    title?: string;
    color?: string;
    titleColor?: string;
    messages: Event[];
    onClick?: any;
};

<<<<<<< HEAD
function getERA(stats: any): string {
  const earnedRuns = stats.earned_runs ?? 0;
  const outs = stats.outs ?? 0;
  const inningsPitched = outs / 3;

  if (inningsPitched === 0) return "∞ ERA";

  const era = (earnedRuns / inningsPitched) * 9;
  return `${era.toFixed(3)} ERA`;
}

=======
>>>>>>> dcab695 (Proper Typing (sort of))
function getOPS(stats: any): string {
    const singles = stats.singles ?? 0;
    const doubles = stats.doubles ?? 0;
    const triples = stats.triples ?? 0;
    const home_runs = stats.home_runs ?? 0;
    const walked = stats.walked ?? 0;
    const hbp = stats.hit_by_pitch ?? 0;
    const sac_flies = stats.sacrifice_flies ?? 0;
    const at_bats = stats.at_bats ?? 0;
    const hits = (stats.singles ?? 0) + (stats.doubles ?? 0) + (stats.triples ?? 0) + (stats.home_runs ?? 0)
    const obp = ((hits + walked + hbp) / (at_bats + walked + hbp + sac_flies)).toFixed(3);
    const slg = ((singles + 2 * doubles + 3 * triples + 4 * home_runs)/(at_bats)).toFixed(3);
    return (Number(obp) + Number(slg)).toFixed(3);
}

export default function LiveGame({ awayTeamArg, homeTeamArg, initialDataArg, gameId }: { awayTeamArg: any, homeTeamArg: any, initialDataArg: any; gameId: string }) {
    const awayTeam = MapAPITeamResponse(awayTeamArg);
    const homeTeam = MapAPITeamResponse(homeTeamArg);
    const initialData = MapAPIGameResponse(initialDataArg);
    const [eventLog, setEventLog] = useState<Event[]>(initialData.event_log);
    const [lastEvent, setLastEvent] = useState(initialData.event_log[initialData.event_log.length - 1]);
    const [data, setData] = useState(initialData);
    const players: Record<string, any> = {};
    const homePlayers: string[] = [];
    const awayPlayers: string[] = [];
    const { settings } = useSettings();

    for (const player of awayTeam.players) {
        const fullName = `${player.first_name} ${player.last_name}`
        players[fullName] = player;
        awayPlayers.push(fullName);
    }

    for (const player of homeTeam.players) {
        const fullName = `${player.first_name} ${player.last_name}`
        players[fullName] = player;
        homePlayers.push(fullName);
    }
    
    const lastEventIndexRef = useRef(lastEvent.index);
    const failureCountRef = useRef(0);
    const repeatedAfterCountRef = useRef(0);
    const lastAfterRef = useRef<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [playerType, setPlayerType] = useState<'pitching' | 'batting' | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [followLive, setFollowLive] = useState(false);

    useEffect(() => {
        lastEventIndexRef.current = lastEvent.index;
    }, [lastEvent]);

    useEffect(() => {
        let isMounted = true;

        async function poll() {
            if (!isMounted) return;
            if (data.state === "Complete") {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    console.log("Polling stopped: game complete.");
                }
                return;
            }

            const after = (lastEventIndexRef.current + 1).toString();

            // Track repeated 'after' param requests
            if (lastAfterRef.current === after) {
                repeatedAfterCountRef.current++;
            } else {
                repeatedAfterCountRef.current = 0;
                lastAfterRef.current = after;
            }

            if (repeatedAfterCountRef.current >= 5) {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    console.warn("Polling halted: repeated same 'after' param 5 times.");
                }
                return;
            }

            try {
                const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}`);
                if (!res.ok) throw new Error('Failed to fetch live events');

                const newData = await res.json();
                failureCountRef.current = 0;

                if (newData.entries && newData.entries.length > 0) {
                    setEventLog(prev => [...prev, ...newData.entries]);
                    setLastEvent(newData.entries[newData.entries.length - 1]);
                }

                if (newData.State === "Complete") {
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                }
            } catch (error) {
                console.error(error);
                failureCountRef.current++;
                if (failureCountRef.current >= 5) {
                    console.warn("Polling halted after repeated failures.");
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                }
            }
        }

        pollingRef.current = setInterval(poll, 6000);

        return () => {
            isMounted = false;
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [gameId]);


    function getBlockMetadata(message: string): { emoji?: string; title?: string, titleColor?: string, onClick?: () => void } | null {
        if (message.includes('Now batting')) {
            const match = message.match(/Now batting: (.+)/);
            const player = match ? match[1].split("(")[0].trim() : null;
            let emoji = null;
            if (player) {
                emoji = awayPlayers.includes(player) ? data.away_team_emoji : data.home_team_emoji;
                emoji = (data.away_team_emoji === data.home_team_emoji) ? awayPlayers.includes(player) ? emoji + "✈️" : emoji + "🏠" : emoji;
            }
            return player && emoji ? { emoji: emoji, titleColor: settings.useTeamColoredHeaders ? awayPlayers.includes(player) ? data.away_team_color : data.home_team_color : undefined, title: player, onClick: () => {setSelectedPlayer(player); setShowStats(true);} } : null;
        }

        if (message.includes('"')) return { emoji: '🤖', title: 'ROBO-UMP' };
        if (message.includes('mound visit')) return { emoji: '🚶', title: 'Mound Visit' };
        if (message.includes('7.') && message.includes(awayPlayers[0])) return { emoji: awayTeam.emoji, title: 'Away Lineup', titleColor: settings.useTeamColoredHeaders ? data.away_team_color : undefined };
        if (message.includes('7.') && message.includes(homePlayers[0])) return { emoji: homeTeam.emoji, title: 'Home Lineup', titleColor: settings.useTeamColoredHeaders ? data.home_team_color : undefined};
        if (message.includes('End') || message.includes('@') || message.includes('Start of the top of the 1st') || message.includes('Final score:')) return { emoji: 'ℹ️', title: 'Game Info' };

        return null;
    }

    function getEventMessageObject(event: Event): Event {
        if ((event.message.includes("homers") || event.message.includes("grand slam")) && !event.message.includes(`<strong>${event.batter} scores!`)) event.message += ` <strong>${event.batter} scores!</strong>`;
        if ((event.message.includes("scores") || event.message.includes("steals home"))&& !event.message.includes('Score is now ')) event.message += `<strong> Score is now ${event.away_score}-${event.home_score}</strong>`

        return {...event};
    }

    function groupEventLog(eventLog: Event[]): EventBlockGroup[] {
        const blocks: EventBlockGroup[] = [];
        let currentBlock: EventBlockGroup | null = null;

        eventLog.forEach((event) => {
            const meta = getBlockMetadata(event.message);
            const eventMessage = getEventMessageObject(event);

            if (meta) {
                currentBlock = { ...meta, messages: [eventMessage] };
                blocks.unshift(currentBlock); // Most recent events at top
            } else if (currentBlock) {
                if (event.message.includes("scores!") || event.message.includes("homers") || event.message.includes("grand slam") || event.message.includes("steals home")) currentBlock.color = "bg-theme-score";
                currentBlock.messages.unshift(eventMessage);
            } else {
                currentBlock = { messages: [eventMessage] };
                blocks.unshift(currentBlock);
            }
        });

        return blocks;
    }

    const groupedEvents = groupEventLog(eventLog);
    let currentQueue: string[] = [];
    let lastBases: Bases = { first: null, second: null, third: null }; 

<<<<<<< HEAD
const groupedEvents = groupEventLog(eventLog);
const playerNames = Array.from(new Set(eventLog.map(e => e.batter)));
let currentQueue: string[] = [];
let lastBases: {first: string | null, second: string | null, third: string | null} = { first: null, second: null, third: null }; 

for (const event of eventLog) {
  const result = ProcessMessage(event, playerNames, currentQueue);
  currentQueue = result.baseQueue;
  lastBases = result.bases;
  console.log(lastBases);
  console.log(players[lastBases.first ? lastBases.first : 0])
}

  return (
    <>
    <main className="mt-16">
      <CopiedPopup />
      <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto h-full">
        <GameHeader
          homeTeam={{
            id: data.HomeTeamID,
            name: data.HomeTeamName,
            emoji: data.HomeTeamEmoji,
            score: lastEvent.home_score,
            wins: homeTeam.Record["Regular Season"].Wins,
            losses: homeTeam.Record["Regular Season"].Losses,
            runDiff: homeTeam.Record["Regular Season"].RunDifferential,
            color: data.HomeTeamColor,
          }}
          awayTeam={{
            id: data.AwayTeamID,
            name: data.AwayTeamName,
            emoji: data.AwayTeamEmoji,
            score: lastEvent.away_score,
            wins: awayTeam.Record["Regular Season"].Wins,
            losses: awayTeam.Record["Regular Season"].Losses,
            runDiff: awayTeam.Record["Regular Season"].RunDifferential,
            color: data.AwayTeamColor,
          }}
          center={{
            icon: data.Weather.Emoji,
            title: data.Weather.Name,
            subtitle: data.Weather.Tooltip,
          }}
          inning={data.State != "Complete" ? (lastEvent.inning_side === 1 ? 'BOT' : 'TOP') + ' ' + lastEvent.inning : "FINAL"}
        />

        <GameStateDisplay
          balls={lastEvent.balls ?? 0}
          strikes={lastEvent.strikes ?? 0}
          outs={lastEvent.outs ?? 0}
          bases={{first: lastBases.first ? lastBases.first + ` (${getOPS(players[lastBases.first].Stats)} OPS)` : lastBases.first, second: lastBases.second ? lastBases.second + ` (${getOPS(players[lastBases.second].Stats)} OPS)` : lastBases.second, third: lastBases.third ? lastBases.third + ` (${getOPS(players[lastBases.third].Stats)} OPS)` : lastBases.third}}
          pitcher={{
            name: lastEvent.pitcher,
            stat: (lastEvent.pitcher !== "" && lastEvent.pitcher !== null) ? `(${getERA(players[lastEvent.pitcher].Stats)})` : "",
            onClick: () => {setSelectedPlayer(lastEvent.pitcher); setPlayerType('pitching'); setShowStats(true);},
          }}
          batter={{
            name: lastEvent.batter,
            stat: (lastEvent.batter !== "" && lastEvent.batter !== null) ? `(${getBA(players[lastEvent.batter].Stats)})` : "",
            onClick: () => {setSelectedPlayer(lastEvent.batter); setPlayerType('batting'); setShowStats(true);},
          }}
          onDeck={{
            name: lastEvent.on_deck,
            stat: (lastEvent.on_deck !== "" && lastEvent.on_deck !== null) ? `(${getBA(players[lastEvent.on_deck].Stats)})` : "",
            onClick: () => {setSelectedPlayer(lastEvent.on_deck); setPlayerType('batting'); setShowStats(true);},
          }}
        />
=======
    for (const event of eventLog) {
        const result = ProcessMessage(event, [...awayPlayers, ...homePlayers], currentQueue);
        currentQueue = result.baseQueue;
        lastBases = result.bases;
    }
>>>>>>> dcab695 (Proper Typing (sort of))

    return (
        <>
        <Navbar />
        <main className="mt-16">
        <CopiedPopup />
        <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto h-full">
            <GameHeader awayTeam={awayTeam} homeTeam={homeTeam} game={data} />

            <GameStateDisplay
                event={lastEvent}
                bases={{first: (lastBases.first && lastBases.first !== 'Unknown') ? lastBases.first + ` (${getOPS(players[lastBases.first].stats)} OPS)` : lastBases.first, second: (lastBases.second && lastBases.second !== 'Unknown') ? lastBases.second + ` (${getOPS(players[lastBases.second].stats)} OPS)` : lastBases.second, third: (lastBases.third && lastBases.third !== 'Unknown') ? lastBases.third + ` (${getOPS(players[lastBases.third].stats)} OPS)` : lastBases.third}}
                pitcher={{
                    player: lastEvent.pitcher ? players[lastEvent.pitcher] : null,
                    onClick: () => {setSelectedPlayer(lastEvent.pitcher); setPlayerType('pitching'); setShowStats(true);},
                }}
                batter={{
                    player: lastEvent.batter ? players[lastEvent.batter] : null,
                    onClick: () => {setSelectedPlayer(lastEvent.batter); setPlayerType('batting'); setShowStats(true);},
                }}
                onDeck={{
                    player: lastEvent.on_deck ? players[lastEvent.on_deck] : null,
                    onClick: () => {setSelectedPlayer(lastEvent.on_deck); setPlayerType('batting'); setShowStats(true);},
                }}
            />

            <>
            <div className="flex justify-between items-center mb-2 gap-2 mt-4">
                <button onClick={() => setShowStats(!showStats)} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
                <button onClick={() => setFollowLive(prev => !prev)} className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {followLive ? 'Unfollow Live' : 'Follow Live'}
                </button>
            </div>

            {(showStats && followLive) ? (<div className='grid grid-cols-2 gap-2 items-stretch h-full'>
                <PlayerStats player={lastEvent.pitcher ? players[lastEvent.pitcher] : ''} category='pitching' />
                <PlayerStats player={lastEvent.batter ? players[lastEvent.batter] : ''} category='batting' />
                </div>) : ''}
            {(showStats && !followLive) ? (<PlayerStats player={selectedPlayer ? players[selectedPlayer] : null} category={playerType} />) : ''}
            </>

            <div className="mt-6 space-y-4">
                {groupedEvents.map((block, idx) => (
                    <EventBlock key={idx} emoji={block.emoji} title={block.title} color={block.color} titleColor={block.titleColor} messages={block.messages} onClick={block.onClick ? block.onClick : undefined}/>
                ))}
            </div>

        </div>
        </main>
        </>
    );
}
