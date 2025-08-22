'use client'
import Loading from "@/components/Loading";
import { useMemo } from "react";
import { Player } from "@/types/Player";
import { usePlayer } from "@/hooks/api/Player";
import ExpandedPlayerStats from "./ExpandedPlayerStats";
import { useTeam } from "@/hooks/api/Team";
import PlayerAttributes from "./PlayerAttributes";
import { PitchSelectionChart } from "./PitchSelectionChart";

type PlayerPageProps = {
    id: string;
}

export function PlayerPage({ id }: PlayerPageProps) {
    const { data: player, isPending: playersIsPending } = usePlayer({
        playerId: id
    });

    const { data: team, isPending: teamIsPending } = useTeam({
        teamId: player?.team_id
    });

    const joinedPlayer = useMemo(() => {
        if (!player || !team)
            return undefined;

        return {...(team.players.find(x => x.player_id == player.id) as any), ...(player as Player)};
    }, [player, team]);

    if (playersIsPending || teamIsPending) return (
        <>
            <Loading />
        </>
    );

    if (!player) return (
        <>
            <div className="text-(--theme-text) text-center mt-10">Can't find that player</div>
        </>
    );

    return (
        <>
            <main className="mt-16">
                <div className="flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans max-w-screen px-4 pt-24 mb-4">
                    <ExpandedPlayerStats player={joinedPlayer} />
                    {player.position_type === 'Pitcher' && <PitchSelectionChart id={id} />}
                    <PlayerAttributes player={player} />
                </div>
            </main>
        </>
    );
}
