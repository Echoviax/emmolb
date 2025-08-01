'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { LiveGameTiny } from "./LiveGameTiny";
import { fetchLeague, fetchTime } from "@/types/Api";
import { usePathname } from "next/navigation";
import { League, lesserLeagueIds } from "@/types/League";
import { Game, MapAPIGameResponse } from "@/types/Game";

type GameHeaderApiResponse = {
    teamId: string;
    gameHeader: GameHeaderResponse;
}

type GameHeaderResponse = {
    game: any;
    gameId: any;
    awayTeam: any;
    homeTeam: any;
}

type GameWithId = {
    game: Game,
    gameId: string
}

const SETTING_LEAGUE = 'leagueScoreboard_league';
const SETTING_DAY = 'leagueScoreboard_day';
const SETTING_DAYLASTSET = 'leagueScoreboard_dayLastSet';

export default function LeagueScoreboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [games, setGames] = useState<{ game: Game, gameId: string }[]>([]);
    const [day, setDay] = useState(0);
    const [currentDay, setCurrentDay] = useState(0);
    const [league, setLeague] = useState(localStorage.getItem(SETTING_LEAGUE) ?? 'favorites');
    const [leagues, setLeagues] = useState<League[]>([]);
    const path = usePathname();

    useEffect(() => {
        async function APICalls() {
            try {
                const leaguesRes = await Promise.all(lesserLeagueIds.map(id => fetchLeague(id)));
                setLeagues(leaguesRes);

                const time = await fetchTime();
                setCurrentDay(time.seasonDay);

                const dayLastSetSetting = localStorage.getItem(SETTING_DAYLASTSET);
                const daySetting = localStorage.getItem(SETTING_DAY);
                if (dayLastSetSetting && daySetting) {
                    const dayLastSetDate = new Date(dayLastSetSetting);
                    const hourAgo = new Date();
                    hourAgo.setHours(hourAgo.getHours() - 2);
                    if (dayLastSetDate > hourAgo)
                        setDay(Number(daySetting));
                    else
                        setDay(time.seasonDay);
                } else {
                    setDay(time.seasonDay);
                }
            } catch (err) {
                console.error(err);
            } finally {
            }
        }

        APICalls();
    }, []);

    useEffect(() => {
        async function APICalls() {
            try {
                if (!day) return;
                if (league === 'favorites') {
                    const favoriteTeamIDs = JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]');
                    const teamIdToGame: Record<string, GameWithId> = {};
                    if (day === currentDay) {
                        const res = await fetch('/nextapi/gameheaders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ teamIds: favoriteTeamIDs }),
                        });
                        if (!res.ok) throw new Error('Failed to load game headers');

                        const data: GameHeaderApiResponse[] = await res.json();
                        for (const dataGame of data) {
                            const game = MapAPIGameResponse(dataGame.gameHeader.game);
                            const gameWithId = { game, gameId: dataGame.gameHeader.gameId };
                            teamIdToGame[game.away_team_id] = gameWithId;
                            teamIdToGame[game.home_team_id] = gameWithId;
                        }
                    }

                    const prevGames = await Promise.all(favoriteTeamIDs.map(async (teamId: string) => {
                        if (teamIdToGame[teamId])
                            return null;

                        const scheduleRes = await fetch(`/nextapi/team-schedule/${teamId}`);
                        if (!scheduleRes.ok) return null;
                        const schedule = await scheduleRes.json();
                        const gameId = schedule?.games?.find((g: any) => g.day === day || g.day === day - 1)?.game_id;
                        if (!gameId)
                            return null;

                        const gameHeaderRes = await fetch(`/nextapi/gameheader/${gameId}`);
                        if (!gameHeaderRes.ok) return null;
                        const game = MapAPIGameResponse((await gameHeaderRes.json()).game);
                        return { game, gameId };
                    }));

                    for (const prevGame of prevGames.filter(x => x !== null)) {
                        teamIdToGame[prevGame.game.away_team_id] = prevGame;
                        teamIdToGame[prevGame.game.home_team_id] = prevGame;
                    }

                    const gameIds = new Set<string>();
                    const uniqueGames: GameWithId[] = [];
                    for (const teamId of favoriteTeamIDs) {
                        const gameWithId = teamIdToGame[teamId];
                        if (gameWithId && !gameIds.has(gameWithId.gameId)) {
                            uniqueGames.push(gameWithId);
                            gameIds.add(gameWithId.gameId);
                        }
                    }
                    setGames(uniqueGames);
                } else {
                    let dayGamesRes;
                    if (league === 'greater') {
                        const nearestDay = day % 2 === 1 ? day : day - 1;
                        dayGamesRes = await fetch(`/nextapi/day-games/${nearestDay}`);
                    } else {
                        const nearestDay = day % 2 === 0 ? day : day - 1;
                        dayGamesRes = await fetch(`/nextapi/day-games/${nearestDay}?league=${league}&limit=8`);
                    }

                    if (!dayGamesRes.ok) throw new Error('Failed to load game data');
                    const gamesData = await dayGamesRes.json();
                    const dayGames = gamesData.games.map((game: any): DayGame => MapDayGameAPIResponse(game)).filter((dayGame: DayGame) => !path.includes(dayGame.game_id));
                    const games = await Promise.all(dayGames.map(async (dayGame: DayGame) => {
                        const gameHeaderRes = await fetch(`/nextapi/gameheader/${dayGame.game_id}`);
                        if (!gameHeaderRes.ok) throw new Error('Failed to load game data');
                        const game = MapAPIGameResponse((await gameHeaderRes.json()).game);
                        return { game, gameId: dayGame.game_id };
                    }));
                    setGames(games);
                }
                setIsLoading(false);
            } catch (err) {
                console.error(err);
            } finally {
            }
        }

        APICalls();
    }, [day, league]);

    function earliestDayForLeague() {
        if (league === 'favorites' || league === 'greater') {
            return 1;
        } else {
            return 2;
        }
    }

    function latestDayForLeague() {
        if (currentDay === undefined)
            return 0;
        if (league === 'favorites') {
            return currentDay;
        } else if (league === 'greater') {
            return currentDay % 2 === 1 ? currentDay : currentDay - 1;
        } else {
            return currentDay % 2 === 0 ? currentDay : currentDay - 1;
        }
    }

    function prevDay() {
        setDay(day => {
            if (day === undefined)
                return day;

            const newDay = Math.max(earliestDayForLeague(), (league === 'favorites') ? day - 1 : day - 2);
            localStorage.setItem(SETTING_DAY, String(newDay));
            localStorage.setItem(SETTING_DAYLASTSET, String(new Date()));
            return newDay;
        });
    }

    function nextDay() {
        setDay(day => {
            if (day === undefined || currentDay === undefined)
                return day;

            const newDay = Math.min(latestDayForLeague(), (league === 'favorites') ? day + 1 : day + 2);
            localStorage.setItem(SETTING_DAY, String(newDay));
            localStorage.setItem(SETTING_DAYLASTSET, String(new Date()));
            return newDay;
        })
    }

    function updateLeague(newLeague: string) {
        setLeague(newLeague);
        localStorage.setItem(SETTING_LEAGUE, newLeague);
    }

    let dayDisplay = day;
    if (league === 'greater' && day % 2 === 0)
        dayDisplay = day - 1;
    else if (league !== 'greater' && league !== 'favorites' && day % 2 === 1)
        dayDisplay = day - 1;

    return (
        <div className='flex flex-row flex-nowrap gap-4 justify-center-safe max-w-screen min-h-16'>
            {!isLoading && day && <>
                <div className='grid content-center justify-items-center items-center gap-x-4 gap-y-1'>
                    <div className='row-1 col-1 text-xs font-semibold uppercase'>League</div>
                    <select className='row-2 col-1 text-sm bg-(--theme-primary) p-1 rounded-sm' value={league} onChange={(evt) => updateLeague(evt.target.value)}>
                        <option className='bg-(--theme-primary)' value='favorites'>❤️ Favorites</option>
                        <option className='bg-(--theme-primary)' value='greater'>🏆 Greater</option>
                        {leagues.map((l, idx) => <option key={idx} value={l.id}>{l.emoji} {l.name}</option>)}
                    </select>
                    <div className='row-1 col-2 text-xs font-semibold uppercase'>Day</div>
                    <div className='flex text-md gap-1 cursor-default'>
                        <div className={`${day > earliestDayForLeague() ? 'cursor-pointer' : 'opacity-20'}`} onClick={prevDay}>◀</div>
                        <div>{dayDisplay}</div>
                        <div className={`${day < latestDayForLeague() ? 'cursor-pointer' : 'opacity-20'}`} onClick={nextDay}>▶</div>
                    </div>
                </div>
                <div className='flex flex-row flex-nowrap gap-2 overflow-x-auto snap-x' style={{scrollbarColor: 'var(--theme-primary) var(--theme-background)', scrollbarWidth: 'thin'}}>
                    {games.filter(({ gameId }) => !path.includes(gameId)).map(({ game, gameId }, i) => (
                        <Link key={gameId + 'link'} href={'/game/' + gameId} className='snap-start'>
                            <LiveGameTiny key={gameId} game={game} gameId={gameId} />
                        </Link>
                    ))}
                    {games.length === 0 && <div className='self-center text-base opacity-60'>No games on selected day.</div>}
                </div>
            </>}
        </div>
    );
}