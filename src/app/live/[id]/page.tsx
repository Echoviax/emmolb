import GameField from '@/components/animation/Main';
import { MapAPIGameResponse } from '@/types/Game';
import { MapAPITeamResponse } from '@/types/Team';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Viewer',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LiveGamePage({ params }: PageProps) {
    const { id } = await params;

    const res = await fetch(`https://lunanova.space/nextapi/gameheader/${id}`, {
        next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error('Failed to load game + team data');
    const { game, gameId, awayTeam, homeTeam } = await res.json();
    return <GameField homeTeam={MapAPITeamResponse(homeTeam)} awayTeam={MapAPITeamResponse(awayTeam)} game={MapAPIGameResponse(game)} id={id} />;
}
