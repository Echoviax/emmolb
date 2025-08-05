import TeamPage from "@/components/TeamPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Team',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
    const {id} = await params;
    return <TeamPage id={id} />;
}
