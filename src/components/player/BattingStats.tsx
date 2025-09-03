import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef, PlayerStatsTable, Season, selectSum } from "./PlayerStatsTables";
import { useMemo } from "react";

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

export function BattingStatsTable({ data }: { data: (Season & BattingStats)[] }) {
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
        </div>
    );
}
