import { fetchCachedLesserLeagues } from "@/types/Api";
import { League } from "@/types/League";
import { QueryFunctionContext, useQuery, UseQueryOptions } from "@tanstack/react-query";

type LeagueQueryKey = readonly ['league', leagueId: string | undefined]

async function fetchLeague({ queryKey }: QueryFunctionContext<LeagueQueryKey>): Promise<League> {
    const [_, leagueId] = queryKey;
    if (!leagueId) throw new Error('leagueId is required');
    const res = await fetch(`/nextapi/league/${leagueId}`);
    if (!res.ok) throw new Error('Failed to load league data');
    const data = await res.json();
    return {
        color: data.Color,
        emoji: data.Emoji,
        league_type: data.LeagueType,
        name: data.Name,
        teams: data.Teams,
        id: data._id,
    };
}

type LeagueQueryOptions<TData> = {
    leagueId?: string;
} & Omit<UseQueryOptions<League, Error, TData, LeagueQueryKey>, 'queryKey' | 'queryFn'>

export function useLeague<TData>({ leagueId, ...options }: LeagueQueryOptions<TData>) {
    return useQuery({
        queryKey: ['league', leagueId],
        queryFn: fetchLeague,
        staleTime: 24 * 60 * 60000,
        ...options,
        enabled: options.enabled && !!leagueId,
    });
}

type LesserLeaguesQueryKey = readonly ['lesser-leagues']

async function fetchLesserLeagues({ }: QueryFunctionContext<LesserLeaguesQueryKey>): Promise<League[]> {
    return fetchCachedLesserLeagues();
}

type LesserLeaguesQueryOptions<TData> =
    Omit<UseQueryOptions<League[], Error, TData, LesserLeaguesQueryKey>, 'queryKey' | 'queryFn'>

export function useLesserLeagues<TData = League[]>({ ...options }: LesserLeaguesQueryOptions<TData> | undefined) {
    return useQuery({
        queryKey: ['lesser-leagues'],
        queryFn: fetchLesserLeagues,
        staleTime: 24 * 60 * 60000,
        ...options,
    });
}
