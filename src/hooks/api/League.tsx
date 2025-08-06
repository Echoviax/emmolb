import { fetchCachedLesserLeagues } from "@/types/Api";
import { League } from "@/types/League";
import { QueryFunctionContext, useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { combineEnabled } from "./helpers";
import { MapAPILeagueTeamResponse, Team } from "@/types/Team";

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

function getLeagueQueryOptions<TData>({ leagueId, ...options }: LeagueQueryOptions<TData>) {
    return {
        queryKey: ['league', leagueId] as LeagueQueryKey,
        queryFn: fetchLeague,
        staleTime: 24 * 60 * 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!leagueId),
    };
}

export function useLeague<TData = League>(options: LeagueQueryOptions<TData>) {
    return useQuery(getLeagueQueryOptions(options));
}

type LeaguesQueryOptions<TData> = {
    leagueIds?: string[];
} & Omit<UseQueryOptions<League, Error, TData, LeagueQueryKey>, 'queryKey' | 'queryFn'>

export function useLeagues<TData = League>({ leagueIds = [], ...options }: LeaguesQueryOptions<TData>) {
    return useQueries({
        queries: leagueIds.map(leagueId => getLeagueQueryOptions({ leagueId, ...options })),
        combine: results => ({
            data: results.map(x => x.data),
            isPending: results.some(x => x.isPending),
        }),
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

type LeagueTopTeamsQueryKey = readonly ['league-top-teams', leagueId: string | undefined]

async function fetchLeagueTopTeams({ queryKey }: QueryFunctionContext<LeagueTopTeamsQueryKey>): Promise<Team[]> {
    const [_, leagueId] = queryKey;
    if (!leagueId) throw new Error('leagueId is required');
    const res = await fetch(`/nextapi/league-top-teams/${leagueId}`);
    if (!res.ok) throw new Error('Failed to load league data');
    const data = await res.json();
    if (!Array.isArray(data.teams)) throw new Error('Teams response was not an array');
    return data.teams.map((team: any) => MapAPILeagueTeamResponse(team));
}

type LeagueTopTeamsQueryOptions<TData> = {
    leagueId?: string;
} & Omit<UseQueryOptions<Team[], Error, TData, LeagueTopTeamsQueryKey>, 'queryKey' | 'queryFn'>

export function getLeagueTopTeamsQueryOptions<TData = Team[]>({ leagueId, ...options }: LeagueTopTeamsQueryOptions<TData>) {
    return {
        queryKey: ['league-top-teams', leagueId] as LeagueTopTeamsQueryKey,
        queryFn: fetchLeagueTopTeams,
        staleTime: 2 * 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!leagueId),
    };
}

export function useLeagueTopTeams<TData = Team[]>(options: LeagueTopTeamsQueryOptions<TData>) {
    return useQuery(getLeagueTopTeamsQueryOptions(options));
}

type LeaguesTopTeamsQueryOptions<TData> = {
    leagueIds?: string[];
} & Omit<UseQueryOptions<Team[], Error, TData, LeagueTopTeamsQueryKey>, 'queryKey' | 'queryFn'>

export function useLeaguesTopTeams<TData = Team[]>({ leagueIds = [], ...options }: LeaguesTopTeamsQueryOptions<TData>) {
    return useQueries({
        queries: leagueIds.map(leagueId => getLeagueTopTeamsQueryOptions({ leagueId, ...options })),
        combine: results => ({
            data: results.map(x => x.data),
            isPending: results.some(x => x.isPending),
        }),
    });
}
