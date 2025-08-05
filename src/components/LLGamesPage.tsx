'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { Game, MapAPIGameResponse } from "@/types/Game";
import { MapAPITeamResponse } from "@/types/Team";
import { useSettings } from "./Settings";
import { FullBlobileDisplay } from "./BlobileLayout";
import Link from "next/link";
import { LiveGameCompact } from "./LiveGameCompact";
import { MMOLBWatchPageHeader } from "./GLGamesPage";
import { CashewsGame } from "@/types/FreeCashews";
import { GameHeader } from "./GameHeader";
import { useQuery } from "@tanstack/react-query";
import { getCachedLesserLeagues } from "@/lib/cache";
import { fetchTeamGames } from "@/types/Api";

async function fetchDayGames(league: string, day: number): Promise<DayGame[]> {
    const gameRes = await fetch(`/nextapi/day-games/${day}?league=${league}`);
    if (!gameRes.ok) throw new Error('Failed to load game data');
    const gamesData = await gameRes.json();
    return gamesData.games.map((game: any) => MapDayGameAPIResponse(game));
}

async function fetchLeagueName(leagueId: string): Promise<string> {
    const leagueData = await getCachedLesserLeagues();
    return leagueData.find((league) => league.id === leagueId)?.name ?? 'Error loading league';
}

async function fetchGameHeader(gameID: string): Promise<{ game: Game, gameId: string, awayTeam: any, homeTeam: any, _debug: Record<any, any> }> {
    const res = await fetch(`/nextapi/gameheader/${gameID}`);
    if (!res.ok) throw new Error('Failed to load game header for ' + gameID);
    return await res.json();
}

type GameCardProps = {
    game: DayGame;
}

function GameCard({ game }: GameCardProps) {
    const { settings } = useSettings();
    
    const isGameLive = game.status !== 'Final' && game.status !== 'Scheduled';
    const shouldFetchGameData = game.status !== 'Scheduled';

    const { data: gameHeader } = useQuery({
        queryKey: ['gameHeader', game.game_id],
        queryFn: () => fetchGameHeader(game.game_id),
        enabled: shouldFetchGameData,
        refetchInterval: Infinity, // Gameheader is used to fetch data that doesn't change unless game is over. Just never refetch
        staleTime: 1000 * 60 * 1
    });

    const { data: historicGames } = useQuery({
        queryKey: ['historicGames', game.home_team_id],
        queryFn: async () => {
            return await fetchTeamGames(game.home_team_id, 4); // Change hardcoded value later
        },
        enabled: !!gameHeader,
        refetchInterval: isGameLive ? 1000 * 60 * 10 : false,
        staleTime: 1000 * 60 * 8,
    });

    // Show basic header if the game isn't live
    if (!gameHeader) {
        return (
            <Link href={`/watch/${game.game_id}`}>
                <GameHeader game={game} killLinks={true} />
            </Link>
        );
    }
    
    return settings.homePage?.useBlasesloaded ? (
        <Link href={"/game/" + game.game_id}>
            <FullBlobileDisplay gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} />
        </Link>
    ) : (
        <Link href={"/game/" + game.game_id}>
            <LiveGameCompact 
                gameId={gameHeader.gameId} 
                homeTeam={MapAPITeamResponse(gameHeader.homeTeam)} 
                awayTeam={MapAPITeamResponse(gameHeader.awayTeam)} 
                game={MapAPIGameResponse(gameHeader.game)} 
                killLinks={true} 
                historicGames={historicGames ?? []} 
            />
        </Link>
    );
}

type LLGamesPageProps = {
    season: number;
    initialDay: number;
    league: string;
}

export default function LLGamesPage({ season, initialDay, league }: LLGamesPageProps) {
    const [page, setPage] = useState<number>(1);
    const [gamesPerPage, setGamesPerPage] = useState<number>(20); // Will be implemented eventually™
    const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
    const [gridView, setGridView] = useState<boolean>(false);
    const [day, setDay] = useState<number>(initialDay);

    useEffect(() => {
        setFavoriteTeams(JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]'));
    }, []);

    const { data: leagueName } = useQuery({
        queryKey: ['leagueName', league],
        queryFn: () => fetchLeagueName(league),
        staleTime: Infinity,
    });
    
    const { data: dayGames, isLoading, isFetching } = useQuery({
        queryKey: ['day-games', league, day],
        queryFn: () => fetchDayGames(league, day),
        staleTime: 1000 * 60 * 3
    });

    const sortedDayGames = useMemo(() => {
        if (!dayGames) return [];

        const favoriteSet = new Set(favoriteTeams);
        return [...dayGames].sort((a, b) => {
            const isAFavourite = favoriteSet.has(a.home_team_id) || favoriteSet.has(a.away_team_id);
            const isBFavourite = favoriteSet.has(b.home_team_id) || favoriteSet.has(b.away_team_id);
            if (isAFavourite && !isBFavourite) return -1;
            if (!isAFavourite && isBFavourite) return 1;
            return 0;
        });
    }, [dayGames, favoriteTeams]);
    
    const totalPages = sortedDayGames ? Math.ceil(sortedDayGames.length / gamesPerPage) : 0;
    const paginatedDayGames = sortedDayGames.slice((page - 1) * gamesPerPage, gamesPerPage * page);
    
    if (isLoading) return (<Loading />);

    return (
        <main className="mt-16">
            <div className={`min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 ${gridView ? '' : 'max-w-3xl mx-auto'}`}>
                <MMOLBWatchPageHeader setDay={setDay} day={day} season={season} />
                
                <div className="text-center mb-4 font-semibold">{leagueName || 'League'} {isFetching && !isLoading && '(Updating...)'}</div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mb-2 gap-4">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching} className="px-2 py-1 bg-theme-primary rounded">
                            Prev
                        </button>
                        <div>Page {page} of {totalPages}</div>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isFetching} className="px-2 py-1 bg-theme-primary rounded">
                            Next
                        </button>
                    </div>
                )}
                <div className="flex justify-center mb-4">
                    <button onClick={() => setGridView((prev) => !prev)} className="px-2 py-1 bg-theme-primary rounded">
                        Toggle Grid View
                    </button>
                </div>

                {(isFetching && dayGames && dayGames.length === 0) ? (
                    <Loading />
                ) : 
                (paginatedDayGames.length === 0 && !isFetching) ? (
                    day > initialDay 
                    ? <div className="text-center">You're in the future 🎉<br/>And yet they say time travel isn't real</div>
                    : <div className="text-center">No games found for this day.</div>
                ) : 
                (
                    <div className={`${gridView ? 'grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(40rem,1fr))] gap-4' : 'flex flex-col gap-4'}`}>
                        {paginatedDayGames
                            .filter(game => game && game.game_id)
                            .map((game) => (
                                <GameCard key={game.game_id} game={game} />
                            ))
                        }
                    </div>
                )}
            </div>
        </main>
    );
}