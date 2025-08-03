'use client'
import { Game } from '@/types/Game';
import { getContrastTextColor } from '@/helpers/ColorHelper';
import { getSpecialEventColor, getSpecialEventType } from './LiveGame';
import { useGameLiveEvents } from '@/hooks/api/Live';

const maxRecentEvents = 6;

type LiveGameTinyProps = {
    gameId: string;
    game: Game;
}

function baseStyles(active: boolean) {
    return `absolute w-2.5 h-2.5 rotate-45 transition-opacity duration-500 ${active ? 'opacity-90 bg-theme-text' : 'opacity-20 bg-theme-text'}`;
}

function renderCircles(count: number, max: number) {
    return Array.from({ length: max }).map((_, i) => (
        <div
            key={i}
            className={`w-2 h-2 rounded-full bg-theme-text ${i < count ? 'opacity-90' : 'opacity-20'}`}
        />
    ));
}

export function LiveGameTiny({ gameId, game }: LiveGameTinyProps) {
    const {eventLog: recentEvents, isComplete} = useGameLiveEvents({ gameId, initialState: game.event_log, pollingFrequency: 15000, maxEvents: maxRecentEvents });
    const event = recentEvents.length > 0 ? recentEvents[recentEvents.length - 1] : null;

    const bases = event && {
        first: event.on_1b,
        second: event.on_2b,
        third: event.on_3b,
    }

    const specialEventColor = (!isComplete && recentEvents.length > 0)
        ? getSpecialEventColor(recentEvents.map(getSpecialEventType).reduce((prev, current) => ({
            isWeatherEvent: prev.isWeatherEvent || current.isWeatherEvent,
            isScore: prev.isScore || current.isScore,
            isEjection: prev.isEjection || current.isEjection,
        }), {}))
        : undefined;

    return (<>
        <div className='w-38 h-16 relative rounded-xl' style={{ background: specialEventColor || 'var(--theme-primary)' }}>
            <div className='grid grid-rows-2 absolute size-full'>
                <div className='row-1 rounded-t-xl' style={{ background: `linear-gradient(120deg, #${game.away_team_color} 55%, #00000000 65%)` }}></div>
                <div className='row-2 rounded-b-xl' style={{ background: `linear-gradient(60deg, #${game.home_team_color} 55%, #00000000 65%)` }}></div>
            </div>
            {event &&
                <div className='flex justify-between absolute items-stretch size-full p-2'>
                    <div className='justify-self-start grid grid-rows-2 gap-x-1 gap-y-4 text-xs font-semibold items-center'>
                        <div className='row-1 col-1 w-13 truncate' style={{ color: getContrastTextColor(game.away_team_color) || 'rgb(0,0,0)' }}>
                            <span className='text-sm text-shadow-sm/20'>{game.away_team_emoji}</span> {game?.away_team_abbreviation}
                        </div>
                        <div className='row-2 col-1 w-13 truncate' style={{ color: getContrastTextColor(game.home_team_color) || 'rgb(0,0,0)' }}>
                            <span className='text-sm text-shadow-sm/20'>{game.home_team_emoji}</span> {game?.home_team_abbreviation}
                        </div>
                        <div className='row-1 col-2 text-base text-center w-5 pt-0.5' style={{ color: getContrastTextColor(game.away_team_color) || 'rgb(0,0,0)' }}>
                            {event.away_score}
                        </div>
                        <div className='row-2 col-2 text-base text-center w-5 pt-0.5' style={{ color: getContrastTextColor(game.home_team_color) || 'rgb(0,0,0)' }}>
                            {event.home_score}
                        </div>
                    </div>
                    {bases && !isComplete &&
                        <div className='flex flex-col justify-center w-10'>
                            <div className="relative w-6 h-6 mx-auto">
                                <div>
                                    <div
                                        className={baseStyles(!!bases.second)}
                                        style={{
                                            left: 'calc(50% - 3px)',
                                            top: 'calc(20% + 3px)',
                                            transform: 'translate(-50%, -50%) rotate(90deg)',
                                        }}
                                    />
                                </div>
                                <div>
                                    <div
                                        className={baseStyles(!!bases.first)}
                                        style={{
                                            left: 'calc(90% - 3px)',
                                            top: 'calc(60% + 3px)',
                                            transform: 'translate(-50%, -50%) rotate(90deg)',
                                        }}
                                    />

                                </div>
                                <div>
                                    <div
                                        className={baseStyles(!!bases.third)}
                                        style={{
                                            left: 'calc(10% - 3px)',
                                            top: 'calc(60% + 3px)',
                                            transform: 'translate(-50%, -50%) rotate(90deg)',
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex ml-1 mt-1 justify-center space-x-1">{renderCircles(event.outs, 2)}</div>
                        </div>
                    }
                    <div className='justify-self-end grid grid-rows-3 text-xs text-center font-semibold uppercase'>
                        <div className='row-1'>{!isComplete && event.inning_side === 0 && '▲'}</div>
                        <div className='row-2'>
                            {!isComplete ? event.inning : (event.inning > 9 ? `F/${event.inning}` : 'FINAL')}
                        </div>
                        <div className='row-3'>{!isComplete && event.inning_side === 1 && '▼'}</div>
                    </div>
                </div>
            }
        </div>
    </>);
}