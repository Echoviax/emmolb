import { usePlayer } from "@/hooks/api/Player";
import { useMmolbTime } from "@/hooks/api/Time";
import { PlayerStats } from "@/types/PlayerStats";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Season = {
    season: number;
}

type BattingStats = Pick<PlayerStats,
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

type ColumnDef<T> = {
    name: string;
    description: string;
    numerator: (stats: T) => number | undefined;
    divisor?: (stats: T) => number | undefined;
    aggregate?: (col: ColumnDef<T>, stats: T[]) => number | undefined;
    format?: (value: number) => number | string;
    default?: string;
}

type PlayerStatsTableProps<T extends Season> = {
    columns: ColumnDef<Omit<T, 'season'>>[];
    stats: T[];
}

type BattingDerivedStats = {
    hits: number;
}

const BattingTableColumns: ColumnDef<BattingStats & BattingDerivedStats>[] = [
    {
        name: 'PA',
        description: 'Plate Appearances',
        numerator: stats => stats.plate_appearances,
    },
    {
        name: 'H',
        description: 'Hits',
        numerator: stats => stats.hits,
    },
    {
        name: 'BA',
        description: 'Batting Average',
        numerator: stats => stats.hits,
        divisor: stats => stats.at_bats,
        format: value => value.toFixed(3),
    }
];

function selectSum<T>(array: T[], selector: (obj: T) => number) {
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
        return [seasonStats.season, ...columns.map(col => {
            const numerator = col.numerator(seasonStats);
            const divisor = (col.divisor && col.divisor(seasonStats)) ?? 1;
            const value = divisor !== 0 && numerator !== undefined ? numerator / divisor : undefined;
            return value === undefined ? col.default ?? '—' : col.format ? col.format(value) : value;
        })];
    }), [columns, stats]);

    const totals = useMemo(() => columns.map(col => {
        const value = (col.aggregate ? col.aggregate : defaultAggregator)(col, stats);
        return value === undefined ? col.default ?? '—' : col.format ? col.format(value) : value;
    }), [columns, stats]);

    return (
        <div className="table">
            <div className="table-header-group">
                <div className="table-row">
                    <div className="table-cell">
                        Season
                    </div>
                    {columns.map((col, i) => (
                        <div key={i} className="table-cell" title={col.description}>
                            {col.name}
                        </div>
                    ))}
                </div>
            </div>
            <div className="table-row-group">
                {rows.map((row, i) => (
                    <div key={i} className="table-row">
                        {row.map((value, j) => (
                            <div key={j} className="table-cell">
                                {value}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="table-footer-group">
                <div className="table-row">
                    <div className="table-cell">
                        Career
                    </div>
                    {totals.map((value, i) => (
                        <div key={i} className="table-cell">
                            {value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
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