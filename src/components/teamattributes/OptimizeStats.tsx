'use client'
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import { MapAPITeamResponse, PlaceholderTeam, Team, TeamPlayer } from "@/types/Team";
import { MapAPIPlayerResponse, Player } from "@/types/Player";
import { FeedMessage } from "@/types/FeedMessage";

export default function OptimizeTeamPage({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<Team>(PlaceholderTeam);
    const [players, setPlayers] = useState<Player[] | undefined>(undefined);
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

    const feedTotals: Record<string, Record<number, Record<number, Record<string, number>>>> = {} // Name: {Season: {Day: {Stat: Buff}}}
    for (const message of feed) {
        if (message.type != 'augment') continue;
        const regex = /([\p{L}\s.'-]+?) gained \+(\d+) (\w+)\./gu;
        const matches = [...message.text.matchAll(regex)];

        for (const match of matches) {
            const name = match[1].trim();
            const amount = Number(match[2]);
            const attribute = match[3];
            let day = Number(message.day);
            if (Number.isNaN(day)) day = 240;
            const season = Number(message.season);

            if (!feedTotals[name]) feedTotals[name] = {};
            if (!feedTotals[name][season]) feedTotals[name][season] = {};
            if (!feedTotals[name][season][day]) feedTotals[name][season][day] = {};
            if (!feedTotals[name][season][day][attribute]) feedTotals[name][season][day][attribute] = 0;

            feedTotals[name][season][day][attribute] += amount;
        }
    }

    return (<>

    </>);
}