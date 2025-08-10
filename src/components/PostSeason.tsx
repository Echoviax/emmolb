'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Loading from '@/components/Loading';
import MockGameHeader from '@/components/MockupGameHeader';
import { LiveGameCompact } from '@/components/LiveGameCompact';
import { MapAPITeamResponse } from '@/types/Team';
import { MapAPIGameResponse } from '@/types/Game';
import Link from 'next/link';
import { DayGame } from '@/types/DayGame';
import { useDayGames } from '@/hooks/api/Game';
import GameCard from './GameCard';

type BracketTeam = {
    id?: string;
    name: string;
    emoji: string;
    color: string;
    record?: string;
};

type BracketResponse = {
    [key: string]: BracketTeam;
};

function DayGameFetcher({ day, onDataLoaded }: {day: number; onDataLoaded: (day: number, data: DayGame[]) => void;}) {
    const { data: dayGames } = useDayGames({ day });

    useEffect(() => {
        if (dayGames) {
            onDataLoaded(day, dayGames as DayGame[]);
        }
    }, [day, dayGames, onDataLoaded]);

    return null;
}

export default function PostseasonPage() {
    const [bracket, setBracket] = useState<BracketResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState<DayGame[]>([]);
    const gamesByDay = useRef(new Map<number, DayGame[]>());

  // Fetch bracket
    useEffect(() => {
        const fetchBracket = async () => {
            try {
                const res = await fetch('/nextapi/postseason-bracket');
                const data = await res.json();
                setBracket(data);
            } catch (err) {
                console.error('Failed to load bracket:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBracket();
        const interval = setInterval(fetchBracket, 30000);
        return () => clearInterval(interval);
    }, []);

    const daysToFetch = [];
    for (let i = 241; i <= 273; i += 2) {
        daysToFetch.push(i);
    }

    const handleDataLoaded = useCallback((day: number, data: DayGame[]) => {
        gamesByDay.current.set(day, data);
        const combinedGames = Array.from(gamesByDay.current.values()).flat().reverse().filter((g) => g.status !== 'Scheduled');

        setGames(combinedGames);
    }, []);

  if (loading || !bracket) return <Loading />;
  const renderMockGame = (away: BracketTeam, home: BracketTeam, label: string) => (
    <MockGameHeader key={label} awayTeam={away} homeTeam={home} label={label} />
  );

  return (
    <main className="mt-16">
        {daysToFetch.map(day => (
            <DayGameFetcher
                key={day}
                day={day}
                onDataLoaded={handleDataLoaded}
            />
        ))}
      <div className="max-w-5xl mx-auto px-4 pt-16">
        <h1 className="text-2xl font-bold text-center mb-8">Postseason Bracket</h1>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 min-w-[600px] sm:min-w-full">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-center">Clover League</h2>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Wildcard</div>
                {renderMockGame(bracket.WildcardSeed1, bracket.CloverSeed2, 'Best of 3')}
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Semifinal</div>
                {renderMockGame(bracket.CloverWildcardWinner, bracket.CloverSeed1, 'Best of 5')}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-center">Pineapple League</h2>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Wildcard</div>
                {renderMockGame(bracket.WildcardSeed2, bracket.PineappleSeed2, 'Best of 3')}
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Semifinal</div>
                {renderMockGame(bracket.PineappleWildcardWinner, bracket.PineappleSeed1, 'Best of 5')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <div className="w-full max-w-2xl">
            {renderMockGame(bracket.CloverLeagueChamp, bracket.PineappleLeagueChamp, 'Best of 7')}
          </div>
        </div>

        {Object.values(games).length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="text-xl font-semibold text-center">Game History</h2>
            {games.map((game: DayGame) => (
              <GameCard key={game.game_id} game={game} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
