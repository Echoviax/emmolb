import { QueryClient, useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";

async function fetchTeamSchedule({ queryKey }: { queryKey: any }) {
    const [_, teamId] = queryKey;
    const res = await fetch(`/nextapi/team-schedule/${teamId}`);
    if (!res.ok) throw new Error('Failed to load team data');
    const data = await res.json();
    return data;
}

export function useTeamSchedule({ teamId }: { teamId: string }) {
    return useQuery({
        queryKey: ['team-schedule', teamId],
        queryFn: fetchTeamSchedule,
        enabled: !!teamId,
        staleTime: 10 * 60000,
    });
}

export function useTeamSchedules({ teamIds, ...options }: { teamIds: string[] } & Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
    return useQueries({
        queries: teamIds.map(teamId => ({
            queryKey: ['team-schedule', teamId],
            queryFn: fetchTeamSchedule,
            enabled: options.enabled && !!teamId,
            staleTime: 10 * 60000,
            select: options.select,
        })),
        combine: results => ({
            data: results.map(x => x.data).filter(x => !!x),
            isPending: results.some(x => x.isPending),
        }),
    });
}

async function fetchTeamDayGameId({ queryKey, client }: { queryKey: any, client: QueryClient }) {
    const [_, teamId, day] = queryKey;
    let schedule = client.getQueryData(['team-schedule', teamId]);
    let gameId = (schedule as any)?.games?.find((g: any) => g.day === day || g.day === day - 1)?.game_id;
    if (!gameId) {
        schedule = await client.fetchQuery({
            queryKey: ['team-schedule', teamId],
            queryFn: fetchTeamSchedule,
            staleTime: 60000,
        });
        gameId = (schedule as any)?.games?.find((g: any) => g.day === day || g.day === day - 1)?.game_id;
    }
    return gameId;
}

export function useTeamDayGameIds({ teamIds, day, ...options }: { teamIds: string[], day?: number } & Omit<UseQueryOptions<string>, 'queryKey' | 'queryFn'>) {
    return useQueries({
        queries: teamIds.map((teamId, index) => ({
            queryKey: ['team-day-gameid', teamId, day],
            queryFn: fetchTeamDayGameId,
            enabled: options.enabled && !!day && !!teamId,
            staleTime: 24 * 60 * 60000,
        })),
        combine: results => ({
            data: results.map(x => x.data),
            isPending: results.some(x => x.isPending)
        }),
    });
}
