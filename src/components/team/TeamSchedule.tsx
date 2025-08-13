// Note to self
// REWRITE THIS PLEASE
'use client';
import { useEffect, useRef, useState } from "react";
import { useSettings } from "../Settings";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import Link from "next/link";
import CheckboxDropdown from "../CheckboxDropdown";

type GameScheduleProps = { 
    id: string;
    feed: Record<string, any[]>; 
    colors?: Record<string, string>[];
};

export default function TeamSchedule({ id, feed, colors }: GameScheduleProps) {
    const { settings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [seasonOptions, setSeasonOptions] = useState<string[]>(["1", "2", "3", "4"]);
    const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["4"]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;

        if (!feed) return;

        const numericSeasons = Object.keys(feed)
            .map((k) => parseInt(k))
            .filter((n) => !isNaN(n))
            .sort((a, b) => a - b);

        if (numericSeasons.length === 0) {
            setSeasonOptions(["1", "2", "3", "4"]);
            setSelectedSeasons(["4"]);
            initializedRef.current = true;
            return;
        }

        const maxSeason = numericSeasons[numericSeasons.length - 1];
        const newOptions = [...numericSeasons.map(String)];

        setSeasonOptions(newOptions);
        setSelectedSeasons([String(maxSeason)]);
        initializedRef.current = true;
    }, [feed]);

    useEffect(() => {
        if (selectedSeasons.includes("4") && !schedule && !loading) {
            loadSchedule();
        }
    }, [selectedSeasons]);

    async function loadSchedule() {
        if (schedule || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/nextapi/team-schedule/${id}`);
            if (!res.ok) throw new Error('Failed to load team data');
            setSchedule(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleClick() {
        setVisible((v) => !v);
        if (!schedule) loadSchedule();
    }

    const allGames = [
        ...(selectedSeasons.includes("4") && schedule?.games ? schedule.games : []),
        ...selectedSeasons.filter((s) => s !== "4").flatMap((s) => feed[s] || []),
    ];

    const normalizedGames = allGames.map((game, i) => {
        if ("home_team_id" in game) {
            return {
                ...game,
                _source: "live",
                _id: game.game_id || i,
                season: "4",
            };
        }

        if (!game?.links || game.links.length < 3 || !game.links[2].match.startsWith("FINAL")) {
            return { };
        }

        const [awayLink, homeLink, scoreLink] = game.links;

        const [awayEmoji, awayNameRaw] = [
            awayLink.match.split(" ")[0] || "✈️",
            awayLink.match.split(" ").slice(1).join(" ") || "Away"
        ];

        const [homeEmoji, homeNameRaw] = [
            homeLink.match.split(" ")[0] || "🏠",
            homeLink.match.split(" ").slice(1).join(" ") || "Home"
        ];

        const scoreMatch = scoreLink?.match?.split(" ")[1] || "0-0";
        const [awayScore, homeScore] = scoreMatch.split("-").map(Number);

        return {
            ...game,
            home_team_id: homeLink.id || "???",
            away_team_id: awayLink.id || "???",
            home_team_color: game.home_color || colors?.[homeLink.id] || "333333",
            away_team_color: game.away_color || colors?.[awayLink.id] || "555555",
            home_score: homeScore ?? 0,
            away_score: awayScore ?? 0,
            home_team_name: homeNameRaw,
            away_team_name: awayNameRaw,
            home_team_emoji: homeEmoji,
            away_team_emoji: awayEmoji,
            state: game.state || "Complete",
            day: game.day || "?",
            weather: { Emoji: game.weather?.Emoji || "❔" },
            game_id: scoreLink.id || `legacy-${i}`,
            _source: "archive",
            _id: scoreLink.id || `legacy-${i}`,
        };
    });


    const gamesBySeason: Record<string, typeof normalizedGames> = {};
    for (const game of normalizedGames) {
        const season = String(game.season || "unknown");
        if (!gamesBySeason[season]) gamesBySeason[season] = [];
        gamesBySeason[season].push(game);
    }

    const seasonRecords: Record<string, { wins: number; losses: number }> = {};

    for (const game of normalizedGames) {
        const season = String(game.season || game.season_number || "unknown");
        const isHome = game.home_team_id === id;
        const teamScore = isHome ? game.home_score : game.away_score;
        const oppScore = isHome ? game.away_score : game.home_score;

        if (!seasonRecords[season]) seasonRecords[season] = { wins: 0, losses: 0 };
        if (teamScore > oppScore) seasonRecords[season].wins++;
        else seasonRecords[season].losses++;
    }

    return (
        <>
            <div className="mb-4 flex justify-center gap-4">
                {settings.teamPage?.showMMOLBLinks && (
                    <a
                        target="_blank"
                        className="px-4 py-2 link-hover text-theme-secondary rounded mb-4"
                        href="https://mmolb.com/edit-team"
                    >
                        <span>Edit Team Info</span>
                    </a>
                )}
                <button
                    onClick={handleClick}
                    className="px-4 py-2 link-hover text-theme-secondary rounded mb-4"
                >
                    {visible ? "Hide Schedule" : "Season Schedule"}
                </button>
                {settings.teamPage?.showMMOLBLinks && (
                    <a
                        target="_blank"
                        className="px-4 py-2 link-hover text-theme-secondary rounded mb-4"
                        href="https://mmolb.com/manage-team/inventory"
                    >
                        <span>Inventory</span>
                    </a>
                )}
            </div>

            {visible && (
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

                    <div className="mb-4">
                        {loading ? (
                            <div className="text-white">Loading schedule…</div>
                        ) : (
                            selectedSeasons.map((season) => {
                                const games = gamesBySeason[season];
                                const record = seasonRecords[season];
                                if (!games || games.length === 0) return null;

                                const sortedGames = games.sort(
                                    (a, b) => parseInt(a.day) - parseInt(b.day)
                                );

                                return (
                                    <div key={season} className="mb-6">
                                        <h2 className="text-lg font-bold text-center mb-0">
                                            Season {season}
                                        </h2>
                                        <h3 className="text-md font-bold mb-4 text-center mt-0">{record.wins}-{record.losses}</h3>
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
            )}
        </>
    );
}
