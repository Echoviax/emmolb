import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef, PlayerStatsTable, Season, selectSum } from "./PlayerStatsTables";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePersistedState } from "@/hooks/PersistedState";

export type BattingStats = Pick<PlayerStats,
    'at_bats' |
    'caught_stealing' |
    'doubles' |
    'grounded_into_double_play' |
    'hit_by_pitch' |
    'home_runs' |
    'plate_appearances' |
    'runs' |
    'runs_batted_in' |
    'sac_flies' |
    'sacrifice_double_plays' |
    'singles' |
    'stolen_bases' |
    'struck_out' |
    'triples' |
    'walked'
>

type BattingDerivedStats = {
    hits: number;
    totalBases: number;
}

type BattingExtendedStats = {
    pitches_seen: number;
}

const BattingTableColumns: ColumnDef<BattingStats & BattingDerivedStats>[] = [
    {
        name: 'PA',
        description: 'Plate Appearances',
        numerator: stats => stats.plate_appearances,
    },
    {
        name: 'R',
        description: 'Runs',
        numerator: stats => stats.runs,
    },
    {
        name: 'H',
        description: 'Hits',
        numerator: stats => stats.hits,
    },
    {
        name: 'HR',
        description: 'Home Runs',
        numerator: stats => stats.home_runs,
    },
    {
        name: 'HBP',
        description: 'Hit By Pitch',
        numerator: stats => stats.hit_by_pitch,
    },
    {
        name: 'BB',
        description: 'Walks',
        numerator: stats => stats.walked,
    },
    {
        name: 'BB%',
        description: 'Walks / Plate Appearences',
        numerator: stats => stats.walked,
        divisor: stats => stats.plate_appearances,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'SO',
        description: 'Strikeouts',
        numerator: stats => stats.struck_out,
    },
    {
        name: 'SO%',
        description: 'Strikeouts / Plate Appearences',
        numerator: stats => stats.struck_out,
        divisor: stats => stats.plate_appearances,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'BA',
        description: 'Batting Average',
        numerator: stats => stats.hits,
        divisor: stats => stats.at_bats,
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    },
    {
        name: 'OBP',
        description: 'On Base Percentage',
        numerator: stats => stats.hits + stats.walked + stats.hit_by_pitch,
        divisor: stats => stats.plate_appearances,
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    },
    {
        name: 'SLG',
        description: 'Slugging Percentage',
        numerator: stats => stats.totalBases,
        divisor: stats => stats.at_bats,
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    },
    {
        name: 'OPS',
        description: 'On Base Plus Slugging',
        numerator(stats) {
            const pa = stats.plate_appearances;
            const ab = stats.at_bats;
            if (!ab || !pa) return undefined;

            return (stats.hits + stats.walked + stats.hit_by_pitch) / pa + stats.totalBases / ab;
        },
        aggregate(_, stats) {
            const pa = selectSum(stats, x => x.plate_appearances);
            const ab = selectSum(stats, x => x.at_bats);
            if (!ab || !pa) return undefined;

            return selectSum(stats, x => x.hits + x.walked + x.hit_by_pitch) / pa
                + selectSum(stats, x => x.totalBases) / ab;
        },
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    },
    {
        name: 'SB',
        description: 'Stolen Bases',
        numerator: stats => stats.stolen_bases,
    },
    {
        name: 'CS',
        description: 'Caught Stealing',
        numerator: stats => stats.caught_stealing,
    },
    {
        name: 'SB%',
        description: 'Stolen Bases / Attempts',
        numerator: stats => stats.stolen_bases,
        divisor: stats => stats.stolen_bases + stats.caught_stealing,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
];

const BattingExtendedTableColumns: ColumnDef<BattingStats & BattingDerivedStats & BattingExtendedStats>[] = [
    {
        name: 'AB',
        description: 'At Bats',
        numerator: stats => stats.at_bats,
    },
    {
        name: 'P/PA',
        description: 'Pitches / Plate Appearance',
        numerator: stats => stats.pitches_seen,
        divisor: stats => stats.plate_appearances,
        format: value => value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'RBI',
        description: 'Runs Batted In',
        numerator: stats => stats.runs_batted_in,
    },
    {
        name: '2B',
        description: 'Doubles',
        numerator: stats => stats.doubles,
    },
    {
        name: '3B',
        description: 'Triples',
        numerator: stats => stats.triples,
    },
    {
        name: 'TB',
        description: 'Total Bases',
        numerator: stats => stats.totalBases,
    },
    {
        name: 'GIDP',
        description: 'Grounded into Double Plays',
        numerator: stats => stats.grounded_into_double_play,
    },
    {
        name: 'SH',
        description: 'Sacrifice Bunts',
        numerator: stats => stats.sacrifice_double_plays,
    },
    {
        name: 'SF',
        description: 'Sacrifice Flies',
        numerator: stats => stats.sac_flies,
    },
];

function BattingExtendedStatsTable({ playerId, data }: { playerId: string, data: (Season & BattingStats & BattingDerivedStats)[] }) {
    const { data: mmolbStats } = useQuery({
        queryKey: ['player-mmolb-stats-batting', playerId],
        queryFn: async () => {
            const res = await fetch(`/nextapi/player/${playerId}/mmolb-stats/batting`);
            if (!res.ok) throw new Error('Failed to load player stats');
            return await res.json() as (Season & BattingExtendedStats)[];
        },
        staleTime: 60 * 60 * 1000,
        select: stats => Object.fromEntries(stats.map(x => [x.season, x])),
    });

    const extendedStats = useMemo(() => data.map(stats => ({
        ...stats,
        ...mmolbStats?.[stats.season],
    } as Season & BattingStats & BattingDerivedStats & BattingExtendedStats)), [data, mmolbStats]);

    return <PlayerStatsTable columns={BattingExtendedTableColumns} stats={extendedStats} />;
}

export function BattingStatsTable({ playerId, data }: { playerId: string, data: (Season & BattingStats)[] }) {
    const [showExtendedStats, setShowExtendedStats] = usePersistedState('playerStats_showExpandedBattingStats', false);

    const battingStats = useMemo(() => data.filter(stats => stats.plate_appearances > 0).map(stats => ({
        ...stats,
        hits: stats.singles + stats.doubles + stats.triples + stats.home_runs,
        totalBases: stats.singles + 2 * stats.doubles + 3 * stats.triples + 4 * stats.home_runs,
    } as Season & BattingStats & BattingDerivedStats)), [data]);

    if (battingStats.length == 0)
        return null;

    return (
        <div className="flex flex-col gap-2 items-start max-w-full">
            <h2 className="text-xl font-bold ml-1">Batting</h2>
            <PlayerStatsTable columns={BattingTableColumns} stats={battingStats} />
            <h2 className="text-xl font-bold ml-1 mt-4 cursor-pointer" onClick={() => setShowExtendedStats(prev => !prev)}>
                <span className="mr-2">{showExtendedStats ? '▾' : '▸'}</span>
                <span>Batting Extended</span>
            </h2>
            {showExtendedStats && <BattingExtendedStatsTable playerId={playerId} data={battingStats} />}
        </div>
    );
}
