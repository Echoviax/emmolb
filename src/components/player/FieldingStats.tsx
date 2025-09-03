import { PlayerStats } from "@/types/PlayerStats";
import { ColumnDef, PlayerStatsTable, Season } from "./PlayerStatsTables";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export type FieldingStats = Pick<PlayerStats,
    'allowed_stolen_bases' |
    'assists' |
    'double_plays' |
    'errors' |
    'putouts' |
    'runners_caught_stealing'
>

export type FieldingExtendedStats = {
    ground_balls: number;
    ground_ball_outs: number;
    line_drives: number;
    line_drive_outs: number;
    fly_balls: number;
    fly_ball_outs: number;
    popups: number;
    popup_outs: number;
}

const FieldingTableColumns: ColumnDef<FieldingStats & FieldingExtendedStats>[] = [
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
        name: 'GB',
        description: 'Ground Balls Fielded',
        numerator: stats => stats.ground_balls,
    },
    {
        name: 'GBO%',
        description: 'Ground Ball Outs / Fielded',
        numerator: stats => stats.ground_ball_outs,
        divisor: stats => stats.ground_balls,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'LD',
        description: 'Line Drives Fielded',
        numerator: stats => stats.line_drives,
    },
    {
        name: 'LDO%',
        description: 'Line Drive Outs / Fielded',
        numerator: stats => stats.line_drive_outs,
        divisor: stats => stats.line_drives,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'Fly',
        description: 'Fly Balls Fielded',
        numerator: stats => stats.fly_balls,
    },
    {
        name: 'FlyO%',
        description: 'Fly Ball Outs / Fielded',
        numerator: stats => stats.fly_ball_outs,
        divisor: stats => stats.fly_balls,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
        name: 'Pop',
        description: 'Popups Fielded',
        numerator: stats => stats.popups,
    },
    {
        name: 'PopO%',
        description: 'Popup Outs / Fielded',
        numerator: stats => stats.popup_outs,
        divisor: stats => stats.popups,
        format: value => (value * 100).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
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

export function FieldingStatsTable({ playerId, data }: { playerId: string, data: (Season & FieldingStats)[] }) {
    const { data: mmolbStats } = useQuery({
        queryKey: ['player-mmolb-stats-fielding', playerId],
        queryFn: async () => {
            const res = await fetch(`/nextapi/player/${playerId}/mmolb-stats/fielding`);
            if (!res.ok) throw new Error('Failed to load player stats');
            return await res.json() as (Season & FieldingExtendedStats)[];
        },
        staleTime: 60 * 60 * 1000,
        select: stats => Object.fromEntries(stats.map(x => [x.season, x])),
    });

    const fieldingStats = useMemo(() => data.filter(stats => stats.putouts > 0 || stats.assists > 0).map(stats => ({
        ...stats,
        ...mmolbStats?.[stats.season],
    } as Season & FieldingStats & FieldingExtendedStats)), [data, mmolbStats]);

    if (fieldingStats.length == 0)
        return null;

    return (
        <div className="flex flex-col gap-2 items-start max-w-full">
            <h2 className="text-xl font-bold ml-1">Fielding</h2>
            <PlayerStatsTable columns={FieldingTableColumns} stats={fieldingStats} />
        </div>
    );
}
