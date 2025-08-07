'use client'

import GamesRemaining, { getGamesLeft } from "@/components/leagues/GamesRemaining";
import { LeagueStandings } from "@/components/leagues/LeagueStandings";
import Loading from "@/components/Loading";
import { useLeagues, useLeaguesTopTeams } from "@/hooks/api/League";
import { useMmolbTime } from "@/hooks/api/Time";

const leagueIds = ['6805db0cac48194de3cd3fe4', '6805db0cac48194de3cd3fe5',];

export default function Page() {
    const time = useMmolbTime({});
    const leagues = useLeagues({ leagueIds });
    const leaguesTopTeams = useLeaguesTopTeams({ leagueIds });

    if (time.isPending || leagues.isPending || leaguesTopTeams.isPending)
        return (<Loading />);

    const gamesLeft = getGamesLeft(time.data!, true);
    const wildcardWinDiff = [...leaguesTopTeams.data[0]!.slice(2), ...leaguesTopTeams.data[1]!.slice(2)]
        .map(team => team.record.regular_season.wins - team.record.regular_season.losses).sort((a, b) => b - a)[1];

    return (
        <div className="flex flex-col items-center min-h-screen w-full">
            <h1 className="text-2xl font-bold text-center mb-2">Greater League Standings</h1>
            <GamesRemaining time={time.data!} playsOnOddDays={true} />
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-8">
                {leagues.data.map((league, i) => {
                    return <div key={i} className='w-[28rem] max-w-full px-2'>
                        <h2 className="text-xl font-bold text-center mb-4">{league!.name} Division</h2>
                        <LeagueStandings
                            league={league!}
                            teams={leaguesTopTeams.data[i]!}
                            cutoff={{ winDiff: wildcardWinDiff, minTeams: 2, gamesLeft: gamesLeft[1], text: 'PLAYOFF' }}
                            showIndex={false} />
                    </div>
                })}
            </div>
        </div>
    );
}
