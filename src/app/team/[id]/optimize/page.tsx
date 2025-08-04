import OptimizeTeamPage from "@/components/teamattributes/OptimizeStats";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
    const {id} = await params;
    return <OptimizeTeamPage id={id} />;
}
