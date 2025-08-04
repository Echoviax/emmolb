import { Time } from "@/types/Time";
import { useQuery } from "@tanstack/react-query";

async function fetchTime(): Promise<Time> {
    const res = await fetch(`/nextapi/time`);
    if (!res.ok) throw new Error('Failed to load time');
    const data = await res.json();
    return {
        seasonDay: data.season_day,
        seasonNumber: data.season_number,
        seasonStatus: data.season_status,
        phaseTimes: {
            electionStart: data.phase_timesElectionStart,
            holidayStart: data.phase_timesHolidayStart,
            homeRunChallenge: data.phase_timesHomeRunChallenge,
            openingDay: data.phase_timesOpeningDay,
            postseasonPreview: data.phase_timesPostseasonPreview,
            postseasonRound1: data.phase_timesPostseasonRound1,
            postseasonRound2: data.phase_timesPostseasonRound2,
            postseasonRound3: data.phase_timesPostseasonRound3,
            preseason: data.phase_timesPreseason,
            regularSeasonResume: data.phase_timesRegularSeasonResume,
            superstarBreakStart: data.phase_timesSuperstarBreakStart,
            superstarGame: data.phase_timesSuperstarGame,
        },
    };
}

export function useMmolbTime(): Time | undefined {
    const {data} = useQuery({
        queryKey: ['time'],
        queryFn: fetchTime,
        staleTime: 30000,
        refetchInterval: 60000,
        gcTime: 24 * 60 * 60000,
    });
    return data;
}

export function useMmolbDay(): number | string | undefined {
    const {data} = useQuery({
        queryKey: ['time'],
        queryFn: fetchTime,
        staleTime: 30000,
        refetchInterval: 60000,
        gcTime: 24 * 60 * 60000,
        select: (time) => time.seasonDay,
    });
    return data;
}
