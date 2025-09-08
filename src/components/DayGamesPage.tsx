'use client'
import { DayGame } from "@/types/DayGame";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { useDayGames } from "@/hooks/api/Game";
import { useLesserLeagues } from "@/hooks/api/League";
import { League } from "@/types/League";
import GameCard from "./GameCard";

type MMOLBWatchPageHeaderProps = {
    setDay: Dispatch<SetStateAction<number>>;
    day: number;
    season: number;
    dayDiff?: number;
};

type DayGamesPageProps = {
    season: number;
    initialDay: number;
    dayDiff?: number;
    league?: string;
    displayFilter?: boolean;
}

export function MMOLBWatchPageHeader({setDay, day, season, dayDiff=2, }: MMOLBWatchPageHeaderProps) {
    return (
        <>
            <div className="flex justify-center items-center mb-4 gap-4">
                <button onClick={() => setDay((d) => Math.max(1, d - dayDiff))}className="px-2 py-1 bg-theme-primary rounded">
                    Prev
                </button>
                <div>Day {day}</div>
                <button onClick={() => setDay((d) => d + dayDiff)} className="px-2 py-1 bg-theme-primary rounded">
                    Next
                </button>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">
                Season {season}, Regular Season, Day {day} Games
            </h1>
        </>
    );
}

export default function DayGamesPage({ season, initialDay, dayDiff=2, league="", displayFilter=true }: DayGamesPageProps) {
    const [page, setPage] = useState<number>(1);
    const [leagueFilter, setLeagueFilter] = useState<string>(league);
    const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
    const [gridView, setGridView] = useState<boolean>(false);
    const [day, setDay] = useState<number>(initialDay);
    const [gamesPerPage, setGamesPerPage] = useState<number>(Number(localStorage.getItem('gamesPerPage')) || 10);

    const updateGamesPerPage = (num: number) => {
        setGamesPerPage(num);
        localStorage.setItem('gamesPerPage', String(num));
    }

    useEffect(() => {
        setFavoriteTeams(JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]'));
    }, []);

    const { data: lesserLeagues } = useLesserLeagues({});
    
    const { data: dayGames, isFetching, isPending } = useDayGames({day, league: leagueFilter === 'all' ? undefined : leagueFilter})

    const sortedDayGames = useMemo(() => {
        if (!dayGames) return [];

        const favoriteSet = new Set(favoriteTeams);
        return [...(dayGames as DayGame[])].sort((a, b) => {
            const isAFavourite = favoriteSet.has(a.home_team_id) || favoriteSet.has(a.away_team_id);
            const isBFavourite = favoriteSet.has(b.home_team_id) || favoriteSet.has(b.away_team_id);
            if (isAFavourite && !isBFavourite) return -1;
            if (!isAFavourite && isBFavourite) return 1;
            return 0;
        });
    }, [dayGames, favoriteTeams]);

    const totalPages = sortedDayGames ? Math.ceil(sortedDayGames.length / gamesPerPage) : 0;
    const paginatedDayGames = sortedDayGames.slice((page - 1) * gamesPerPage, gamesPerPage * page);

    const memoizedGames = useMemo(() => {
        return (
            <div className={`${gridView ? 'grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(40rem,1fr))] gap-4' : 'flex flex-col gap-4'}`}>
                {paginatedDayGames
                    .filter(game => game && game.game_id)
                    .map((game) => (
                        <GameCard key={game.game_id} game={game} />
                    ))
                }
            </div>
        )
    }, [paginatedDayGames]);
    
    return (
        <main className="mt-16">
            <div className={`min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 ${gridView ? '' : 'max-w-3xl mx-auto'}`}>
                <MMOLBWatchPageHeader setDay={setDay} day={day} season={season} dayDiff={dayDiff} />
                
                {displayFilter ? <div className="justify-center flex">
                    <select className="bg-theme-primary text-theme-text px-2 py-1 rounded mb-2" value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)}>
                        <option value="all">All Leagues</option>
                        {lesserLeagues?.map((league: League) => (<option key={league.id} value={league.id}>{league.name}</option>))}
                    </select>
                </div> : null }

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mb-2 gap-4">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching} className="px-2 py-1 bg-theme-primary rounded">
                            Prev
                        </button>
                        <div>Page {page} of {totalPages} {isFetching && !isPending && '(Updating...)'}</div>
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
                <div className="justify-end flex">
                    <label>Games Per Page: </label>
                    <select className="bg-theme-primary text-theme-text px-2 py-1 rounded mb-2" value={gamesPerPage} onChange={(e) => setGamesPerPage(Number(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </div>

                {(isPending) ? (
                    <Loading />
                ) : 
                (paginatedDayGames.length === 0 && !isFetching) ? (
                    day > initialDay 
                    ? <div className="text-center">You're in the future 🎉<br/>And yet they say time travel isn't real</div>
                    : <div className="text-center">No games found for this day.</div>
                ) : 
                (
                    <div>
                        {memoizedGames}
                    </div>
                )}
            </div>
        </main>
    );
}