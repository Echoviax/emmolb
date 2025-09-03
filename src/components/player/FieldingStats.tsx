import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef } from "./PlayerStatsTables";

export type FieldingStats = Pick<PlayerStats,
    'allowed_stolen_bases' |
    'assists' |
    'double_plays' |
    'errors' |
    'putouts' |
    'runners_caught_stealing'
>

export const FieldingTableColumns: ColumnDef<FieldingStats>[] = [
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
        format: value => (value * 100).toFixed(1),
    },
];