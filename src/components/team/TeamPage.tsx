'use client'
import Loading from "@/components/Loading";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LiveGameCompact } from "../LiveGameCompact";
import CheckboxDropdown from "../CheckboxDropdown";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import { TeamPlayer } from "@/types/Team";
import { useSettings } from "../Settings";
import { DerivedPlayerStats } from "@/types/PlayerStats";
import TeamSchedule from "./TeamSchedule";
import { Player } from "@/types/Player";
import ExpandedPlayerStats from "../ExpandedPlayerStats";
import SeasonTrophy from "../SeasonTrophy";
import { useFormattedNextDayCountdown } from "@/helpers/TimeHelper";
import { useSeasonWinners, useTeam, useTeamColors, useTeamFeed } from "@/hooks/api/Team";
import { useGameByTeam, useGameHeader } from "@/hooks/api/Game";
import { usePlayers } from "@/hooks/api/Player";

const LeagueNames: Record<string, string> = {
    '6805db0cac48194de3cd3fe7': 'Baseball',
    '6805db0cac48194de3cd3fe8': 'Precision',
    '6805db0cac48194de3cd3fe9': 'Isosceles',
    '6805db0cac48194de3cd3fea': 'Liberty',
    '6805db0cac48194de3cd3feb': 'Maple',
    '6805db0cac48194de3cd3fec': 'Cricket',
    '6805db0cac48194de3cd3fed': 'Tornado',
    '6805db0cac48194de3cd3fee': 'Coleoptera',
    '6805db0cac48194de3cd3fef': 'Clean',
    '6805db0cac48194de3cd3ff0': 'Shiny',
    '6805db0cac48194de3cd3ff1': 'Psychic',
    '6805db0cac48194de3cd3ff2': 'Unidentified',
    '6805db0cac48194de3cd3ff3': 'Ghastly',
    '6805db0cac48194de3cd3ff4': 'Amphibian',
    '6805db0cac48194de3cd3ff5': 'Deep',
};

const statKeyMap: Record<string, string> = {
    "AVG": "ba",
    "OBP": "obp",
    "SLG": "slg",
    "OPS": "ops",
    "Hits": "hits",
    "Singles": "singles",
    "Doubles": "doubles",
    "Triples": "triples",
    "Home Runs": "home_runs",
    "Total Bases": "total_bases",
    "Walked": "walked",
    "Hit By Pitch": "hit_by_pitch",
    "Struck Out": "struck_out",
    "Plate Appearances": "plate_appearances",
    "At Bats": "at_bats",
    "Stolen Bases": "stolen_bases",
    "Caught Stealing": "caught_stealing",
    "Grounded Into Double Plays": "grounded_into_double_play",
    "ERA": "era",
    "WHIP": "whip",
    "K/BB": "kbb",
    "K/9": "k9",
    "H/9": "h9",
    "BB/9": "bb9",
    "HR/9": "hr9",
    "Innings Pitched": "ip",
    "Strikeouts": "strikeouts",
    "Walks": "walks",
    "Hits Allowed": "hits_allowed",
    "Hit Batters": "hit_batters",
    "Earned Runs": "earned_runs",
    "Wins": "wins",
    "Losses": "losses",
    "Quality Starts": "quality_starts",
    "Saves": "saves",
    "Blown Saves": "blown_saves",
    "Appearances": "appearances",
    "Games Finished": "games_finished",
    "Complete Games": "complete_games",
    "Shutouts": "shutouts",
    "No Hitters": "no_hitters",
    "Errors": "errors",
    "Assists": "assists",
    "Putouts": "putouts",
    "Double Plays": "double_plays",
    "Runners Caught Stealing": "runners_caught_stealing"
};


type TeamPageProps = {
    id: string;
}

