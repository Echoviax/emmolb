import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { Game, MapAPIGameResponse } from "@/types/Game";
import { Team } from "@/types/Team";
import { useQueries, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

type GameHeaderResponse = {
    game: Game;
    gameId: string;
}

async function fetchGameHeader({ queryKey }: { queryKey: any }): Promise<GameHeaderResponse> {
    const [_, gameId] = queryKey;
    const res = await fetch(`/nextapi/gameheader/${gameId}`);
    if (!res.ok) throw new Error('Failed to load game header data');
    const data = await res.json();
    return {
        game: MapAPIGameResponse(data.game),
        gameId,
    };
}

export function useGameHeader(gameId: string) {
    return useQuery({
        queryKey: ['gameheader', gameId],
        queryFn: fetchGameHeader,
        enabled: !!gameId,
        staleTime: 5 * 60000,
    });
}

export function useGameHeaders(gameIds: string[] | undefined = []) {
    return useQueries({
        queries: gameIds.map(gameId => ({
            queryKey: ['gameheader', gameId],
            queryFn: fetchGameHeader,
            enabled: !!gameId,
            staleTime: 5 * 60000,
        })),
        combine: results => ({
            data: results.map(x => x.data).filter(x => !!x),
            isPending: results.some(x => x.isPending),
        }),
    });
}

async function fetchDayGames({ queryKey }: { queryKey: any }): Promise<DayGame[]> {
    const [_, day, { league, limit }] = queryKey;
    const params = [];
    if (league) params.push(`league=${league}`);
    if (limit) params.push(`limit=${limit}`);
    const res = await fetch(`/nextapi/day-games/${day}?${params.join('&')}`);
    if (!res.ok) throw new Error('Failed to load day game data');
    const data = await res.json();
    return data.games.map((game: any) => MapDayGameAPIResponse(game));
}

export function useDayGames<TData>({ day, league, limit, ...options }: { day?: number, league?: string, limit?: number} & Omit<UseQueryOptions<DayGame[], Error, TData>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: ['day-games', day, { league, limit }],
        queryFn: fetchDayGames,
        enabled: options.enabled && !!day,
        staleTime: 10 * 60000,
        select: options.select,
    });
}

async function fetchGameIdsForScoreboard({ queryKey }: { queryKey: any }): Promise<string[]> {
    const [_, {day, teamIds}] = queryKey;
    const res = await fetch('/nextapi/gameIds-for-scoreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: day, teamIds: teamIds }),
    });
    if (!res.ok) throw new Error('Failed to game data');
    const data = await res.json();
    return data.gameIds;
}

export function useGameIdsForScoreboard({ day, teamIds, enabled }: { day?: number, teamIds: string[], enabled?: boolean }) {
    return useQuery({
        queryKey: ['gameIds-for-scoreboard', { day, teamIds }],
        queryFn: fetchGameIdsForScoreboard,
        enabled: enabled && !!day && teamIds.length > 0,
        staleTime: 10 * 60000,
    });
}