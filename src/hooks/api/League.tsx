import { fetchCachedLesserLeagues } from "@/types/Api";
import { League } from "@/types/League";
import { useQuery } from "@tanstack/react-query";

async function fetchLeague({queryKey}: {queryKey: any}): Promise<League> {
    const [_, leagueId] = queryKey;
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

export function useLeague(leagueId: string): League | undefined {
    const {data} = useQuery({
        queryKey: ['league', leagueId],
        queryFn: fetchLeague,
        enabled: !!leagueId,
        staleTime: 7 * 24 * 60 * 60000, // 1 week
        gcTime: 7 * 24 * 60 * 60000,
    });
    return data;
}

async function fetchLesserLeagues(): Promise<League[]> {
    return fetchCachedLesserLeagues();
}

export function useLesserLeagues(): League[] {
    const {data} = useQuery({
        queryKey: ['lesser-leagues'],
        queryFn: fetchLesserLeagues,
        staleTime: 7 * 24 * 60 * 60000, // 1 week
        gcTime: 7 * 24 * 60 * 60000,
    });
    return data ?? [];
}
