// Note to self
// REWRITE THIS PLEASE
'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../Settings";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import Link from "next/link";
import CheckboxDropdown from "../CheckboxDropdown";
import { useTeamColors, useTeamFeed, useTeamSchedule } from "@/hooks/api/Team";
import Loading from "../Loading";

const CURRENT_SEASON = "5";

type NormalizedGame = {
    _id: string;
    game_id: string;
    season: string;
    day: string;
    home_team_id: string;
    away_team_id: string;
    home_team_name: string;
    away_team_name: string;
    home_team_emoji: string;
    away_team_emoji: string;
    home_score: number;
    away_score: number;
    home_team_color: string;
    away_team_color: string;
    state: string;
    weather: { Emoji: string };
    [key: string]: any;
};

type TeamScheduleProps = {
    id: string;
};

export default function TeamSchedule({ id }: TeamScheduleProps) {
    const { data: schedule, isPending: scheduleIsPending } = useTeamSchedule({teamId: id})
    const { data: feed, isPending: feedIsPending } = useTeamFeed({ teamId: id });
    
    const teamIdsPlayed = useMemo<string[]>(() => {
        if (!feed) return [];
        const gamesPlayed = feed.filter((event: any) => event.type === 'game' && event.text.includes('FINAL'));
        return Array.from(new Set(gamesPlayed.flatMap((game: any) => [game.links[0].id, game.links[1].id])));
    }, [feed]);
    const { data: teamColors } = useTeamColors({ teamIds: teamIdsPlayed })


    const [seasonOptions, setSeasonOptions] = useState<string[]>(["1", "2", "3", "4"]);
    const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["4"]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const initializedRef = useRef(false);

    const groupedFeed = useMemo(() => {
        if (!feed) return null;
        return feed.reduce((acc: Record<string, any[]>, event) => {
            if (event.type !== 'game') return acc;
            const seasonKey = String(event.season);
            if (!acc[seasonKey]) acc[seasonKey] = [];
            acc[seasonKey].push(event);
            return acc;
        }, {});
    }, [feed]);

    useEffect(() => {
        if (!groupedFeed || initializedRef.current) return;

        const availableSeasons = Object.keys(groupedFeed).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
        
        const allOptions = Array.from(new Set([...availableSeasons.map(String), CURRENT_SEASON])).sort();
        setSeasonOptions(allOptions);

        setSelectedSeasons([allOptions[allOptions.length - 1]]);

        initializedRef.current = true;
    }, [groupedFeed]);


    const normalizedGames = useMemo<NormalizedGame[]>(() => {
        if (!schedule && !groupedFeed) return [];

        const allGames = [
            ...(selectedSeasons.includes(CURRENT_SEASON) && schedule?.games ? schedule.games : []),
            ...selectedSeasons.filter(s => s !== CURRENT_SEASON).flatMap(s => groupedFeed?.[s] || []),
        ];

        return allGames.map((game, i) => {
            // Current season
            if ("home_team_id" in game) {
                return { ...game, _id: game.game_id || `live-${i}`, season: game.season || CURRENT_SEASON };
            }
            // Filter out non-games from feed
            if (!game?.links || game.links.length < 3 || !game.links[2].match.startsWith("FINAL")) {
                return null;
            }

            // Feed games
            const [awayLink, homeLink, scoreLink] = game.links;
            const [awayEmoji, ...awayNameParts] = awayLink.match.split(" ");
            const [homeEmoji, ...homeNameParts] = homeLink.match.split(" ");
            const [awayScore, homeScore] = (scoreLink?.match?.split(" ")[1] || "0-0").split("-").map(Number);
            
            const homeId = homeLink.id || "unknown_home";
            const awayId = awayLink.id || "unknown_away";

            return {
                ...game,
                _id: scoreLink.id || `legacy-${i}`,
                game_id: scoreLink.id || `legacy-${i}`,
                home_team_id: homeId,
                away_team_id: awayId,
                home_team_name: homeNameParts.join(" ") || "Home",
                away_team_name: awayNameParts.join(" ") || "Away",
                home_team_emoji: homeEmoji || "🏠",
                away_team_emoji: awayEmoji || "✈️",
                home_score: homeScore ?? 0,
                away_score: awayScore ?? 0,
                home_team_color: teamColors?.[homeId] || "333333",
                away_team_color: teamColors?.[awayId] || "555555",
                state: "Complete",
                day: game.day || "?",
                weather: { Emoji: game.weather?.Emoji || "❔" },
            };
        }).filter(Boolean) as NormalizedGame[];
    }, [selectedSeasons, schedule, groupedFeed, teamColors]);

    const { gamesBySeason, seasonRecords } = useMemo(() => {
        const gamesBySeason: Record<string, NormalizedGame[]> = {};
        const seasonRecords: Record<string, { wins: number; losses: number }> = {};

        for (const game of normalizedGames) {
            const season = String(game.season);
            if (!gamesBySeason[season]) gamesBySeason[season] = [];
            gamesBySeason[season].push(game);

            if (game.state !== 'Complete') continue;
            
            const isHome = game.home_team_id === id;
            const teamScore = isHome ? game.home_score : game.away_score;
            const oppScore = isHome ? game.away_score : game.home_score;
            
            if (!seasonRecords[season]) seasonRecords[season] = { wins: 0, losses: 0 };
            if (teamScore > oppScore) seasonRecords[season].wins++;
            else seasonRecords[season].losses++;
        }
        return { gamesBySeason, seasonRecords };
    }, [normalizedGames, id]);

    if (feedIsPending) return <Loading />;

    return (
        <>
            <div className="flex justify-center mb-2 gap-2">
                <CheckboxDropdown
                    label="Select Seasons"
                    options={seasonOptions}
                    selected={selectedSeasons}
                    setSelected={setSelectedSeasons}
                    isOpen={dropdownOpen}
                    toggleOpen={() => setDropdownOpen((o) => !o)}
                />
            </div>

            <div className="max-w-2xl w-full mb-4">
                {scheduleIsPending ? (
                    <div className="text-white">Loading schedule…</div>
                ) : (
                    selectedSeasons.map((season) => {
                        const games = gamesBySeason[season];
                        const record = seasonRecords[season];
                        if (!games || games.length === 0) return null;

                        const sortedGames = [...games].sort((a, b) => Number(a.day) - Number(b.day));
                        
                        return (
                            <div key={season} className="mb-6">
                                <h2 className="text-lg font-bold text-center mb-0">
                                    Season {season}
                                </h2>
                                {record && (<h3 className="text-md font-bold mb-4 text-center mt-0">{record.wins}-{record.losses}</h3>)}
                                
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
                                                    {game.weather.Emoji}
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
