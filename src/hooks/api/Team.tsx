import { QueryFunctionContext, useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { combineEnabled } from "./helpers";
import { MapAPITeamResponse, Team } from "@/types/Team";
import { FeedMessage } from "@/types/FeedMessage";

type TeamScheduleQueryKey = readonly ['team-schedule', teamId: string | undefined, season?: string | undefined]

// can use ?season=x to get a specific season
// by default, it gets current season
async function fetchTeamSchedule({ queryKey }: QueryFunctionContext<TeamScheduleQueryKey>) {
    const [_, teamId, season] = queryKey;
    if (!teamId) throw new Error('teamId is required');
    const url = season 
        ? `/nextapi/team-schedule/${teamId}?season=${season}`
        : `/nextapi/team-schedule/${teamId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load team schedule data');
    const data = await res.json();
    return data;
}

type TeamScheduleQueryOptions<TData> = {
    teamId?: string;
    season?: string;
} & Omit<UseQueryOptions<any, Error, TData, TeamScheduleQueryKey>, 'queryKey' | 'queryFn'>

function getTeamScheduleQueryOptions<TData>({ teamId, season, ...options }: TeamScheduleQueryOptions<TData>) {
    return {
        queryKey: ['team-schedule', teamId, season] as TeamScheduleQueryKey,
        queryFn: fetchTeamSchedule,
        staleTime: 10 * 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!teamId),
    }
}

export function useTeamSchedule<TData = any>(options: TeamScheduleQueryOptions<TData>) {
    return useQuery(getTeamScheduleQueryOptions(options));
}

type TeamSchedulesQueryOptions<TData> = {
    teamIds?: string[];
} & Omit<UseQueryOptions<any[], Error, TData, TeamScheduleQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamSchedules<TData = any>({ teamIds = [], ...options }: TeamSchedulesQueryOptions<TData>) {
    return useQueries({
        queries: teamIds.map(teamId => getTeamScheduleQueryOptions({ teamId, ...options })),
        combine: results => ({
            data: results.map(x => x.data).filter(x => !!x),
            isPending: results.some(x => x.isPending),
        }),
    });
}

type TeamSeasonSchedulesQueryOptions<TData> = {
    teamId?: string;
    seasons?: string[];
} & Omit<UseQueryOptions<any[], Error, TData, TeamScheduleQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamSeasonSchedules<TData = any>({ teamId, seasons = [], ...options }: TeamSeasonSchedulesQueryOptions<TData>) {
    return useQueries({
        queries: seasons.map(season => getTeamScheduleQueryOptions({ teamId, season, ...options })),
        combine: results => ({
            data: results.reduce((acc, result, index) => {
                if (result.data) {
                    acc[seasons[index]] = result.data;
                }
                return acc;
            }, {} as Record<string, any>),
            isPending: results.some(x => x.isPending),
        }),
    });
}

type TeamDayGameIdQueryKey = readonly ['team-day-gameid', teamId: string | undefined, day: number | undefined]

async function fetchTeamDayGameId({ queryKey, client }: QueryFunctionContext<TeamDayGameIdQueryKey>) {
    function gameIdFromSchedule(schedule: any, day: number) {
        return schedule?.games?.find((g: any) => g.day === day || g.day === day - 1)?.game_id;
    }

    const [_, teamId, day] = queryKey;
    if (!teamId) throw new Error('teamId is required');
    if (!day) throw new Error('day is required');
    // try getting it from cached team schedule data first
    let schedule = client.getQueryData(['team-schedule', teamId]);
    let gameId = gameIdFromSchedule(schedule, day);
    if (!gameId) {
        schedule = await client.fetchQuery({
            queryKey: ['team-schedule', teamId] as TeamScheduleQueryKey,
            queryFn: fetchTeamSchedule,
            staleTime: 60000,
        });
        gameId = gameIdFromSchedule(schedule, day);
    }
    if (!gameId)
        throw new Error(`No game found for team ${teamId} on day ${day}`);
    return gameId;
}

type TeamDayGameIdsQueryOptions<TData> = {
    teamIds?: string[];
    day?: number;
} & Omit<UseQueryOptions<string, Error, TData, TeamDayGameIdQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamDayGameIds<TData>({ teamIds = [], day, ...options }: TeamDayGameIdsQueryOptions<TData>) {
    return useQueries({
        queries: teamIds.map(teamId => ({
            queryKey: ['team-day-gameid', teamId, day] as TeamDayGameIdQueryKey,
            queryFn: fetchTeamDayGameId,
            staleTime: 24 * 60 * 60000,
            retryDelay: (attemptIndex: number) => 60000 * 2 ** attemptIndex,
            ...options,
            enabled: combineEnabled(options.enabled, !!day && !!teamId),
        })),
        combine: results => ({
            data: results.map(x => x.data),
            isPending: results.some(x => x.isPending && x.failureCount === 0),
        }),
    });
}

type TeamQueryKey = readonly ['team', teamId: string | undefined]

async function fetchTeam({ queryKey }: QueryFunctionContext<TeamQueryKey>): Promise<Team> {
    const [_, teamId] = queryKey;
    if (!teamId) throw new Error('teamId is required');
    const res = await fetch(`/nextapi/team/${teamId}`);
    if (!res.ok) throw new Error('Failed to load team schedule data');
    const data = await res.json();
    return MapAPITeamResponse(data);
}

type TeamQueryOptions<TData> = {
    teamId?: string;
} & Omit<UseQueryOptions<any, Error, TData, TeamQueryKey>, 'queryKey' | 'queryFn'>

function getTeamQueryOptions<TData>({ teamId, ...options }: TeamQueryOptions<TData>) {
    return {
        queryKey: ['team', teamId] as TeamQueryKey,
        queryFn: fetchTeam,
        staleTime: 10 * 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!teamId),
    }
}

export function useTeam<TData = Team>(options: TeamQueryOptions<TData>) {
    return useQuery(getTeamQueryOptions(options));
}

type TeamsQueryOptions<TData> = {
    teamIds?: string[];
} & Omit<UseQueryOptions<any[], Error, TData, TeamQueryKey>, 'queryKey' | 'queryFn'>

export function useTeams<TData = Team>({ teamIds = [], ...options }: TeamsQueryOptions<TData>) {
    return useQueries({
        queries: teamIds.map(teamId => getTeamQueryOptions({ teamId, ...options })),
        combine: results => ({
            data: results.map(x => x.data).filter(x => !!x),
            isPending: results.some(x => x.isPending),
        }),
    });
}

type TeamFeedQueryKey = readonly ['feed', teamId: string | undefined]

async function fetchTeamFeed({ queryKey }: QueryFunctionContext<TeamFeedQueryKey>): Promise<FeedMessage[]> {
    const [_, teamId] = queryKey;
    if (!teamId) throw new Error('teamId is required');
    const res = await fetch(`/nextapi/feed/${teamId}`);
    if (!res.ok) throw new Error('Failed to load feed data');
    const data = await res.json();
    return data.feed;
}

type TeamFeedQueryOptions<TData> = {
    teamId?: string;
} & Omit<UseQueryOptions<FeedMessage[], Error, TData, TeamFeedQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamFeed<TData = FeedMessage[]>({ teamId, ...options }: TeamFeedQueryOptions<TData>) {
    return useQuery({
        queryKey: ['feed', teamId],
        queryFn: fetchTeamFeed,
        staleTime: 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!teamId),
    });
}

type TeamColorsQueryKey = readonly ['team-colors', teamIds: string[] | undefined]

async function fetchTeamColors({ queryKey }: QueryFunctionContext<TeamColorsQueryKey>): Promise<Record<string, string>[]> {
    const [_, teamIds] = queryKey;
    if (!teamIds) throw new Error('teamIds is required');
    const res = await fetch('/nextapi/cache/teamcolors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            team_ids: teamIds,
        }),
    });
    if (!res.ok) throw new Error('Failed to load team colors');
    const data = await res.json();
    return data;
}

type TeamColorsQueryOptions<TData> = {
    teamIds?: string[];
} & Omit<UseQueryOptions<Record<string, string>[], Error, TData, TeamColorsQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamColors<TData = Record<string, string>[]>({ teamIds, ...options }: TeamColorsQueryOptions<TData>) {
    return useQuery({
        queryKey: ['team-colors', teamIds],
        queryFn: fetchTeamColors,
        staleTime: 60 * 60000,
        ...options,
        enabled: combineEnabled(options.enabled, !!teamIds?.length),
    });
}

type SeasonWinnersQueryKey = readonly ['season-winners']

async function fetchSeasonWinners({ }: QueryFunctionContext<SeasonWinnersQueryKey>): Promise<any> {
    const res = await fetch(`/nextapi/cache/season-winners`);
    if (!res.ok) throw new Error('Failed to load champions');
    const data = await res.json();
    return data;
}

type SeasonWinnersQueryOptions<TData> =
    Omit<UseQueryOptions<any, Error, TData, SeasonWinnersQueryKey>, 'queryKey' | 'queryFn'>

export function useSeasonWinners<TData = any>({ ...options }: SeasonWinnersQueryOptions<TData>) {
    return useQuery({
        queryKey: ['season-winners'],
        queryFn: fetchSeasonWinners,
        staleTime: 24 * 60 * 60000,
        ...options,
    });
}

type TeamsCorruptedPlayersQueryKey = readonly ['teams-corrupted-players']

async function fetchTeamsCorruptedPlayers({ }: QueryFunctionContext<TeamsCorruptedPlayersQueryKey>): Promise<Record<string, number>> {
    const res = await fetch(`/nextapi/teams-corrupted-players`);
    if (!res.ok) throw new Error('Failed to load corrupted players');
    return await res.json() as Record<string, number>;
}

type TeamsCorruptedPlayersQueryOptions<TData> =
    Omit<UseQueryOptions<Record<string, number>, Error, TData, TeamsCorruptedPlayersQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamsCorruptedPlayers<TData = Record<string, number>>({ ...options }: TeamsCorruptedPlayersQueryOptions<TData>) {
    return useQuery({
        queryKey: ['teams-corrupted-players'],
        queryFn: fetchTeamsCorruptedPlayers,
        staleTime: 5 * 60000,
        ...options,
    });
}
