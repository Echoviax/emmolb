import { usePlayer } from "@/hooks/api/Player";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BattingStatsTable } from "./BattingStats";
import { PitchingStatsTable } from "./PitchingStats";
import { FieldingStatsTable } from "./FieldingStats";
import { LoadingMini } from "../Loading";
import { defaultStats, PlayerRecord, PlayerRecordResponse, PlayerStatKey } from "@/types/PlayerStats";

export type Season = {
    season: number;
}

export type ColumnDef<T> = {
    name: string;
    description: string;
    numerator: (stats: T) => number | undefined;
    divisor?: (stats: T) => number | undefined;
    aggregate?: (col: ColumnDef<T>, stats: T[]) => number | undefined;
    format?: (value: number) => number | string;
    default?: string;
}

export type PlayerStatsTableProps<T extends Season> = {
    columns: ColumnDef<Omit<T, 'season'>>[];
    stats: T[];
}

export function selectSum<T>(array: T[], selector: (obj: T) => number) {
    return array.reduce((prev, current) => prev + selector(current), 0);
}

function defaultAggregator<T>(col: ColumnDef<T>, stats: T[]) {
    const numeratorSum = selectSum(stats, seasonStats => col.numerator(seasonStats) ?? 0);
    if (!col.divisor)
        return numeratorSum;

    const divisorSum = selectSum(stats, seasonStats => col.divisor!(seasonStats) ?? 0);
    return divisorSum !== 0 ? numeratorSum / divisorSum : undefined;
}

export function PlayerStatsTable<T extends Season>({ columns, stats }: PlayerStatsTableProps<T>) {
    const rows = useMemo(() => stats.map(seasonStats => {
        return {
            season: seasonStats.season, values: columns.map(col => {
                const numerator = col.numerator(seasonStats);
                const divisor = (col.divisor && col.divisor(seasonStats)) ?? 1;
                const value = divisor !== 0 && numerator !== undefined ? numerator / divisor : undefined;
                return value === undefined ? col.default ?? '—' : col.format ? col.format(value) : value.toLocaleString('en-US');
            })
        };
    }), [columns, stats]);

    const totals = useMemo(() => columns.map(col => {
        const value = (col.aggregate ? col.aggregate : defaultAggregator)(col, stats);
        return value === undefined ? col.default ?? '—' : col.format ? col.format(value) : value.toLocaleString('en-US');
    }), [columns, stats]);

    return (
        <div className="max-w-full overflow-x-auto" style={{ scrollbarColor: 'var(--theme-primary) var(--theme-background)' }}>
            <table className="table">
                <thead className="table-header-group">
                    <tr className="table-row">
                        <th className="table-cell sticky left-0 text-xs font-semibold uppercase px-1.5 py-0.5 bg-(--theme-background)">
                            Season
                        </th>
                        {columns.map((col, i) => (
                            <th key={i} className="table-cell text-center text-xs px-1.5 py-0.5 font-semibold uppercase" title={col.description}>
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-row-group">
                    {rows.map((row, i) => (
                        <tr key={i} className="table-row border-t-1 first:border-(--theme-text) border-(--theme-text)/50 even:bg-(--theme-secondary) odd:bg-(--theme-primary)">
                            <td className={`table-cell sticky left-0 text-sm text-center px-1.5 py-0.5 ${i % 2 === 1 ? 'bg-(--theme-secondary)' : 'bg-(--theme-primary)'}`}>
                                {row.season}
                            </td>
                            {row.values.map((value, j) => (
                                <td key={j} className="table-cell text-sm text-right px-1.5 py-0.5 tabular-nums border-l-1 border-(--theme-text)/25 border-dotted">
                                    {value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot className="table-footer-group">
                    <tr className="table-row border-y-1 border-(--theme-text)">
                        <td className="table-cell sticky left-0 text-sm font-semibold px-1.5 py-0.5 bg-(--theme-background)">
                            Career
                        </td>
                        {totals.map((value, i) => (
                            <td key={i} className="table-cell text-sm font-semibold text-right px-1.5 py-0.5 tabular-nums border-l-1 border-(--theme-text)/25 border-dotted">
                                {value}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

type PlayerStatsTablesProps = {
    playerId: string
};

function recordToStats(record: PlayerRecord) {
    const stats = { ...defaultStats };
    for (const teamStats of Object.values(record.Stats)) {
        for (const [key, value] of Object.entries(teamStats)) {
            if (value !== undefined)
                stats[key as PlayerStatKey] += value;
        }
    }
    return { season: record.Season, ...stats };
}

export default function PlayerStatsTables({ playerId }: PlayerStatsTablesProps) {
    const [selectedStatus, setSelectedStatus] = useState('Regular Season');

    const { data: player } = usePlayer({
        playerId,
        select: player => player.position_type,
    });
    const { data: records, isPending } = useQuery({
        queryKey: ['player-playerrecord', playerId],
        queryFn: async () => {
            const res = await fetch(`/nextapi/player/${playerId}/playerrecord`);
            if (!res.ok) throw new Error('Failed to load player record');
            return (await res.json() as PlayerRecordResponse).records;
        },
        staleTime: 60 * 1000,
    });

    const availableStatuses = useMemo(() => {
        if (!records) return [];
        const seen = new Set<string>();
        for (const r of records) seen.add(r.SeasonStatus);
        return Array.from(seen).sort();
    }, [records]);

    const seasonStats = useMemo(() => {
        if (!records) return [];
        return records
            .filter(r => r.SeasonStatus === selectedStatus)
            .map(recordToStats)
            .sort((a, b) => b.season - a.season);
    }, [records, selectedStatus]);

    if (isPending)
        return <div className="h-80"><LoadingMini /></div>

    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-2 items-center">
                <div className="text-sm font-medium text-theme-secondary opacity-80">Season Type:</div>
                <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="text-sm bg-(--theme-primary) p-1 rounded-sm"
                >
                    {availableStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            {player === 'Batter' ?
                <>
                    <BattingStatsTable playerId={playerId} data={seasonStats} />
                    <FieldingStatsTable playerId={playerId} data={seasonStats} />
                    <PitchingStatsTable playerId={playerId} data={seasonStats} />
                </> : <>
                    <PitchingStatsTable playerId={playerId} data={seasonStats} />
                    <FieldingStatsTable playerId={playerId} data={seasonStats} />
                    <BattingStatsTable playerId={playerId} data={seasonStats} />
                </>
            }
        </div>
    );
}
