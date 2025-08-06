'use client'
import Loading from "@/components/Loading";
import { useState } from "react";
import TeamItemsPage from "./TeamItemsPage";
import TeamSummaryPage from "./TeamSummaryPage";
import { usePlayers } from "@/hooks/api/Player";
import { useTeam, useTeamFeed } from "@/hooks/api/Team";

export default function TeamAttributesPage({ id }: { id: string }) {
    const { data: team, isPending: teamIsPending } = useTeam({
        teamId: id,
    });
    const { data: feed, isPending: feedIsPending } = useTeamFeed({ teamId: id });
    const { data: players, isPending: playersIsPending } = usePlayers({
        playerIds: team?.players?.map(p => p.player_id),
        staleTime: 0,
    });
    const [subpage, setSubpage] = useState<string>('items');

    if (teamIsPending || feedIsPending || playersIsPending) return (
        <>
            <Loading />
        </>
    );

    if (!team) return (
        <>
            <div className="text-white text-center mt-10">Can't find that team</div>
        </>
    );

    return (<>
        {subpage === 'items' && (<TeamItemsPage setSubpage={setSubpage} team={team} players={players} />)}
        {subpage === 'summary' && (<TeamSummaryPage setSubpage={setSubpage} team={team} players={players} feed={feed!} />)}
    </>);
}