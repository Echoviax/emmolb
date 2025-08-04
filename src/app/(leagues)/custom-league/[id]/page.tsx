import CustomLeagueSubleaguePage from "@/components/leagues/CustomLeagueSubleaguePage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Custom League',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CustomLeagueSubleagueServerPage({ params }: PageProps) {
    const { id } = await params;

    const res = await fetch('https://lunanova.space/nextapi/db/leagues/get-league', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            league_id: id,
        }),
    });
    if (!res.ok) throw new Error('Failed to fetch league!');
    const { league } = await res.json()

    return (<CustomLeagueSubleaguePage league={league} />);
}