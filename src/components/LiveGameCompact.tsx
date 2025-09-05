'use client'
import { GameStateDisplay } from '@/components/GameStateDisplay';
import LastUpdatedCounter from './LastUpdatedCounter';
import { GameHeader } from './GameHeader';
import { Team } from '@/types/Team';
import { Game } from '@/types/Game';
import { Event } from '@/types/Event';
import { CashewsGame } from '@/types/FreeCashews';
import { useGameLastEvent } from '@/hooks/api/LiveEvents';

type LiveGameCompactProps = {
    gameId: string;
    homeTeam: Team;
    awayTeam: Team;
    game: Game;
    killLinks?: boolean;
    historicGames?: CashewsGame[];
}

type GameStateDisplayCompactProps = { 
    event: Event;
    lastUpdated: any;
}

export function LiveGameCompact({ gameId, homeTeam, awayTeam, game, killLinks = false, historicGames, }: LiveGameCompactProps){
    const {event, isComplete, lastUpdated} = useGameLastEvent({ gameId, initialState: null });

    if (!event || isComplete) return <GameHeader homeTeam={homeTeam} awayTeam={awayTeam} game={game} killLinks={killLinks} />;
  
    return (<>
        <GameHeader homeTeam={homeTeam} awayTeam={awayTeam} game={game} event={event} killLinks={killLinks} historicGames={historicGames} />
        <GameStateDisplayCompact event={event} lastUpdated={lastUpdated}/>
    </>);
}

export function GameStateDisplayCompact({ event, lastUpdated }: GameStateDisplayCompactProps) {
    const background = (event.message.includes('scores!') || event.message.includes('homers')) ? 'bg-theme-score' : event.message.includes(' star ') || event.message.includes('solar') ? 'bg-theme-weather' : 'bg-theme-secondary';
    const lastBatter = (typeof event.batter === 'object' && event.batter !== null) ? event.batter.name : event.batter ?? '';
    const lastPitcher = (typeof event.pitcher === 'object' && event.pitcher !== null) ? event.pitcher.name : event.pitcher ?? '';
    const lastOnDeck = (typeof event.on_deck === 'object' && event.on_deck !== null) ? event.on_deck.name : event.on_deck ?? '';

    return (
        <div className={`${background} p-4 rounded-lg shadow-lg border border-theme-accent mb-16`}>
            <GameStateDisplay
                event={event}
                bases={{
                    first: event.on_1b ? 'Unknown' : null,
                    second: event.on_2b ? 'Unknown' : null,
                    third: event.on_3b ? 'Unknown' : null,
                }}
                pitcher={{
                    player: lastPitcher,
                    onClick: () => {},
                }}
                batter={{
                    player: lastBatter,
                    onClick: () => {},
                }}
                onDeck={{
                    player: lastOnDeck,
                    onClick: () => {},
                }}
            />
            <div className='text-sm p-2' dangerouslySetInnerHTML={{__html: event.message}} />
            <LastUpdatedCounter lastUpdatedTimestamp={lastUpdated}/>
        </div>
    );
    }