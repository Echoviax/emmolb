'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LiveGameTiny } from "./LiveGameTiny";
import { fetchCachedLesserLeagues, fetchTime } from "@/types/Api";
import { usePathname } from "next/navigation";
import { League } from "@/types/League";
import { Game, MapAPIGameResponse } from "@/types/Game";
import { useLesserLeagues } from "@/hooks/api/League";
import { useMmolbDay } from "@/hooks/api/Time";
import { useDayGames, useGameHeaders } from "@/hooks/api/Game";
import { useTeamDayGameIds, useTeamSchedules } from "@/hooks/api/Team";

type GameWithId = {
    game: Game,
    gameId: string
}

const SETTING_LEAGUE = 'leagueScoreboard_league';
const SETTING_DAY = 'leagueScoreboard_day';
const SETTING_DAYLASTSET = 'leagueScoreboard_dayLastSet';
const MAX_GAMES = 8;

export default function LeagueScoreboard() {
    const path = usePathname();
    const currentDay = useMmolbDay();
    const currentDayNum = typeof currentDay === 'string' && currentDay.startsWith('Superstar') ? 120
        : (typeof currentDay === 'number' ? currentDay : 0);

    const [isDaySetManually, setIsDaySetManually] = useState(() => {
        const dayLastSetSetting = localStorage.getItem(SETTING_DAYLASTSET);
        if (dayLastSetSetting) {
            const dayLastSetDate = new Date(dayLastSetSetting);
            const hourAgo = new Date();
            hourAgo.setHours(hourAgo.getHours() - 1);
            return (dayLastSetDate > hourAgo);
        }
        return false;
    })

    const [day, setDay] = useState(() => {
        const daySetting = localStorage.getItem(SETTING_DAY);
        return isDaySetManually && daySetting ? Number(daySetting) : currentDayNum;
    });

    useEffect(() => {
        if (!isDaySetManually)
            setDay(currentDayNum);
    }, [currentDayNum]);

    const favoriteTeamIds = useMemo(() => JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]'), []);
    const lesserLeagues = useLesserLeagues();
    const [league, setLeague] = useState(() => localStorage.getItem(SETTING_LEAGUE) ?? 'greater');
    const lesserLeagueId = (league !== 'favorites' && league !== 'greater') ? league : undefined;

    let dayDisplay = day;
    if (league === 'greater' && day % 2 === 0)
        dayDisplay = day - 1;
    else if (league !== 'greater' && league !== 'favorites' && day % 2 === 1)
        dayDisplay = day - 1;

    const favoritesGameIds = useTeamDayGameIds({
        teamIds: favoriteTeamIds,
        day: dayDisplay,
        enabled: league === 'favorites'
    });

    const leagueDayGames = useDayGames({
        day: dayDisplay,
        league: lesserLeagueId,
        limit: MAX_GAMES + 1,
        enabled: league !== 'favorites',
        select: (dayGames: DayGame[]) => dayGames.map(game => game.game_id)
    });

    const gameIds = league === 'favorites'
        ? [...new Set(favoritesGameIds.data)]
        : leagueDayGames.data ?? [];
    const games = useGameHeaders(gameIds
        .filter(gameId => !path.includes(gameId))
        .slice(0, MAX_GAMES));

    const [gamesDisplay, setGamesDisplay] = useState<GameWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!games.isPending &&
            ((league === 'favorites' && !favoritesGameIds.isPending) ||
            (league !== 'favorites' && !leagueDayGames.isPending))) {
            setGamesDisplay(games.data);
            setIsLoading(false);
        }
    }, [games.data, games.isPending, favoritesGameIds.isPending, leagueDayGames.isPending]);

    function earliestDayForLeague() {
        if (league === 'favorites' || league === 'greater') {
            return 1;
        } else {
            return 2;
        }
    }

    function latestDayForLeague(): number {
        if (league === 'favorites') {
            return currentDayNum;
        } else if (league === 'greater') {
            return currentDayNum % 2 === 1 ? currentDayNum : currentDayNum - 1;
        } else {
            return currentDayNum % 2 === 0 ? currentDayNum : currentDayNum - 1;
        }
    }

    function prevDay() {
        setDay(day => {
            const newDay = Math.max(earliestDayForLeague(), (league === 'favorites') ? day - 1 : day - 2);
            localStorage.setItem(SETTING_DAY, String(newDay));
            localStorage.setItem(SETTING_DAYLASTSET, String(new Date()));
            return newDay;
        });
        setIsDaySetManually(true);
    }

    function nextDay() {
        setDay(day => {
            const newDay = Math.min(latestDayForLeague(), (league === 'favorites') ? day + 1 : day + 2);
            localStorage.setItem(SETTING_DAY, String(newDay));
            localStorage.setItem(SETTING_DAYLASTSET, String(new Date()));
            return newDay;
        });
        setIsDaySetManually(true);
    }

    function updateLeague(newLeague: string) {
        setLeague(newLeague);
        localStorage.setItem(SETTING_LEAGUE, newLeague);
    }

    return (
        <div className='flex flex-row flex-nowrap gap-4 justify-center-safe max-w-screen min-h-16'>
            {!isLoading && day && <>
                <div className='grid content-center justify-items-center items-center gap-x-4 gap-y-1'>
                    <div className='row-1 col-1 text-xs font-semibold uppercase'>League</div>
                    <select className='row-2 col-1 text-sm bg-(--theme-primary) p-1 rounded-sm' value={league} onChange={(evt) => updateLeague(evt.target.value)}>
                        <option className='bg-(--theme-primary)' value='favorites'>❤️ Favorites</option>
                        <option className='bg-(--theme-primary)' value='greater'>🏆 Greater</option>
                        {lesserLeagues.map((l, idx) => <option key={idx} value={l.id}>{l.emoji} {l.name}</option>)}
                    </select>
                    <div className='row-1 col-2 text-xs font-semibold uppercase'>Day</div>
                    <div className='flex text-md gap-1 cursor-default'>
                        <div className={`${day > earliestDayForLeague() ? 'cursor-pointer' : 'opacity-20'}`} onClick={prevDay}>◀</div>
                        <div>{dayDisplay}</div>
                        <div className={`${day < latestDayForLeague() ? 'cursor-pointer' : 'opacity-20'}`} onClick={nextDay}>▶</div>
                    </div>
                </div>
                <div className='flex flex-row flex-nowrap gap-2 overflow-x-auto snap-x' style={{ scrollbarColor: 'var(--theme-primary) var(--theme-background)', scrollbarWidth: 'thin' }}>
                    {gamesDisplay.map(({ game, gameId }, i) => (
                        <Link key={gameId + 'link'} href={'/game/' + gameId} className='snap-start'>
                            <LiveGameTiny key={gameId} game={game} gameId={gameId} />
                        </Link>
                    ))}
                    {gamesDisplay.length === 0 && <div className='self-center text-base opacity-60'>No games on selected day.</div>}
                </div>
            </>}
        </div>
    );
}