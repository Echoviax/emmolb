'use client'
import Loading from "@/components/Loading";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LiveGameCompact } from "../LiveGameCompact";
import CheckboxDropdown from "../CheckboxDropdown";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import { useSettings } from "../Settings";
import TeamSchedule from "./TeamSchedule";
import SeasonTrophy from "../SeasonTrophy";
import { useFormattedNextDayCountdown } from "@/helpers/TimeHelper";
import { useSeasonWinners, useTeam, useTeamColors, useTeamFeed } from "@/hooks/api/Team";
import { useGameByTeam, useGameHeader } from "@/hooks/api/Game";
import { TeamRoster } from "./TeamRoster";
import { TeamFeed } from "./TeamFeed";
import { Team } from "@/types/Team";

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

type TeamCurrentGameProps = {
    team: Team;
}

function TeamCurrentGame({ team }: TeamCurrentGameProps) {
    const { data: gameId } = useGameByTeam({
        teamId: team.id,
        refetchInterval: 60000,
    });
    const { data: game } = useGameHeader({ gameId });
    const { data: awayTeam } = useTeam({ teamId: game?.game.away_team_id });
    const { data: homeTeam } = useTeam({ teamId: game?.game.home_team_id });

    if (!gameId || !game || !awayTeam || !homeTeam || game.game.state == "Complete")
        return null;

    return <>
        <Link href={`/game/${gameId}`}>
            <LiveGameCompact homeTeam={homeTeam} awayTeam={awayTeam} game={game.game} gameId={gameId} killLinks={true} />
        </Link>
    </>;
}

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

    const { data: seasonChamps } = useSeasonWinners({});
    const leagueSeasonChamps: Record<number, string> = team && seasonChamps && seasonChamps[team.league];

    function toggleFavorite(teamId: string) {
        setFavorites(prev => {
            const updated = new Set(prev);
            updated.has(teamId) ? updated.delete(teamId) : updated.add(teamId);

            localStorage.setItem('favoriteTeamIDs', JSON.stringify([...updated]));
            return updated;
        });
    }

    if (teamIsPending) return (
        <>
            <Loading />
        </>
    );

    if (!team) return (
        <>
            <div className="text-white text-center mt-10">Can't find that team</div>
        </>
    );

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
                    {settings.teamPage?.showLiveGames && <TeamCurrentGame team={team} />}
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
                    <TeamSchedule id={id} />
                    <div className='flex justify-center'>
                        <Link href={`/team/${team.id}/attributes`} className="block px-4 py-2 link-hover text-theme-secondary rounded mb-4 self-center">
                            View Team Attributes
                        </Link>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-center">Roster</h2>
                    <a href={`https://freecashe.ws/team/${team.id}/stats`} target="_blank" rel="noopener noreferrer">
                        <div className="underline text-center mb-4">View on freecashews</div>
                    </a>
                    <TeamRoster team={team} />
                    <TeamFeed team={team} />
                </div>
            </main>
        </>
    );
}