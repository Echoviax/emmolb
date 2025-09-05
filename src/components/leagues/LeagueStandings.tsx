// components/LeaguePage.tsx
'use client';
import { League } from "@/types/League";
import MiniTeamHeader from "../MiniTeamHeader";
import { PlaceholderTeam, Team } from "@/types/Team";
import { useEffect, useMemo, useState } from "react";
import { useMmolbTime } from "@/hooks/api/Time";
import sql from "@/lib/mmoldb";

export type LeagueStandingsProps = {
    league: League;
    teams: Team[];
    cutoff?: { winDiff: number, minTeams: number, gamesLeft: number, text: string },
    showIndex?: boolean;
    customElement?: (team: Team) => React.ReactNode;
    hideInactive?: boolean;
}

type HistoricTeam = {
    mmolb_team_id: string; 
    season: number; 
    run_diff: string;
    wins: string;
    losses: string;
}

type SortKey = 'wd' | 'rd' | 'gb';
type SortDirection = 'asc' | 'desc';

export function LeagueStandings({ league, teams, cutoff, showIndex, customElement, hideInactive=false }: LeagueStandingsProps) {
    const { data: time } = useMmolbTime({});
    const [season, setSeason] = useState<number>(time?.seasonNumber ?? 0);
    const [sortKey, setSortKey] = useState<SortKey>('wd');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [historicGames, setHistoricGames] = useState<HistoricTeam[]>([]);

    useEffect(() => {
        if (time?.seasonNumber !== undefined) {
            setSeason(time.seasonNumber);
        }
    }, [time?.seasonNumber]);

    const teamIDs = useMemo(() => {
        return teams.map((team: Team) => team.id);
    }, [teams]);
    useEffect(() => {
        async function fetchStuff() {
            const res = await fetch(`/nextapi/historic-games?ids=${teamIDs.join(",")}`);
            const data = await res.json();
            setHistoricGames(data);
        }
        fetchStuff();
    }, [teamIDs]);

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const sortedTeams = useMemo(() => {
        let teamsForDisplay;

        if (season === time?.seasonNumber) {
            teamsForDisplay = [...teams];
        } else {
            teamsForDisplay = teams.map(team => {
                const historicRecord = historicGames.find(hg => hg.season === season && hg.mmolb_team_id === team.id);
                const wins = parseInt(historicRecord?.wins || '0', 10);
                const losses = parseInt(historicRecord?.losses || '0', 10);
                const run_diff = parseInt(historicRecord?.run_diff || '0', 10);

                return {
                    ...team,
                    record: {
                        regular_season: {
                            wins: wins,
                            losses: losses,
                            run_differential: run_diff,
                        }
                    }
                };
            });
        }

        if (teamsForDisplay.length === 0) return [];

        const leader = [...teamsForDisplay].sort((a, b) => (b.record.regular_season.wins - b.record.regular_season.losses) - (a.record.regular_season.wins - a.record.regular_season.losses))[0];

        const gamesBehind = (team: Team) => {
            if (!leader) return 0;
            return (leader.record.regular_season.wins - team.record.regular_season.wins + team.record.regular_season.losses - leader.record.regular_season.losses) / 2;
        };

        teamsForDisplay.sort((a, b) => {
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
                    aVal = gamesBehind(a);
                    bVal = gamesBehind(b);
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                default:
                    aVal = 0; bVal = 0;
            }
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return hideInactive ? teamsForDisplay.filter((team) => team.record.regular_season.wins + team.record.regular_season.losses !== 0) : teamsForDisplay;
    }, [teams, sortKey, sortDirection, season, time, historicGames, hideInactive]);

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
        <div className="flex justify-between">
            <select className='text-sm bg-(--theme-primary) p-1 rounded-sm' value={season} onChange={evt => setSeason(Number(evt.target.value))}>
                {[...[...Array((time?.seasonNumber ?? 0) + 1)].keys()].map((season: number) => <option key={season} value={season}>Season {season}</option>)}
            </select>
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
        </div>
        {sortedTeams.map((team: any, index) => (
            <div key={team.id || index}>
                {index === (time && season === time.seasonNumber ? cutoffIndex : 1) && (
                    <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                        <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                            {cutoff?.text}
                        </div>
                        <div className="flex-grow border-t-2 border-theme-text"></div>
                    </div>
                )}
                <MiniTeamHeader team={team} leader={sortedTeams[0]} index={showIndex ? index + 1 : undefined} columnWidths={columnWidths} />
                {customElement && customElement(team)}
            </div>
        ))}
    </div>;
}
