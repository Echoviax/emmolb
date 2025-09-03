import { usePlayer } from "@/hooks/api/Player";
import { useMmolbTime } from "@/hooks/api/Time";
import { PlayerStats } from "@/types/PlayerStats";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { BattingDerivedStats, BattingStats, BattingTableColumns } from "./BattingStats";

export type Season = {
    season: number;
}

type PitchingStats = Pick<PlayerStats,
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

type FieldingStats = Pick<PlayerStats,
    'allowed_stolen_bases' |
    'assists' |
    'double_plays' |
    'errors' |
    'putouts' |
    'runners_caught_stealing'
>

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

function PlayerStatsTable<T extends Season>({ columns, stats }: PlayerStatsTableProps<T>) {
    const rows = useMemo(() => stats.map(seasonStats => {
        return {season: seasonStats.season, values: columns.map(col => {
            const numerator = col.numerator(seasonStats);
            const divisor = (col.divisor && col.divisor(seasonStats)) ?? 1;
            const value = divisor !== 0 && numerator !== undefined ? numerator / divisor : undefined;
            return value === undefined ? col.default ?? '—' : col.format ? col.format(value) : value;
        })};
    }), [columns, stats]);

    const totals = useMemo(() => columns.map(col => {
        const value = (col.aggregate ? col.aggregate : defaultAggregator)(col, stats);
        return value === undefined ? col.default ?? '—' : col.format ? col.format(value) : value;
    }), [columns, stats]);

    return (
        <table className="table w-full">
            <thead className="table-header-group">
                <tr className="table-row">
                    <th className="table-cell text-xs font-semibold uppercase">
                        Season
                    </th>
                    {columns.map((col, i) => (
                        <th key={i} className="table-cell text-right text-xs px-1.5 py-0.5 font-semibold uppercase" title={col.description}>
                            {col.name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="table-row-group">
                {rows.map((row, i) => (
                    <tr key={i} className="table-row border-t-1 border-(--theme-text)/50 even:bg-(--theme-secondary)">
                        <td className="table-cell text-sm text-center">
                            {row.season}
                        </td>
                        {row.values.map((value, j) => (
                            <td key={j} className="table-cell text-sm text-right px-1.5 py-0.5 tabular-nums">
                                {value}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            <tfoot className="table-footer-group">
                <tr className="table-row border-t-1 border-(--theme-text)/50 even:bg-(--theme-secondary)">
                    <td className="table-cell text-sm font-semibold">
                        Career
                    </td>
                    {totals.map((value, i) => (
                        <td key={i} className="table-cell text-sm font-semibold text-right px-1.5 py-0.5 tabular-nums">
                            {value}
                        </td>
                    ))}
                </tr>
            </tfoot>
        </table>
    );
}

type PlayerStatsTablesProps = {
    playerId: string
};

export default function PlayerStatsTables({ playerId }: PlayerStatsTablesProps) {
    const { data: currentSeason } = useMmolbTime({
        select: time => time.seasonNumber
    });
    const { data: currentSeasonStats } = usePlayer({
        playerId,
        select: player => player.stats[player.team_id]
    });
    const { data: cashewsStats } = useQuery({
        queryKey: ['player-cashews-stats', playerId],
        queryFn: async () => {
            const res = await fetch(`/nextapi/player/${playerId}/cashews-stats`);
            if (!res.ok) throw new Error('Failed to load player');
            return await res.json() as (Season & BattingStats & PitchingStats & FieldingStats)[];
        },
        staleTime: 60 * 60 * 1000,
    });
    console.log(cashewsStats);

    const allSeasonsStats = useMemo(() => {
        const seasons = currentSeasonStats && currentSeason
            ? [{ ...currentSeasonStats, season: currentSeason }, ...(cashewsStats?.filter(x => x.season !== currentSeason) ?? [])]
            : [...(cashewsStats ?? [])];
        return seasons.sort((a, b) => b.season - a.season);
    }, [currentSeason, currentSeasonStats, cashewsStats]);

    const battingStats = useMemo(() => allSeasonsStats.filter(stats => stats.plate_appearances > 0).map(stats => ({
        ...stats,
        hits: stats.singles + stats.doubles + stats.triples + stats.home_runs,
        totalBases: stats.singles + 2 * stats.doubles + 3 * stats.triples + 4 * stats.home_runs,
    } as Season & BattingStats & BattingDerivedStats)), [allSeasonsStats]);

    return (
        <div className="flex flex-col gap-4">
            {battingStats.length > 0 && (
                <>
                    <h2 className="text-xl font-bold">Batting</h2>
                    <PlayerStatsTable columns={BattingTableColumns} stats={battingStats} />
                </>
            )}
        </div>
    );
}