import OptimizeTeamPage from "@/components/teamattributes/OptimizeStats";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Optimizer',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
    const {id} = await params;
    return <OptimizeTeamPage id={id} />;
}
