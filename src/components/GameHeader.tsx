'use client'
import React from 'react'
import { WeatherInfo } from './WeatherInfo'
import { useRouter } from 'next/navigation'
import { getContrastTextColor } from '@/helpers/ColorHelper'
import { Team } from '@/types/Team'
import { Game } from '@/types/Game'
import { Event } from '@/types/Event'
import { DayGame } from '@/types/DayGame'
import { CashewsGame } from '@/types/FreeCashews'
import { isGameComplete } from '@/hooks/api/LiveEvents'
import { useTeamsCorruptedPlayers } from '@/hooks/api/Team'

type GameHeaderProps = {
    game: Game | DayGame;
    homeTeam?: Team;
    awayTeam?: Team;
    event?: Event;
    historicGames?: CashewsGame[];
    killLinks?: boolean;
}

export function GameHeader({ homeTeam, awayTeam, game, historicGames, event, killLinks = false }: GameHeaderProps) {
    const {data: teamsCorruptedPlayers} = useTeamsCorruptedPlayers({
        enabled: game.weather.name === 'Wither'
    });
    const router = useRouter();
    const isFullGame = 'event_log' in game;
    const lastEvent = event ? event :
                        isFullGame ? 
                            game.event_log[game.event_log.length - 1] 
                            : null;
    const stadium = isFullGame ? game.event_log[0].message.split("@ ")[1] : null;

    historicGames = historicGames?.filter((g: CashewsGame) => [g.away_team_id, g.home_team_id].includes(game.home_team_id) && [g.away_team_id, g.home_team_id].includes(game.away_team_id));
    historicGames = historicGames?.filter((g: CashewsGame) => g.state === 'Complete');
    const homeWins = historicGames?.filter((g: CashewsGame) => (game.home_team_id === g.home_team_id && g.last_update.home_score > g.last_update.away_score) || (game.away_team_id === g.away_team_id && g.last_update.away_score > g.last_update.home_score)).length;

    return (
        <div className="rounded-xl shadow-xl overflow-visible mb-6 border-3 border-theme-accent" style={{background: `linear-gradient(60deg, #${game.away_team_color} 36%, rgb(12, 17, 27) 50%, rgb(12, 17, 27) 50%, #${game.home_team_color} 64%)`}}>
            <div className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(100px,1fr)] items-center gap-x-2 px-2 py-3 w-full">
                <div className="flex items-center px-1 py-2 min-h-[54px] md:min-h-[88px]" style={{ color: getContrastTextColor(game.away_team_color) || 'rgb(0,0,0)' }}>
                    <div className="text-xl md:text-3xl font-bold md:mr-2 min-w-[2rem] text-center">
                        {isFullGame ? lastEvent?.away_score : game.away_team_runs}
                    </div>
                    <div className="text-xl md:text-4xl">
                        {game.away_team_emoji}
                    </div>
                    <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer" onClick={(e) => {e.stopPropagation(); if (!killLinks) router.push(`/team/${game.away_team_id}`);}}>
                        {game.away_team_name}
                        {awayTeam ? <div className="text-[10px] md:text-sm font-normal mt-0.5">
                            <span className='opacity-70'>
                                {awayTeam.record.regular_season.wins}–{awayTeam.record.regular_season.losses} ({awayTeam.record.regular_season.run_differential >= 0 ? '+' : ''}{awayTeam.record.regular_season.run_differential})
                            </span>
                            {game.weather.name === 'Wither' && teamsCorruptedPlayers && teamsCorruptedPlayers[awayTeam.id] && (
                                <>
                                    <span className='text-base text-shadow-sm/50 ml-1'>🫀</span>
                                    <span className='font-semibold opacity-70'>{teamsCorruptedPlayers[awayTeam.id]}</span>
                                </>
                            )}
                        </div> : null}
                    </div>
                </div>

                <div className="flex items-center justify-center px-4 text-white text-center min-h-[54px] md:min-h-[88px] relative">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-2">
                            <WeatherInfo weather={game.weather} />
                            {stadium ? <WeatherInfo weather={{ emoji: "🏟️", name: stadium, tooltip: '' }} /> : null}
                        </div>
                        <div className="text-base text-white md:text-lg font-bold leading-tight">
                            {isFullGame ?
                                game.state !== "Complete" && !isGameComplete(lastEvent) ? (lastEvent?.inning_side === 1 ? "BOT " : "TOP ") + lastEvent?.inning : "FINAL"
                                :
                                game.status
                            }
                        </div>
                        {historicGames ? <div className="text-base text-white md:text-lg font-bold leading-tight">
                            {historicGames.length-homeWins!}-{homeWins}
                        </div> : null}
                    </div>
                </div>

                <div className="flex items-center justify-end px-1 py-2 min-h-[54px] md:min-h-[88px]" style={{ color: getContrastTextColor(game.home_team_color) || 'rgb(0,0,0)' }}>
                    <div className="text-xs md:text-xl font-semibold whitespace-normal leading-snug text-center cursor-pointer" onClick={(e) => {e.stopPropagation(); if (!killLinks) router.push(`/team/${game.home_team_id}`);}}>
                        {game.home_team_name}
                        {homeTeam ? <div className="text-[10px] md:text-sm font-normal mt-0.5 opacity-70">
                            {homeTeam.record.regular_season.wins}–{homeTeam.record.regular_season.losses} ({homeTeam.record.regular_season.run_differential >= 0 ? '+' : ''}{homeTeam.record.regular_season.run_differential})
                        </div> : null}
                    </div>
                    <div className="text-xl md:text-4xl">
                        {game.home_team_emoji}
                    </div>
                    <div className="text-xl md:text-3xl font-bold md:ml-2 min-w-[2rem] text-center">
                        {isFullGame ? lastEvent?.home_score : game.home_team_runs}
                    </div>
                </div>
            </div>
        </div>
    )
}