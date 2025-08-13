import TeamAttributesPage from "@/components/team/TeamAttributesPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Team Attributes',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
    const {id} = await params;
    return <TeamAttributesPage id={id} />;
}
