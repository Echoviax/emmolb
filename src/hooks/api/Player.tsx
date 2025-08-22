import { QueryFunctionContext, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { combineEnabled } from "./helpers";
import { MapAPIPlayerResponse, Player } from "@/types/Player";

type PlayerQueryKey = readonly ['player', playerId: string | undefined]

async function fetchPlayer({ queryKey }: QueryFunctionContext<PlayerQueryKey>): Promise<Player> {
    const [_, playerId] = queryKey;
    if (!playerId) throw new Error('playerId is required');
    const res = await fetch(`/nextapi/players?ids=${playerId}`);
    if (!res.ok) throw new Error('Failed to load player');
    const data = await res.json();
    return MapAPIPlayerResponse(data.players[0]);
}

type PlayerQueryOptions<TData> = {
    playerId?: string;
} & Omit<UseQueryOptions<Player, Error, TData, PlayerQueryKey>, 'queryKey' | 'queryFn'>

function getPlayerQueryOptions<TData>({ playerId, ...options }: PlayerQueryOptions<TData>) {
    return {
        queryKey: ['player', playerId] as PlayerQueryKey,
        queryFn: fetchPlayer,
        staleTime: 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!playerId),
    };
}

export function usePlayer<TData = Player>({ ...options }: PlayerQueryOptions<TData>) {
    return useQuery(getPlayerQueryOptions(options));
}

type PlayersQueryKey = readonly ['player', playerIds: string[] | undefined]

async function fetchPlayers({ queryKey }: QueryFunctionContext<PlayersQueryKey>): Promise<Player[]> {
    const [_, playerIds] = queryKey;
    if (!playerIds) throw new Error('playerIds is required');
    const res = await fetch(`/nextapi/players?ids=${playerIds.join(',')}`);
    if (!res.ok) throw new Error('Failed to load players');
    const data = await res.json();
    return data.players.map((player: any) => MapAPIPlayerResponse(player));
}

type PlayersQueryOptions<TData> = {
    playerIds?: string[];
} & Omit<UseQueryOptions<Player[], Error, TData, PlayersQueryKey>, 'queryKey' | 'queryFn'>

export function usePlayers<TData = Player[]>({ playerIds = [], ...options }: PlayersQueryOptions<TData>) {
    return useQuery({
        queryKey: ['player', playerIds],
        queryFn: fetchPlayers,
        staleTime: 60000,
        ...options,
        enabled: combineEnabled(options.enabled, playerIds.length > 0),
    })
}

type PlayerPitchSelectionQueryKey = readonly ['player-pitch-selection', playerId: string | undefined]

type PlayerPitchSelectionQueryData = {
    pitch_type: string,
    count: number,
}

async function fetchPlayerPitchSelection({ queryKey }: QueryFunctionContext<PlayerPitchSelectionQueryKey>): Promise<PlayerPitchSelectionQueryData[]> {
    const [_, playerId] = queryKey;
    if (!playerId) throw new Error('playerId is required');
    const res = await fetch(`/nextapi/player/${playerId}/pitch-selection`);
    if (!res.ok) throw new Error('Failed to load player');
    const data = await res.json();
    return data;
}

type PlayerPitchSelectionQueryOptions<TData> = {
    playerId?: string;
} & Omit<UseQueryOptions<PlayerPitchSelectionQueryData[], Error, TData, PlayerPitchSelectionQueryKey>, 'queryKey' | 'queryFn'>

export function usePlayerPitchSelection<TData = PlayerPitchSelectionQueryData[]>({ playerId, ...options }: PlayerPitchSelectionQueryOptions<TData>) {
    return useQuery({
        queryKey: ['player-pitch-selection', playerId],
        queryFn: fetchPlayerPitchSelection,
        staleTime: 60 * 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!playerId),
    });
}