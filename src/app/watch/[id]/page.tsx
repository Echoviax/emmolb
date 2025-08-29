import LiveGamePage from '@/components/LiveGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
    const { id } = await params;

    return <LiveGamePage gameId={id} />;
}
