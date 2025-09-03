'use client'
import Loading from "@/components/Loading";
import { useMemo, useState } from "react";
import { Player } from "@/types/Player";
import { usePlayer } from "@/hooks/api/Player";
import { useTeam } from "@/hooks/api/Team";
import PlayerAttributes from "./PlayerAttributes";
import { PitchSelectionChart } from "./PitchSelectionChart";
import Link from "next/link";
import { PlayerPageHeader } from "./PlayerPageHeader";
import PlayerStatsTables from "./PlayerStatsTables";
import { useSearchParams, useRouter } from "next/navigation";

const tabDefs: Record<string, string> = {
    stats: 'Stats',
    charts: 'Charts',
    attributes: 'Attributes',
    feed: 'Feed',
};

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

    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        if (tab && Object.keys(tabDefs).includes(tab))
            return tab;

        return 'stats';
    });

    const joinedPlayer = useMemo(() => {
        if (!player || !team)
            return undefined;

        return { ...(team.players.find(x => x.player_id == player.id) as any), ...(player as Player) };
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

    function handleTabClick(newTab: string) {
        setActiveTab(newTab);
        router.replace(`/player/${id}?tab=${newTab}`, { scroll: false });
    }

    if (playersIsPending || teamIsPending) return (
        <Loading />
    );

    if (!player || !team) return (
        <div className="text-(--theme-text) text-center mt-10">Can't find that player</div>
    );

    return (
        <main className="mt-16">
            <div className="flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans max-w-screen px-4 pt-12 mb-4">
                <div className="flex w-full justify-between max-w-2xl px-4 py-2">
                    <div className="w-1/3 flex justify-start">
                        {previousPlayer ? (
                            <Link href={`/player/${previousPlayer.player_id}?${searchParams}`} passHref replace>
                                <button className="px-4 py-2 text-sm font-semibold rounded-md bg-theme-primary hover:opacity-80">
                                    Previous Player
                                </button>
                            </Link>
                        ) : (
                            <div className="w-full"></div>
                        )}
                    </div>
                    <div className="w-1/3 flex justify-end">
                        {nextPlayer ? (
                            <Link href={`/player/${nextPlayer.player_id}?${searchParams}`} passHref replace>
                                <button className="px-4 py-2 text-sm font-semibold rounded-md bg-theme-primary hover:opacity-80">
                                    Next Player
                                </button>
                            </Link>
                        ) : (
                            <div className="w-full"></div>
                        )}
                    </div>
                </div>
                <PlayerPageHeader player={joinedPlayer} team={team} />

                <div className="flex flex-wrap gap-1 justify-center my-4">
                    {Object.keys(tabDefs).map(tab =>
                        <div key={tab} className={`py-1 px-3 text-base rounded-full ${tab == activeTab ? 'bg-(--theme-selected) font-semibold cursor-default' : 'hover:bg-(--theme-selected)/50 cursor-pointer'}`} onClick={() => handleTabClick(tab)}>
                            {tabDefs[tab]}
                        </div>
                    )}
                </div>

                {activeTab === 'stats' && <PlayerStatsTables playerId={id} />}
                {activeTab === 'charts' && (
                    <>
                        {player.position_type === 'Pitcher'
                            ? <PitchSelectionChart id={id} />
                            : <div>Batter charts coming soon!</div>}
                    </>
                )}
                {activeTab === 'attributes' && <PlayerAttributes player={{ ...player, slot: joinedPlayer.slot }} />}
                {activeTab === 'feed' && <></>}
            </div>
        </main>
    );
}
