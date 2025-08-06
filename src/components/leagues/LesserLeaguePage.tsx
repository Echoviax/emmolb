// components/LeaguePage.tsx
'use client'

import GamesRemaining, { getGamesLeft } from "@/components/leagues/GamesRemaining";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import { LeagueStandings } from "@/components/leagues/LeagueStandings";
import Loading from "@/components/Loading";
import { useLeague, useLeagueTopTeams } from "@/hooks/api/League";
import { useMmolbTime } from "@/hooks/api/Time";

interface PageProps {
    id: string;
}

export default function LesserLeaguePage({ id }: PageProps) {
    const {data: time, isPending: timeIsPending} = useMmolbTime({});
    const {data: league, isPending: leagueIsPending} = useLeague({ leagueId: id });
    const {data: teams, isPending: teamsIsPending} = useLeagueTopTeams({ leagueId: id });

    if (timeIsPending || leagueIsPending || teamsIsPending)
        return (<Loading />);

    if (!league || !teams?.length || !time) return (<div className="text-white text-center mt-10">Can't find that league</div>);

    const gamesLeft = getGamesLeft(time, false);
    const topTeamWinDiff = teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

    return (
        <div className="flex flex-col items-center min-h-screen">
            <LeagueHeader league={league} />
            <GamesRemaining time={time} playsOnOddDays={false} />

            <div className='w-[36rem] max-w-full'>
                <LeagueStandings
                    league={league}
                    teams={teams}
                    cutoff={{winDiff: topTeamWinDiff, gamesLeft: gamesLeft[1], text: '#1 CUTOFF'}}
                    showIndex={true} />
            </div>
        </div>
    );
}