export default function TeamPage({ id }: TeamPageProps) {
    const { settings } = useSettings();
    const countdown = useFormattedNextDayCountdown();
    const [favorites, setFavorites] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]')));

    const { data: team, isPending: teamIsPending } = useTeam({
        teamId: id,
    });
    const { data: feed, isPending: feedIsPending } = useTeamFeed({ teamId: id });
    const { data: players, isPending: playersIsPending } = usePlayers({
        playerIds: team?.players?.map(p => p.player_id)
    });

    const { data: gameId } = useGameByTeam({
        teamId: id,
        refetchInterval: 60000,
        enabled: settings.teamPage?.showLiveGames
    });
    const { data: game } = useGameHeader({ gameId });
    const { data: awayTeam } = useTeam({ teamId: game?.game.away_team_id });
    const { data: homeTeam } = useTeam({ teamId: game?.game.home_team_id });

    const teamIdsPlayed = useMemo<string[]>(() => {
        if (!feed) return [];
        const gamesPlayed = feed.filter((event: any) => event.type === 'game' && event.text.includes('FINAL'));
        return Array.from(new Set(gamesPlayed.flatMap((game: any) => [game.links[0].id, game.links[1].id])));
    }, [feed]);
    const { data: teamColors } = useTeamColors({ teamIds: teamIdsPlayed });
    const { data: seasonChamps } = useSeasonWinners({});
    const leagueSeasonChamps: Record<number, string> = team && seasonChamps && seasonChamps[team.league];

    const [sortStat, setSortStat] = useState<string>('');
    const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["4"]);
    const [feedFilters, setFeedFilters] = useState<string[]>(["game", "augment"]);
    const [dropdownOpen, setDropdownOpen] = useState<{ season: boolean; type: boolean }>({ season: false, type: false });

    const [expandedPlayers, setExpandedPlayers] = useState<Record<string, boolean>>({});
    useEffect(() => {
        if (team?.players)
            setExpandedPlayers(Object.fromEntries(team.players.map((player: TeamPlayer) => [player.player_id, false])));
    }, [team?.players]);

    useEffect(() => {
        if (feed && feedFilters.length === 0) {
            const uniqueTypes = Array.from(new Set(feed.map((event: any) => event.type)));
            setFeedFilters(uniqueTypes);
        }
    }, [feed, feedFilters]);

    const uniqueTypes = useMemo<string[]>(() => (feed && Array.from(new Set(feed.map((event: any) => event.type)))) ?? [], [feed]);

    const groupedFeed = useMemo(() => feed &&
        feed.reduce((acc: Record<string, any[]>, game) => {
            if (game.type !== 'game') return acc;
            const seasonKey = String(game.season);
            if (!acc[seasonKey]) acc[seasonKey] = [];
            acc[seasonKey].push(game);
            return acc;
        }, {}), [feed]);

    function toggleFavorite(teamId: string) {
        setFavorites(prev => {
            const updated = new Set(prev);
            updated.has(teamId) ? updated.delete(teamId) : updated.add(teamId);

            localStorage.setItem('favoriteTeamIDs', JSON.stringify([...updated]));
            return updated;
        });
    }

    if (teamIsPending || feedIsPending || playersIsPending) return (
        <>
            <Loading />
        </>
    );

    if (!team) return (
        <>
            <div className="text-white text-center mt-10">Can't find that team</div>
        </>
    );

    const reverseSortStats = new Set([
        "era", "whip", "bb9", "h9", "hr9", "losses", "blown_saves", "errors"
    ]);

    const sortedPlayers = team.players ? [...team.players].sort((a, b) => {
        if (!sortStat || !players) return 0;

        const statKey = statKeyMap[sortStat] as keyof DerivedPlayerStats;
        const aStats = a.stats[statKey];
        const bStats = b.stats[statKey];

        const aValue = typeof aStats === 'number' ? aStats : Infinity;
        const bValue = typeof bStats === 'number' ? bStats : Infinity;

        const reverse = reverseSortStats.has(statKey);

        if (!Number.isFinite(aValue) && !Number.isFinite(bValue)) return 0;
        if (!Number.isFinite(aValue)) return 1;
        if (!Number.isFinite(bValue)) return -1;

        return reverse ? aValue - bValue : bValue - aValue;
    }) : [];

    return (
        <>
            <main className="mt-16">
                <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                    <div className="relative w-full h-28 px-6 py-4 border-2 rounded-2xl shadow-xl border-theme-accent overflow-hidden mb-4 flex items-center" style={{ background: `#${team.color}`, color: getContrastTextColor(team.color) }}>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(team.id); }} className="absolute top-2 left-2 text-2xl z-10 hover:scale-110 transition-transform">
                            {favorites.has(team.id) ? '★' : '☆'}
                        </button>
                        <span className="text-7xl flex-shrink-0">
                            {team.emoji}
                        </span>
                        <div className="absolute inset-0 flex flex-col items-center justify-start mt-3 pointer-events-none px-2">
                            <Link href={`/league/${team.league}`}>
                                <span className="text-xl font-bold underline cursor-pointer pointer-events-auto hover:opacity-80 transition text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                    {LeagueNames[team.league]}
                                </span>
                            </Link>
                            <span className="text-2xl font-bold tracking-wide leading-tight">{team.location} {team.name}</span>
                            <span className="text-md pointer-events-auto hover:opacity-80 transition text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                🏟️: {team.ballpark_name}
                            </span>
                        </div>
                        <span className="absolute bottom-1 right-2 text-base font-semibold opacity-80 pointer-events-none">
                            {team.record.regular_season.wins} - {team.record.regular_season.losses}
                        </span>
                        <span className="absolute top-1 right-2 text-base font-semibold opacity-80 pointer-events-none">{team.record.regular_season.run_differential > 0 ? '+' : ''}{team.record.regular_season.run_differential}</span>
                    </div>
                    {leagueSeasonChamps && Object.values(leagueSeasonChamps).includes(team.id) && (
                        <div className="mb-4 mt-2 w-auto shadow-md text-5xl px-2 py-2 space-x-0 flex rounded-sm bg-theme-primary">
                            {Object.entries(leagueSeasonChamps).filter(([_, champId]) => champId === team.id).map(([season]) => (
                                <SeasonTrophy key={season} season={Number(season)} />
                            ))}
                        </div>
                    )}
                    {gameId && game && awayTeam && homeTeam && game.game.state != "Complete" && (<><Link href={`/game/${gameId}`}><LiveGameCompact homeTeam={homeTeam} awayTeam={awayTeam} game={game.game} gameId={gameId} killLinks={true} /></Link></>)}
                    {settings.teamPage?.showMMOLBLinks && (<div className="bg-theme-primary rounded-xl shadow-lg p-6 text-center text-lg mb-6">
                        <div className="mb-4 text-theme-text">Augments apply in <span className="font-mono">{countdown}</span></div>
                        <a target="_blank" className="px-4 py-2 bg-theme-secondary text-theme-secondary rounded mb-4" href="https://mmolb.com/augment">
                            <span>Edit Augment</span>
                        </a>
                    </div>)}
                    {settings.teamPage?.showMMOLBLinks && (<><h2 className="text-xl font-bold mb-4 text-center">Ballpark Village</h2>
                        <div className="mb-6 flex justify-center gap-4">
                            <a target="_blank" className="px-4 py-2 link-hover text-theme-secondary rounded mb-4" href="https://mmolb.com/ballpark">
                                <span className="text-xl">🏟️</span>
                                <span>Clubhouse</span>
                            </a>
                            <a target="_blank" className="px-4 py-2 link-hover text-theme-secondary rounded mb-4" href="https://mmolb.com/hall-of-unmaking">
                                <span className="text-xl">💀</span>
                                <span>Hall of Unmaking</span>
                            </a>
                            <a target="_blank" className="px-4 py-2 link-hover text-theme-secondary rounded mb-4" href="https://mmolb.com/shop">
                                <span className="text-xl">🛒</span>
                                <span>Quaelyth's Curios</span>
                            </a>
                        </div></>)}
                    <TeamSchedule id={id} feed={groupedFeed!} colors={teamColors ? teamColors : undefined} />
                    <div className='flex justify-center'>
                        <Link href={`/team/${team.id}/attributes`} className="block px-4 py-2 link-hover text-theme-secondary rounded mb-4 self-center">
                            View Team Attributes
                        </Link>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-center">Roster</h2>
                    <a href={`https://freecashe.ws/team/${team.id}/stats`} target="_blank" rel="noopener noreferrer">
                        <div className="underline text-center mb-4">View on freecashews</div>
                    </a>
                    <div className="mb-4 text-center">
                        <label className="mr-2 font-semibold">Sort by:</label>
                        <select className="bg-theme-primary text-theme-text px-2 py-1 rounded" value={sortStat} onChange={(e) => setSortStat(e.target.value)}>
                            <option value="">Default</option>
                            <optgroup label="Batting">
                                <option value="AVG">AVG</option>
                                <option value="OBP">OBP</option>
                                <option value="SLG">SLG</option>
                                <option value="OPS">OPS</option>
                                <option value="Hits">Hits</option>
                                <option value="Singles">Singles</option>
                                <option value="Doubles">Doubles</option>
                                <option value="Triples">Triples</option>
                                <option value="Home Runs">Home Runs</option>
                                <option value="Total Bases">Total Bases</option>
                                <option value="Walked">Walked</option>
                                <option value="Hit By Pitch">Hit By Pitch</option>
                                <option value="Struck Out">Struck Out</option>
                                <option value="Plate Appearances">Plate Appearances</option>
                                <option value="At Bats">At Bats</option>
                                <option value="Stolen Bases">Stolen Bases</option>
                                <option value="Caught Stealing">Caught Stealing</option>
                                <option value="Grounded Into Double Plays">Grounded Into Double Plays</option>
                            </optgroup>
                            <optgroup label="Pitching">
                                <option value="ERA">ERA</option>
                                <option value="WHIP">WHIP</option>
                                <option value="K/BB">K/BB</option>
                                <option value="K/9">K/9</option>
                                <option value="H/9">H/9</option>
                                <option value="BB/9">BB/9</option>
                                <option value="HR/9">HR/9</option>
                                <option value="Innings Pitched">Innings Pitched</option>
                                <option value="Strikeouts">Strikeouts</option>
                                <option value="Walks">Walks</option>
                                <option value="Hits Allowed">Hits Allowed</option>
                                <option value="Hit Batters">Hit Batters</option>
                                <option value="Earned Runs">Earned Runs</option>
                                <option value="Wins">Wins</option>
                                <option value="Losses">Losses</option>
                                <option value="Quality Starts">Quality Starts</option>
                                <option value="Saves">Saves</option>
                                <option value="Blown Saves">Blown Saves</option>
                                <option value="Appearances">Appearances</option>
                                <option value="Games Finished">Games Finished</option>
                                <option value="Complete Games">Complete Games</option>
                                <option value="Shutouts">Shutouts</option>
                                <option value="No Hitters">No Hitters</option>
                            </optgroup>
                            <optgroup label="Defense">
                                <option value="Errors">Errors</option>
                                <option value="Assists">Assists</option>
                                <option value="Putouts">Putouts</option>
                                <option value="Double Plays">Double Plays</option>
                                <option value="Runners Caught Stealing">Runners Caught Stealing</option>
                                <option value="RCS%">RCS%</option>
                            </optgroup>
                        </select>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-128 space-y-2">
                            {sortedPlayers.map((player, i) => {
                                const statKey = statKeyMap[sortStat] as keyof DerivedPlayerStats;
                                const rawStat = statKey && player ? player.stats[statKey] : null;
                                const formattedStat = typeof rawStat === 'number' ? !Number.isFinite(rawStat) ? '-' : ['ba', 'obp', 'slg', 'ops', 'era', 'whip', 'kbb', 'k9', 'bb9', 'h9', 'hr9'].includes(statKey!) ? rawStat.toFixed(3) : Math.round(rawStat).toString() : '';
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center p-1 rounded link-hover cursor-pointer transition" onClick={() => { setExpandedPlayers(prev => ({ ...prev, [player.player_id]: !prev[player.player_id], })) }}>
                                            <div className="flex items-center gap-3 w-full">
                                                <span className="w-4 text-xl text-center">{player.emoji}</span>
                                                <span className="w-8 text-sm text-right">#{player.number}</span>
                                                <span className="w-6 text-sm font-bold text-theme-text opacity-80 text-right">{player.position}</span>
                                                <span className="flex-1 font-semibold text-left overflow-hidden text-ellipsis whitespace-nowrap">{player.first_name} {player.last_name}</span>
                                                {sortStat && (
                                                    <span className="ml-auto w-20 text-right text-sm opacity-70 text-theme-text font-mono">
                                                        {formattedStat}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {expandedPlayers[player.player_id] && (() => {
                                            const statsPlayer = players?.find(p => p?.id === player.player_id);
                                            if (!statsPlayer) return null;

                                            return <ExpandedPlayerStats player={{ ...(player as any), ...(statsPlayer as Player), }} />;
                                        })()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-bold">Recent Events</span>
                            <div className="flex gap-3 mb-2">
                                <CheckboxDropdown
                                    label="Seasons"
                                    options={["1", "2", "3", "4"]}
                                    selected={selectedSeasons}
                                    setSelected={setSelectedSeasons}
                                    isOpen={dropdownOpen.season}
                                    toggleOpen={() => setDropdownOpen((prev) => ({ ...prev, season: !prev.season }))}
                                />
                                <CheckboxDropdown
                                    label="Types"
                                    options={uniqueTypes}
                                    selected={feedFilters}
                                    setSelected={setFeedFilters}
                                    isOpen={dropdownOpen.type}
                                    toggleOpen={() => setDropdownOpen((prev) => ({ ...prev, type: !prev.type }))}
                                />
                            </div>
                        </div>
                        <div className="bg-theme-primary rounded-xl p-3 max-h-60 overflow-y-auto text-sm space-y-1">
                            {feed!.filter((event: any) =>
                                selectedSeasons.includes(event.season?.toString()) && feedFilters.includes(event.type)).slice().reverse().map((event: any, i: number) => {
                                    const parts = event.text.split(/( vs\. | - )/);

                                    return (
                                        <div key={i}>
                                            {event.emoji} Season {event.season}, {event.status}, Day {event.day}:{' '}
                                            {event.type === 'game' ? (() => {
                                                let linkIndex = 0;
                                                return parts.map((part: string, index: number) => {
                                                    if (/^\s*vs\.\s*$|^\s*-\s*$/.test(part)) { return <span key={`sep-${index}`}>{part}</span>; }

                                                    const link = event.links?.[linkIndex];
                                                    linkIndex++;

                                                    if (!link) {
                                                        return <span key={`text-${index}`}>{part}</span>;
                                                    }

                                                    const href = link.type === 'game' ? `/watch/${link.id}` : `/${link.type}/${link.id}`;

                                                    return (
                                                        <Link key={`link-${index}`} href={href}>
                                                            <span className="underline cursor-pointer">{part}</span>
                                                        </Link>
                                                    );
                                                });
                                            })() : event.text}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}