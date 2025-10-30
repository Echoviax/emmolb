'use client'
import React from 'react'
import { getContrastTextColor } from '@/helpers/ColorHelper'
import { Team } from '@/types/Team'
import { GameStats } from '@/types/GameStats'
import { Event } from '@/types/Event'

interface ExpandedScoreboardProps {
    gameStats: GameStats,
    lastEvent: Event,
    awayTeam: Team,
    homeTeam: Team
}

export function ExpandedScoreboard({ gameStats, lastEvent, awayTeam, homeTeam }: ExpandedScoreboardProps) {
    const innings = Array.from({ length: Math.max(gameStats.away.runsByInning.length, 9) }, (element, index) => index);

    return (
        <div className='flex justify-center'>
            <table className='table table-auto -mt-2 mb-4'>
                <thead className='table-header-group'>
                    <tr className='table-row font-semibold text-sm uppercase'>
                        <th className='table-cell'></th>
                        {innings.map(index =>
                            <th key={index} className={`table-cell bg-(--theme-primary) text-center ${index == innings.length - 1 ? 'px' : 'pl'}-3 py-1 ${index == 0 ? 'rounded-tl-md' : ''}`}>
                                {index + 1}
                            </th>
                        )}
                        <th className='table-cell bg-(--theme-primary) text-center pl-3 py-1 border-l border-(--theme-text)/50'>R</th>
                        <th className='table-cell bg-(--theme-primary) text-center pl-3 py-1'>H</th>
                        <th className='table-cell bg-(--theme-primary) text-center pl-3 py-1'>E</th>
                        <th className='table-cell bg-(--theme-primary) text-center pl-3 pr-2 py-1 rounded-tr-md'>LOB</th>
                    </tr>
                </thead>
                <tbody className='table-row-group'>
                    <tr className='table-row text-base'>
                        <td className='table-cell px-2 pt-1 font-bold rounded-tl-md' style={{ background: `linear-gradient(to right, #${awayTeam.color} 95%, var(--theme-primary))`, color: getContrastTextColor(awayTeam.color) || 'rgb(0,0,0)' }}>
                            <span className='mr-1'>{awayTeam.emoji}</span> {gameStats.away.teamAbbreviation}
                        </td>
                        {innings.map(index => {
                            const runs = index < gameStats.away.runsByInning.length ? gameStats.away.runsByInning[index] : '';
                            return <td key={index} className={`table-cell bg-(--theme-primary) text-center border-t border-(--theme-text)/50 ${index == innings.length - 1 ? 'px' : 'pl'}-3 pt-1`}>
                                <span className={`${runs == 0 ? 'opacity-60' : ''}`}>{runs}</span>
                            </td>
                        })}
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold border-t border-(--theme-text)/50 pl-3 pt-1 border-l'>{lastEvent.away_score}</td>
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold border-t border-(--theme-text)/50 pl-3 pt-1'>{gameStats.away.hits}</td>
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold border-t border-(--theme-text)/50 pl-3 pt-1'>{gameStats.away.errors}</td>
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold border-t border-(--theme-text)/50 pl-3 pr-2 pt-1'>{gameStats.away.leftOnBase}</td>
                    </tr>
                    <tr className='table-row'>
                        <td className='table-cell px-2 pt-1 pb-0.5 font-bold rounded-bl-md' style={{ background: `linear-gradient(to right, #${homeTeam.color} 95%, var(--theme-primary))`, color: getContrastTextColor(homeTeam.color) || 'rgb(0,0,0)' }}>
                            <span className='mr-1'>{homeTeam.emoji}</span> {gameStats.home.teamAbbreviation}
                        </td>
                        {innings.map(index => {
                            const runs = index < gameStats.home.runsByInning.length ? gameStats.home.runsByInning[index] : '';
                            return <td key={index} className={`table-cell bg-(--theme-primary) text-center ${index == innings.length - 1 ? 'px' : 'pl'}-3 pt-1 pb-0.5`}>
                                <span className={`${runs == 0 ? 'opacity-60' : ''}`}>{runs}</span>
                            </td>
                        } )}
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold pl-3 pt-1 pb-0.5 border-l border-(--theme-text)/50'>{lastEvent.home_score}</td>
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold pl-3 pt-1 pb-0.5'>{gameStats.home.hits}</td>
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold pl-3 pt-1 pb-0.5'>{gameStats.home.errors}</td>
                        <td className='table-cell bg-(--theme-primary) text-center font-semibold pl-3 pr-2 pt-1 pb-0.5 rounded-br-md'>{gameStats.home.leftOnBase}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
