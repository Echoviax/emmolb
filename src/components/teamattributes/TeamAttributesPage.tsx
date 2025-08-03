'use client'
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import { MapAPITeamResponse, PlaceholderTeam, Team, TeamPlayer } from "@/types/Team";
import { MapAPIPlayerResponse, Player } from "@/types/Player";
import { FeedMessage } from "@/types/FeedMessage";
import TeamItemsPage from "./TeamItemsPage";
import TeamSummaryPage from "./TeamSummaryPage";

export default function TeamAttributesPage({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<Team>(PlaceholderTeam);
    const [players, setPlayers] = useState<Player[] | undefined>(undefined);
    const [subpage, setSubpage] = useState<string>('items');
    const [feed, setFeed] = useState<FeedMessage[]>([]);

    async function APICalls() {
        try {
            const teamRes = await fetch(`/nextapi/team/${id}`);
            if (!teamRes.ok) throw new Error('Failed to load team data');
            const team = MapAPITeamResponse(await teamRes.json());
            setTeam(team);

            const playersRes = await fetch(`/nextapi/players?ids=${team.players.map((p: TeamPlayer) => p.player_id).join(',')}`);
            if (!playersRes.ok) throw new Error('Failed to load player data');
            const players = await playersRes.json();
            setPlayers(players.players.map((p: any) => MapAPIPlayerResponse(p)));

            const feedRes = await fetch(`/nextapi/feed/${id}`);
            if (!feedRes.ok) throw new Error('Failed to load feed data');
            const feed = await feedRes.json();
            setFeed(feed.feed as FeedMessage[]);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        APICalls();
    }, [id]);

    if (loading) return (
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
        {subpage === 'items' && (<TeamItemsPage setSubpage={setSubpage} APICalls={APICalls} team={team} players={players} />)}
        {subpage === 'summary' && (<TeamSummaryPage setSubpage={setSubpage} APICalls={APICalls} team={team} players={players} feed={feed} />)}
    </>);
}