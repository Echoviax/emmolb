'use client'
import { DayGame } from "@/types/DayGame";
import { GameHeader } from "./GameHeader";
import { fetchTeamGames } from "@/types/Api";
import { Game, MapAPIGameResponse } from "@/types/Game";
import { MapAPITeamResponse } from "@/types/Team";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FullBlobileDisplay } from "./BlobileLayout";
import { LiveGameCompact } from "./LiveGameCompact";
import { useSettings } from "./Settings";

async function fetchGameHeader(gameID: string): Promise<{ game: Game, gameId: string, awayTeam: any, homeTeam: any, _debug: Record<any, any> }> {
    const res = await fetch(`/nextapi/gameheader/${gameID}`);
    if (!res.ok) throw new Error('Failed to load game header for ' + gameID);
    return await res.json();
}

export default function GameCard({ game, fetchData=true }: {game: DayGame; fetchData?: boolean;}) {
    const { settings } = useSettings();
    
    const { data: gameHeader, status } = useQuery({
        queryKey: ['gameHeader', game.game_id],
        queryFn: () => fetchGameHeader(game.game_id),
        enabled: fetchData,
        refetchInterval: false, // Gameheader is used to fetch data that doesn't change unless game is over. Just never refetch
        staleTime: 1000 * 60 * 1
    });

    const { data: historicGames } = useQuery({
        queryKey: ['historicGames', game.home_team_id],
        queryFn: () => fetchTeamGames(game.home_team_id, 4), // Change hardcoded value later
        enabled: !!gameHeader,
        staleTime: 1000 * 60 * 10,
    });

    // Show basic header if the game isn't live
    if (status !== 'success') {
        return (
            <Link href={`/watch/${game.game_id}`}>
                <GameHeader game={game} killLinks={true} />

            </Link>
        );
    }
    
    return settings.homePage?.useBlasesloaded ? (
        <Link href={"/game/" + game.game_id}>
            <FullBlobileDisplay gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} />
        </Link>
    ) : (
        <Link href={"/game/" + game.game_id}>
            <LiveGameCompact 
                gameId={gameHeader.gameId} 
                homeTeam={MapAPITeamResponse(gameHeader.homeTeam)} 
                awayTeam={MapAPITeamResponse(gameHeader.awayTeam)} 
                game={MapAPIGameResponse(gameHeader.game)} 
                killLinks={true} 
                historicGames={historicGames ?? []} 
            />
        </Link>
    );
}