import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef, PlayerStatsTable, Season } from "./PlayerStatsTables";
import { useMemo } from "react";

export type FieldingStats = Pick<PlayerStats,
    'allowed_stolen_bases' |
    'assists' |
    'double_plays' |
    'errors' |
    'putouts' |
    'runners_caught_stealing'
>

const FieldingTableColumns: ColumnDef<FieldingStats>[] = [
    {
        name: 'PO',
        description: 'Putouts',
        numerator: stats => stats.putouts,
    },
    {
        name: 'A',
        description: 'Assists',
        numerator: stats => stats.assists,
    },
    {
        name: 'E',
        description: 'Errors',
        numerator: stats => stats.errors,
    },
    {
        name: 'DP',
        description: 'Double Plays',
        numerator: stats => stats.double_plays,
    },
    {
        name: 'RCS',
        description: 'Runners Caught Stealing',
        numerator: stats => stats.runners_caught_stealing,
    },
    {
        name: 'RCS%',
        description: 'Runners Caught Stealing / Attempts',
        numerator: stats => stats.runners_caught_stealing,
        divisor: stats => stats.runners_caught_stealing + stats.allowed_stolen_bases,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
];

export function FieldingStatsTable({ data }: { data: (Season & FieldingStats)[] }) {
    const fieldingStats = useMemo(() => data.filter(stats => stats.putouts > 0 || stats.assists > 0).map(stats => ({
        ...stats
    } as Season & FieldingStats)), [data]);

    if (fieldingStats.length == 0)
        return null;

    return (
        <div className="flex flex-col gap-2 items-start max-w-full">
            <h2 className="text-xl font-bold ml-1">Fielding</h2>
            <PlayerStatsTable columns={FieldingTableColumns} stats={fieldingStats} />
        </div>
    );
}
