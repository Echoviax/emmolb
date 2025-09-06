import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef, PlayerStatsTable, Season, selectSum } from "./PlayerStatsTables";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePersistedState } from "@/hooks/PersistedState";

export type PitchingStats = Pick<PlayerStats,
    'appearances' |
    'batters_faced' |
    'blown_saves' |
    'complete_games' |
    'earned_runs' |
    'hit_batters' |
    'hits_allowed' |
    'home_runs_allowed' |
    'losses' |
    'no_hitters' |
    'outs' |
    'pitches_thrown' |
    'quality_starts' |
    'saves' |
    'shutouts' |
    'strikeouts' |
    'walks' |
    'wins'
>

type PitchingExtendedStats = {
    balks: number;
    singles: number;
    doubles: number;
    triples: number;
    sac_flies: number;
    sacrifice_double_plays: number;
}

const PitchingTableColumns: ColumnDef<PitchingStats>[] = [
    {
        name: 'GP',
        description: 'Games Played',
        numerator: stats => stats.appearances,
    },
    {
        name: 'IP',
        description: 'Innings Pitched',
        numerator: stats => stats.outs,
        format: value => `${Math.floor(value / 3).toLocaleString('en-US')}.${value % 3}`,
    },
    {
        name: 'W',
        description: 'Wins',
        numerator: stats => stats.wins,
    },
    {
        name: 'L',
        description: 'Losses',
        numerator: stats => stats.losses,
    },
    {
        name: 'SV',
        description: 'Saves',
        numerator: stats => stats.saves,
    },
    {
        name: 'BS',
        description: 'Blown Saves',
        numerator: stats => stats.blown_saves,
    },
    {
        name: 'ER',
        description: 'Earned Runs',
        numerator: stats => stats.earned_runs,
    },
    {
        name: 'H',
        description: 'Hits Allowed',
        numerator: stats => stats.hits_allowed,
    },
    {
        name: 'HR',
        description: 'Home Runs Allowed',
        numerator: stats => stats.home_runs_allowed,
    },
    {
        name: 'K',
        description: 'Strikeouts',
        numerator: stats => stats.strikeouts,
    },
    {
        name: 'HB',
        description: 'Hit Batters',
        numerator: stats => stats.hit_batters,
    },
    {
        name: 'BB',
        description: 'Walks',
        numerator: stats => stats.walks,
    },
    {
        name: 'ERA',
        description: 'Earned Run Average',
        numerator: stats => stats.earned_runs,
        divisor: stats => stats.outs,
        format: value => (value * 27).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'WHIP',
        description: 'Walks and Hits per Inning Pitched',
        numerator: stats => stats.walks + stats.hits_allowed,
        divisor: stats => stats.outs,
        format: value => (value * 3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'H/9',
        description: 'Hits Allowed per 9 Innings',
        numerator: stats => stats.hits_allowed,
        divisor: stats => stats.outs,
        format: value => (value * 27).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'HR/9',
        description: 'Home Runs Allowed per 9 Innings',
        numerator: stats => stats.home_runs_allowed,
        divisor: stats => stats.outs,
        format: value => (value * 27).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'K/9',
        description: 'Strikeouts per 9 Innings',
        numerator: stats => stats.strikeouts,
        divisor: stats => stats.outs,
        format: value => (value * 27).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'BB/9',
        description: 'Walks per 9 Innings',
        numerator: stats => stats.walks,
        divisor: stats => stats.outs,
        format: value => (value * 27).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
];

const PitchingExtendedTableColumns: ColumnDef<PitchingStats & PitchingExtendedStats>[] = [
    {
        name: 'BF',
        description: 'Batters Faced',
        numerator: stats => stats.batters_faced,
    },
    {
        name: 'P/BF',
        description: 'Pitches Thrown / Batters Faced',
        numerator: stats => stats.pitches_thrown,
        divisor: stats => stats.batters_faced,
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'P/I',
        description: 'Pitches Thrown / Inning',
        numerator: stats => stats.pitches_thrown,
        divisor: stats => stats.outs,
        format: value => (value * 3).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'HB/9',
        description: 'Hit Batters per 9 Innings',
        numerator: stats => stats.hit_batters,
        divisor: stats => stats.outs,
        format: value => (value * 27).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'K/BB',
        description: 'Strikeouts / Walks',
        numerator: stats => stats.strikeouts,
        divisor: stats => stats.walks,
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
        name: 'QS',
        description: 'Quality Starts',
        numerator: stats => stats.quality_starts,
    },
    {
        name: 'CG',
        description: 'Complete Games',
        numerator: stats => stats.complete_games,
    },
    {
        name: 'SHO',
        description: 'Shutouts',
        numerator: stats => stats.shutouts,
    },
    {
        name: 'NH',
        description: 'No Hitters',
        numerator: stats => stats.no_hitters,
    },
    {
        name: 'BK',
        description: 'Balks',
        numerator: stats => stats.balks,
    },
    {
        name: 'OOPS',
        description: 'Opponent On Base Plus Slugging',
        numerator(stats) {
            const ab = stats.batters_faced - stats.walks - stats.hit_batters - stats.sac_flies;
            if (!ab) return undefined;

            return (stats.hits_allowed + stats.walks + stats.hit_batters) / (ab + stats.walks + stats.hit_batters + stats.sac_flies) + (stats.singles + 2 * stats.doubles + 3 * stats.triples + 4 * stats.home_runs_allowed) / ab;
        },
        aggregate(_, stats) {
            const ab = selectSum(stats, x => x.batters_faced - x.walks - x.hit_batters);
            if (!ab) return undefined;

            return selectSum(stats, x => x.hits_allowed + x.walks + x.hit_batters) / (ab + selectSum(stats, x => x.walks + x.hit_batters + x.sac_flies))
                + selectSum(stats, x => x.singles + 2 * x.doubles + 3 * x.triples + 4 * x.home_runs_allowed) / ab;
        },
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    },
];

function PitchingExtendedStatsTable({ playerId, data }: { playerId: string, data: (Season & PitchingStats)[] }) {
    const { data: mmolbStats } = useQuery({
        queryKey: ['player-mmolb-stats-pitching', playerId],
        queryFn: async () => {
            const res = await fetch(`/nextapi/player/${playerId}/mmolb-stats/pitching`);
            if (!res.ok) throw new Error('Failed to load player stats');
            return await res.json() as (Season & PitchingExtendedStats)[];
        },
        staleTime: 60 * 60 * 1000,
        select: stats => Object.fromEntries(stats.map(x => [x.season, x])),
    });

    const extendedStats = useMemo(() => data.map(stats => ({
        ...stats,
        ...mmolbStats?.[stats.season],
    } as Season & PitchingStats & PitchingExtendedStats)), [data, mmolbStats]);

    return <PlayerStatsTable columns={PitchingExtendedTableColumns} stats={extendedStats} />;
}

export function PitchingStatsTable({ playerId, data }: { playerId: string, data: (Season & PitchingStats)[] }) {
    const [showExtendedStats, setShowExtendedStats] = usePersistedState('playerStats_showExpandedPitchingStats', false);

    const pitchingStats = useMemo(() => data.filter(stats => stats.appearances > 0), [data]);

    if (pitchingStats.length == 0)
        return null;

    return (
        <div className="flex flex-col gap-2 items-start max-w-full">
            <h2 className="text-xl font-bold ml-1">Pitching</h2>
            <PlayerStatsTable columns={PitchingTableColumns} stats={pitchingStats} />
            <h2 className="text-xl font-bold ml-1 mt-4 cursor-pointer" onClick={() => setShowExtendedStats(prev => !prev)}>
                <span className="mr-2">{showExtendedStats ? '▾' : '▸'}</span>
                <span>Pitching Extended</span>
            </h2>
            {showExtendedStats && <PitchingExtendedStatsTable playerId={playerId} data={pitchingStats} />}
        </div>
    );
}

