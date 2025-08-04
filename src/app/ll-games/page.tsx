'use client';

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import Link from "next/link";
import { League } from "@/types/League";
import { fetchCachedLesserLeagues } from "@/types/Api";
import type { Metadata } from 'next';

export default function LesserLeaguePage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<League[]>([]);

    useEffect(() => {
        async function getLeagues() {
            setLeagues(await fetchCachedLesserLeagues());
            setLoading(false);
        }
        getLeagues();
    }, [])

    if (loading) return (<>
        <Loading />
    </>);

    return (<>
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="text-2xl font-bold text-center mb-6">Lesser League Subleagues</div>
                <div className="space-y-6">
                    <div>
                        <div className="space-y-3">
                            {leagues.map((league, index) => (
                                <Link key={index} href={`/ll-games/${league.id}`}>
                                    <LeagueHeader league={league} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>);
}
