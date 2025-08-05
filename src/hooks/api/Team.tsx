import { useQueries, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

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
    })
}
