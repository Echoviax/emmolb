'use client';
import { useMemo, useState } from "react";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import Link from "next/link";
import CheckboxDropdown from "../CheckboxDropdown";
import { useTeamSchedule, useTeamSeasonSchedules } from "@/hooks/api/Team";
import Loading from "../Loading";
import { WinProgressionChart } from "./WinLossChart";
import { Checkbox } from "./Checkbox";
import { usePersistedState } from "@/hooks/PersistedState";
import { ScheduleGame } from "@/types/Game";

const SETTING_REVERSE_ORDER = 'teamSchedule_reverseOrder';
const SETTING_SHOW_CHART = 'teamSchedule_showChart';

type TeamScheduleProps = {
    id: string;
};

export default function TeamSchedule({ id }: TeamScheduleProps) {
    const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [reverseOrder, setReverseOrder] = usePersistedState(SETTING_REVERSE_ORDER, false);
    const [showChart, setShowChart] = usePersistedState(SETTING_SHOW_CHART, true);

    // Fetch current season
    const { data: currentSeasonData, isPending: currentSeasonPending } = useTeamSchedule({
        teamId: id,
    });

    // Generate season list from 1 to current season
    const seasonList = useMemo(() => {
        if (!currentSeasonData || currentSeasonData.length === 0) return [];
        const currentSeason = currentSeasonData.season_number;
        if (!currentSeason) return [];
        return Array.from({ length: currentSeason }, (_, i) => (i + 1).toString());
    }, [currentSeasonData]);

    // Initialize selected seasons when seasonList is available
    useMemo(() => {
        if (seasonList.length > 0 && selectedSeasons.length === 0) {
            setSelectedSeasons([seasonList[seasonList.length - 1]]);
        }
    }, [seasonList, selectedSeasons.length]);

    // Fetch schedules for all seasons
    const { data: seasonSchedules, isPending: schedulesIsPending } = useTeamSeasonSchedules({
        teamId: id,
        seasons: seasonList
    });

    const seasonOptions = useMemo(() => {
        if (!seasonSchedules) return [];
        return seasonList.filter((season: string) => {
            const scheduleData = seasonSchedules[season as keyof typeof seasonSchedules];
            return scheduleData?.games && scheduleData.games.length > 0;
        });
    }, [seasonSchedules, seasonList]);

    const { gamesBySeason, seasonRecords } = useMemo(() => {
        if (!seasonSchedules) return { gamesBySeason: {}, seasonRecords: {} };

        const gamesBySeason: Record<string, ScheduleGame[]> = {};
        const seasonRecords: Record<string, { wins: number; losses: number }> = {};

        for (const season of selectedSeasons) {
            const scheduleData = seasonSchedules[season as keyof typeof seasonSchedules];
            const games = scheduleData?.games || [];

            if (games.length === 0) continue;

            gamesBySeason[season] = games.map((game: any) => ({
                ...game,
                _id: game.game_id,
                season: season,
            }));

            // Calculate record
            seasonRecords[season] = { wins: 0, losses: 0 };
            for (const game of games) {
                if (game.state !== 'Complete') continue;

                const isHome = game.home_team_id === id;
                const teamScore = isHome ? game.home_score : game.away_score;
                const oppScore = isHome ? game.away_score : game.home_score;

                if (teamScore > oppScore) seasonRecords[season].wins++;
                else seasonRecords[season].losses++;
            }
        }

        return { gamesBySeason, seasonRecords };
    }, [selectedSeasons, seasonSchedules, id]);

    if (currentSeasonPending || schedulesIsPending) return <Loading />;

    return (
        <>
            <div className="flex justify-center mb-2 gap-4 items-center">
                <CheckboxDropdown
                    label="Select Seasons"
                    options={seasonOptions}
                    selected={selectedSeasons}
                    setSelected={setSelectedSeasons}
                    isOpen={dropdownOpen}
                    toggleOpen={() => setDropdownOpen((o) => !o)}
                />
                <Checkbox checked={reverseOrder} label="Reverse Order" onChange={setReverseOrder} />
                <Checkbox checked={showChart} label="Show W/L Chart" onChange={setShowChart} />
            </div>
            {showChart && selectedSeasons.map((season) => {
                const games = gamesBySeason[season];
                if (!games || games.length === 0) return null;

                const completedGames = games.filter(game => game.state === 'Complete');
                const gameResults = completedGames.map(game => {
                    const isHome = game.home_team_id === id;
                    const teamScore = isHome ? game.home_score : game.away_score;
                    const oppScore = isHome ? game.away_score : game.home_score;
                    const opponentName = isHome ? game.away_team_name : game.home_team_name;

                    return {
                        day: game.day,
                        won: teamScore > oppScore,
                        opponent: opponentName,
                        score: `${teamScore}-${oppScore}`,
                    };
                });

                return (
                    <div key={`chart-${season}`} className="mb-6 bg-white rounded-lg max-w-2xl w-full">
                        <WinProgressionChart
                            games={gameResults}
                            season={season}
                        />
                    </div>
                );
            })}

            <div className="max-w-2xl w-full mb-4">
                {schedulesIsPending ? (
                    <div>Loading schedule…</div>
                ) : (
                    selectedSeasons.map((season) => {
                        const games = gamesBySeason[season];
                        const record = seasonRecords[season];
                        if (!games || games.length === 0) return null;

                        const sortedGames = [...games].sort((a, b) =>
                            reverseOrder ? Number(b.day) - Number(a.day) : Number(a.day) - Number(b.day)
                        );

                        // Calculate last 10 games record (most recent by day number)
                        const completedGames = games
                            .filter(g => g.state === 'Complete')
                            .sort((a, b) => Number(b.day) - Number(a.day)); // Most recent first
                        const last10 = completedGames.slice(0, 10);
                        const last10Record = last10.reduce((acc, game) => {
                            const isHome = game.home_team_id === id;
                            const teamScore = isHome ? game.home_score : game.away_score;
                            const oppScore = isHome ? game.away_score : game.home_score;
                            if (teamScore > oppScore) acc.wins++;
                            else acc.losses++;
                            return acc;
                        }, { wins: 0, losses: 0 });

                        return (
                            <div key={season} className="mb-6">
                                <h2 className="text-lg font-bold text-center mb-0">
                                    Season {season}
                                </h2>
                                {record && (
                                    <div className="flex justify-center gap-4 items-center mb-4 mt-0">
                                        <h3 className="text-md font-bold text-center m-0">{record.wins}-{record.losses}</h3>
                                        {last10.length > 0 && (
                                            <span className="text-sm">
                                                Last {last10.length}: {last10Record.wins}-{last10Record.losses}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="grid gap-4 grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))]">
                                    {sortedGames.map((game) => {
                                        const isHome = game.home_team_id === id;
                                        const color = isHome
                                            ? game.away_team_color
                                            : game.home_team_color;
                                        const name = isHome
                                            ? game.away_team_name
                                            : game.home_team_name;
                                        const emoji = isHome
                                            ? game.away_team_emoji
                                            : game.home_team_emoji;
                                        const won = isHome
                                            ? game.home_score > game.away_score
                                            : game.away_score > game.home_score;
                                        const inProgress = game.state !== "Complete";

                                        return (
                                            <Link
                                                key={game._id}
                                                href={`/watch/${game.game_id}`}
                                                className="relative rounded-md p-1 text-xs min-h-[100px] flex flex-col items-center justify-center cursor-pointer hover:opacity-80"
                                                style={{
                                                    background: `#${color}`,
                                                    color: getContrastTextColor(color),
                                                }}
                                            >
                                                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold">
                                                    {game.day}
                                                </span>
                                                <span className="absolute top-1 right-1 text-xs">
                                                    {game.weather.emoji}
                                                </span>
                                                <span className="absolute top-1 left-1">
                                                    {isHome ? "🏠" : "✈️"}
                                                </span>
                                                <div className="flex flex-col items-center justify-center mt-2 text-center leading-tight">
                                                    <span className="text-lg">{emoji}</span>
                                                    <span className="text-xs font-semibold">
                                                        {name}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm font-bold">
                                                    {game.away_score}-{game.home_score}
                                                </div>
                                                {!inProgress ? (
                                                    won ? (
                                                        <div className="absolute bottom-1 left-1 text-[10px] font-bold w-4 h-4 rounded-full bg-black flex items-center justify-center text-green-300">
                                                            W
                                                        </div>
                                                    ) : (
                                                        <div className="absolute bottom-1 left-1 text-[10px] font-bold w-4 h-4 rounded-full bg-black flex items-center justify-center text-red-400">
                                                            L
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="absolute bottom-1 left-1 text-[10px] font-bold w-8 h-4 rounded-full bg-black flex items-center justify-center text-white">
                                                        LIVE
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>


        </>
    );
}
