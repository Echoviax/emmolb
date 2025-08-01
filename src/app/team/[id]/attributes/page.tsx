import TeamAttributesPage from "@/components/teamattributes/TeamAttributesPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
    const {id} = await params;
    return <TeamAttributesPage id={id} />;
}
