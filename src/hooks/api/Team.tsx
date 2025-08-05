import { QueryFunctionContext, useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";

type TeamScheduleQueryKey = readonly ['team-schedule', teamId: string | undefined]

async function fetchTeamSchedule({ queryKey }: QueryFunctionContext<TeamScheduleQueryKey>) {
    const [_, teamId] = queryKey;
    if (!teamId) throw new Error('teamId is required');
    const res = await fetch(`/nextapi/team-schedule/${teamId}`);
    if (!res.ok) throw new Error('Failed to load team schedule data');
    const data = await res.json();
    return data;
}

type TeamScheduleQueryOptions<TData> = {
    teamId?: string;
} & Omit<UseQueryOptions<any, Error, TData, TeamScheduleQueryKey>, 'queryKey' | 'queryFn'>

function getTeamScheduleQueryOptions<TData>({ teamId, ...options }: TeamScheduleQueryOptions<TData>) {
    return {
        queryKey: ['team-schedule', teamId] as TeamScheduleQueryKey,
        queryFn: fetchTeamSchedule,
        staleTime: 10 * 60000,
        ...options,
        enabled: options.enabled && !!teamId,
    }
}

export function useTeamSchedule<TData>(options: TeamScheduleQueryOptions<TData>) {
    return useQuery(getTeamScheduleQueryOptions(options));
}

type TeamSchedulesQueryOptions<TData> = {
    teamIds?: string[];
} & Omit<UseQueryOptions<any[], Error, TData, TeamScheduleQueryKey>, 'queryKey' | 'queryFn'>

export function useTeamSchedules<TData>({ teamIds = [], ...options }: TeamSchedulesQueryOptions<TData>) {
    return useQueries({
        queries: teamIds.map(teamId => getTeamScheduleQueryOptions({ teamId, ...options })),
        combine: results => ({
            data: results.map(x => x.data).filter(x => !!x),
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
            ...options,
            enabled: options.enabled && !!day && !!teamId,
        })),
        combine: results => ({
            data: results.map(x => x.data),
            isPending: results.some(x => x.isPending)
        }),
    });
}
