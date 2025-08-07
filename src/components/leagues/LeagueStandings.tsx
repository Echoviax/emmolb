// components/LeaguePage.tsx
'use client';
import { League } from "@/types/League";
import MiniTeamHeader from "../MiniTeamHeader";
import { PlaceholderTeam, Team } from "@/types/Team";
import { useMemo, useState } from "react";

export type LeagueStandingsProps = {
    league: League;
    teams: Team[];
    cutoff?: { winDiff: number, minTeams: number, gamesLeft: number, text: string },
    showIndex?: boolean;
    customElement?: (team: Team) => React.ReactNode;
}

type SortKey = 'wd' | 'rd' | 'gb';
type SortDirection = 'asc' | 'desc';

export function LeagueStandings({ league, teams, cutoff, showIndex, customElement }: LeagueStandingsProps) {
    const [sortKey, setSortKey] = useState<SortKey>('wd');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const sortedTeams = useMemo(() => {
        const sorted = [...teams];
        const leader: Team = sorted[0] ?? PlaceholderTeam;
        const gamesBehind = (team: Team) => (leader) ? (leader.record.regular_season.wins - team.record.regular_season.wins + team.record.regular_season.losses - leader.record.regular_season.losses) / 2 : null;
        sorted.sort((a, b) => {
            let aVal: number, bVal: number;

            switch (sortKey) {
                case 'wd':
                    aVal = a.record.regular_season.wins - a.record.regular_season.losses;
                    bVal = b.record.regular_season.wins - b.record.regular_season.losses;
                    break;
                case 'rd':
                    aVal = a.record.regular_season.run_differential;
                    bVal = b.record.regular_season.run_differential;
                    break;
                case 'gb':
                    aVal = gamesBehind(a) ?? 100;
                    bVal = gamesBehind(b) ?? 0;
                    break;
                default:
                    aVal = 0;
                    bVal = 0;
            }

            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    }, [teams, sortKey, sortDirection]);

    if (!league || !teams.length) return (<div className="text-white text-center mt-10">Can't find that league</div>);
    const columnWidths = [14, 8, 10, 8];

    let cutoffIndex: number;
    if (cutoff) {
        const worstCaseTopTeam = cutoff.winDiff - cutoff.gamesLeft;
        cutoffIndex = teams.findIndex(team => (((team.record.regular_season.wins + cutoff.gamesLeft) - team.record.regular_season.losses) < (worstCaseTopTeam)));
        if (cutoffIndex !== -1)
            cutoffIndex = Math.max(cutoffIndex, cutoff.minTeams);
    }

    return <div className="flex flex-col justify-center gap-2">
        <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
            <div className={`ml-1 w-${columnWidths[0]} text-right`}>
                Record
            </div>
            <div className={`ml-1 w-${columnWidths[1]} text-right cursor-pointer`} onClick={() => toggleSort('wd')}>
                WD {sortKey === 'wd' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </div>
            <div className={`ml-1 w-${columnWidths[2]} text-right cursor-pointer`} onClick={() => toggleSort('rd')}>
                RD {sortKey === 'rd' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </div>
            <div className={`ml-1 w-${columnWidths[3]} text-right cursor-pointer`} onClick={() => toggleSort('gb')}>
                GB {sortKey === 'gb' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </div>
        </div>
        {sortedTeams.map((team: any, index) => (
            <div key={team.id || index}>
                {index === cutoffIndex && (
                    <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                        <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                            {cutoff?.text}
                        </div>
                        <div className="flex-grow border-t-2 border-theme-text"></div>
                    </div>
                )}
                <MiniTeamHeader team={team} leader={teams[0]} index={showIndex ? index + 1 : undefined} columnWidths={columnWidths} />
                {customElement && customElement(team)}
            </div>
        ))}
    </div>;
}
