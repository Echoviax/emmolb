import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef } from "./PlayerStatsTables";

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

export const PitchingTableColumns: ColumnDef<PitchingStats>[] = [
    {
        name: 'GP',
        description: 'Games Played',
        numerator: stats => stats.appearances,
    },
    {
        name: 'IP',
        description: 'Innings Pitched',
        numerator: stats => stats.outs,
        format: value => `${Math.floor(value / 3)}.${value % 3}`,
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
        format: value => (value * 27).toFixed(2),
    },
    {
        name: 'H/9',
        description: 'Hits Allowed per 9 Innings',
        numerator: stats => stats.hits_allowed,
        divisor: stats => stats.outs,
        format: value => (value * 27).toFixed(2),
    },
    {
        name: 'HR/9',
        description: 'Home Runs Allowed per 9 Innings',
        numerator: stats => stats.home_runs_allowed,
        divisor: stats => stats.outs,
        format: value => (value * 27).toFixed(2),
    },
    {
        name: 'K/9',
        description: 'Strikeouts per 9 Innings',
        numerator: stats => stats.strikeouts,
        divisor: stats => stats.outs,
        format: value => (value * 27).toFixed(2),
    },
    {
        name: 'BB/9',
        description: 'Walks per 9 Innings',
        numerator: stats => stats.walks,
        divisor: stats => stats.outs,
        format: value => (value * 27).toFixed(2),
    },
];
