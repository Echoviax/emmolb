import { PlayerPage } from "@/components/PlayerPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Player',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PlayerServer({ params }: PageProps) {
    const {id} = await params;
    return <PlayerPage id={id} />;
}
