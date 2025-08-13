import TeamPage from "@/components/team/TeamPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Team',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TeamServer({ params }: PageProps) {
    const {id} = await params;
    return <TeamPage id={id} />;
}
