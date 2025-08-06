'use client';

import Loading from "@/components/Loading";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import Link from "next/link";
import { useLesserLeagues } from "@/hooks/api/League";

export default function LesserLeaguePage() {
    const { data: leagues, isPending } = useLesserLeagues({});

    if (isPending) return (<>
        <Loading />
    </>);

    return (<>
        <div className="text-2xl font-bold text-center mb-6">Lesser League Subleagues</div>
        <div className="space-y-3">
            {leagues!.map((league, index) => (
                <Link key={index} className="flex justify-center" href={`/league/${league.id}`}>
                    <LeagueHeader league={league} />
                </Link>
            ))}
        </div>
    </>);
}
