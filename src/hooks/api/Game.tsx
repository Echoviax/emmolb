import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { Game, MapAPIGameResponse } from "@/types/Game";
import { QueryFunctionContext, useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";

type GameHeaderQueryKey = readonly ['gameheader', gameId: string | undefined]
export type GameHeaderQueryData = {
    game: Game;
    gameId: string;
}

async function fetchGameHeader({ queryKey }: QueryFunctionContext<GameHeaderQueryKey>): Promise<GameHeaderQueryData> {
    const [_, gameId] = queryKey;
    if (!gameId) throw new Error('gameId is required');
    const res = await fetch(`/nextapi/gameheader/${gameId}`);
    if (!res.ok) throw new Error('Failed to load game header data');
    const data = await res.json();
    return {
        game: MapAPIGameResponse(data.game),
        gameId,
    };
}

type GameHeaderQueryOptions<TData> = {
    gameId?: string;
} & Omit<UseQueryOptions<GameHeaderQueryData, Error, TData, GameHeaderQueryKey>, 'queryKey' | 'queryFn'>

function getGameHeaderQueryOptions<TData>({ gameId, ...options }: GameHeaderQueryOptions<TData>) {
    return {
        queryKey: ['gameheader', gameId] as GameHeaderQueryKey,
        queryFn: fetchGameHeader,
        staleTime: 5 * 60000,
        ...options,
        enabled: options.enabled && !!gameId,
    };
}

export function useGameHeader<TData>(options: GameHeaderQueryOptions<TData>) {
    return useQuery(getGameHeaderQueryOptions(options));
}

type GameHeadersQueryOptions<TData> = {
    gameIds?: string[];
} & Omit<UseQueryOptions<GameHeaderQueryData, Error, TData, GameHeaderQueryKey>, 'queryKey' | 'queryFn'>

export function useGameHeaders<TData>({ gameIds = [], ...options }: GameHeadersQueryOptions<TData>) {
    return useQueries({
        queries: gameIds.map(gameId => getGameHeaderQueryOptions({ gameId, ...options })),
        combine: results => ({
            data: results.map(x => x.data).filter(x => !!x),
            isPending: results.some(x => x.isPending),
        }),
    });
}

type DayGamesQueryKey = readonly ['day-games', day: number | undefined, { league?: string, limit?: number }]
type DayGamesQueryOptions<TData> = {
    day?: number;
    league?: string;
    limit?: number;
} & Omit<UseQueryOptions<DayGame[], Error, TData, DayGamesQueryKey>, 'queryKey' | 'queryFn'>

async function fetchDayGames({ queryKey }: QueryFunctionContext<DayGamesQueryKey>): Promise<DayGame[]> {
    const [_, day, { league, limit }] = queryKey;
    if (!day) throw new Error('day is required');
    const params = [];
    if (league) params.push(`league=${league}`);
    if (limit) params.push(`limit=${limit}`);
    const res = await fetch(`/nextapi/day-games/${day}?${params.join('&')}`);
    if (!res.ok) throw new Error('Failed to load day game data');
    const data = await res.json();
    return data.games.map((game: any) => MapDayGameAPIResponse(game));
}

export function useDayGames<TData>({ day, league, limit, ...options }: DayGamesQueryOptions<TData>) {
    return useQuery({
        queryKey: ['day-games', day, { league, limit }] as DayGamesQueryKey,
        queryFn: fetchDayGames,
        staleTime: 10 * 60000,
        ...options,
        enabled: options.enabled && !!day,
    });
}
