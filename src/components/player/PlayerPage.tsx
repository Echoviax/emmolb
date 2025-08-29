'use client'
import Loading from "@/components/Loading";
import { useMemo } from "react";
import { Player } from "@/types/Player";
import { usePlayer } from "@/hooks/api/Player";
import ExpandedPlayerStats from "./ExpandedPlayerStats";
import { useTeam } from "@/hooks/api/Team";
import PlayerAttributes from "./PlayerAttributes";
import { PitchSelectionChart } from "./PitchSelectionChart";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PlayerPageProps = {
    id: string;
}

export function PlayerPage({ id }: PlayerPageProps) {
    const router = useRouter();
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

    const playerIndex = useMemo(() => {
        if (!team || !player) return -1;
        return team.players.findIndex(p => p.player_id === player.id);
    }, [team, player]);

    const previousPlayer = useMemo(() => {
        if (playerIndex <= 0) return null;
        return team?.players[playerIndex - 1];
    }, [team, playerIndex]);

    const nextPlayer = useMemo(() => {
        if (!team || playerIndex >= team.players.length - 1) return null;
        return team.players[playerIndex + 1];
    }, [team, playerIndex]);

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
                    <div className="flex w-full max-w-2xl px-4 py-2">
                        <div className="w-1/3 flex justify-start">
                            {previousPlayer ? (
                                <Link href={`/player/${previousPlayer.player_id}`} passHref>
                                    <button className="px-4 py-2 text-sm font-semibold rounded-md bg-theme-primary hover:opacity-80">
                                        Previous Player
                                    </button>
                                </Link>
                            ) : (
                                <div className="w-full"></div>
                            )}
                        </div>
                        <div className="w-1/3 flex justify-center">
                            <button onClick={() => router.push(`/team/${player.team_id}`)} className="px-4 py-2 text-sm font-semibold rounded-md bg-theme-primary hover:opacity-80">
                                Back to Team
                            </button>
                        </div>
                        <div className="w-1/3 flex justify-end">
                            {nextPlayer ? (
                                <Link href={`/player/${nextPlayer.player_id}`} passHref>
                                    <button className="px-4 py-2 text-sm font-semibold rounded-md bg-theme-primary hover:opacity-80">
                                        Next Player
                                    </button>
                                </Link>
                            ) : (
                                <div className="w-full"></div>
                            )}
                        </div>
                    </div>
                    <ExpandedPlayerStats player={joinedPlayer} />
                    {player.position_type === 'Pitcher' && <PitchSelectionChart id={id} />}
                    <PlayerAttributes player={player} />
                </div>
            </main>
        </>
    );
}
