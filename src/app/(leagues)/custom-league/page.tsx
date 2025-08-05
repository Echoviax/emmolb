'use client';
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import LeagueHeader from "@/components/leagues/LeagueHeader";
import type { Metadata } from 'next';

export default function CustomLeaguePage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<any[]>([]);

    const router = useRouter();

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const res = await fetch(`/nextapi/db/leagues/get-leagues`);
                if (!res.ok) throw new Error('Failed to fetch leagues!');
                const leagues = await res.json()
                setLeagues(leagues.leagues);
            } catch (error) {
                console.error("Failed to fetch leagues", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeagues();
    }, []);

    if (loading) return (<>
        <Loading />
    </>);

    return (<>
        <div className="text-2xl font-bold text-center mb-6">Custom League Subleagues</div>
        <button onClick={() => router.push('/create-league')} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4 w-fit">
            Create Subleague
        </button>
        <div className="space-y-3">
            {leagues.map((league, index) => (
                <Link className="block" key={index} href={`/custom-league/${league.league_id}`}>
                    <LeagueHeader league={league} />
                </Link>
            ))}
        </div>
    </>);
}