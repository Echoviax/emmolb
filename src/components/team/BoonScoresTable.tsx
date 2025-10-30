import React, { useMemo } from 'react';
import { getLesserBoonEmoji } from './BoonDictionary';


interface SimpleBoonScoresTableProps {
  boonScores: Record<string, Record<string, number>> | undefined;
  className?: string;
}

// Always shows top 5 players (by score desc) per boon in a grid layout.
const BoonScoresTable: React.FC<SimpleBoonScoresTableProps> = ({ boonScores, className = '' }) => {
  const data = useMemo(() => {
    if (!boonScores) return [];
    return Object.keys(boonScores)
      .sort((a, b) => a.localeCompare(b))
      .map(boon => {
        const entries = Object.entries(boonScores[boon] || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5); // top 5 only
        return { boon, entries };
      });
  }, [boonScores]);

  // Calculate top 3 boons for each player
  const playerTopBoons = useMemo(() => {
    if (!boonScores) return new Map<string, Array<{ boon: string; score: number }>>();
    
    const playerBoonMap = new Map<string, Array<{ boon: string; score: number }>>();
    
    // Collect all boon scores for each player
    Object.entries(boonScores).forEach(([boon, playerScores]) => {
      Object.entries(playerScores).forEach(([playerName, score]) => {
        if (!playerBoonMap.has(playerName)) {
          playerBoonMap.set(playerName, []);
        }
        playerBoonMap.get(playerName)!.push({ boon, score });
      });
    });
    
    // Sort each player's boons by score descending and take top 3
    playerBoonMap.forEach((boons, playerName) => {
      playerBoonMap.set(
        playerName,
        boons.sort((a, b) => b.score - a.score).slice(0, 3)
      );
    });
    
    return playerBoonMap;
  }, [boonScores]);

  // Calculate top 10 player-boon combinations
  const topPlayerBoonScores = useMemo(() => {
    if (!boonScores) return [];
    
    const allCombinations: Array<{ player: string; boon: string; score: number }> = [];
    
    Object.entries(boonScores).forEach(([boon, playerScores]) => {
      Object.entries(playerScores).forEach(([playerName, score]) => {
        allCombinations.push({ player: playerName, boon, score });
      });
    });
    
    return allCombinations.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [boonScores]);

  if (!boonScores) {
    return <div className="italic text-[10px] opacity-70">No boon data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Player Best Boons Section */}
      <div>
        <h2 className="text-lg font-bold mb-3">Best Boons by Player</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {Array.from(playerTopBoons.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([playerName, topBoons]) => (
              <div key={playerName} className="border border-theme-accent rounded p-1.5 bg-theme-primary text-xs">
                <div className="font-semibold mb-1 truncate text-sm" title={playerName}>{playerName}</div>
                <div className="space-y-0.5">
                  {topBoons.map(({ boon, score }, idx) => {
                    const scoreClass = score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'opacity-70';
                    return (
                      <div key={boon} className="flex items-center gap-1 text-xs">
                        <span className="text-sm">{getLesserBoonEmoji(boon)}</span>
                        <span className="flex-1 truncate" title={boon}>{boon}</span>
                        <span className={`font-medium tabular-nums ${scoreClass}`}>{score.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Boon Rankings Section */}
      <div>
        <h2 className="text-lg font-bold mb-3">Top Players by Boon</h2>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 ${className}`}>
          {data.map(({ boon, entries }) => (
            <div key={boon} className="border border-theme-accent rounded p-1.5 bg-theme-primary">
              <h3 className="font-bold text-sm mb-1.5 pb-1 border-b border-theme-accent/30 flex items-center gap-1">
                <span className="text-lg">{getLesserBoonEmoji(boon)}</span>
                <span className="truncate" title={boon}>{boon}</span>
              </h3>
              <div className="space-y-0.5">
                {entries.length === 0 ? (
                  <div className="text-[10px] opacity-50 italic">No data</div>
                ) : (
                  entries.map(([playerName, score], idx) => {
                    const scoreClass = score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'opacity-70';
                    return (
                      <div key={playerName} className="flex items-center gap-1 text-xs">
                        <span className="opacity-50 w-2.5">{idx + 1}.</span>
                        <span className="flex-1 truncate" title={playerName}>{playerName}</span>
                        <span className={`font-medium tabular-nums ${scoreClass}`}>{score.toFixed(1)}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Top 10 Player-Boon Combinations */}
      <div>
        <h2 className="text-lg font-bold mb-3">Top 10 Player-Boon Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {topPlayerBoonScores.map(({ player, boon, score }, idx) => {
            const scoreClass = score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'opacity-70';
            return (
              <div key={`${player}-${boon}`} className="border border-theme-accent rounded p-2 bg-theme-primary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-yellow-400">#{idx + 1}</span>
                  <span className="text-2xl">{getLesserBoonEmoji(boon)}</span>
                </div>
                
                <div className="space-y-1 mb-2">
                  <div className="font-semibold text-sm truncate" title={player}>{player}</div>
                  <div className="text-xs truncate opacity-90" title={boon}>{boon}</div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-theme-accent/30">
                  <span className="text-xs opacity-70">Score:</span>
                  <span className={`font-bold text-lg tabular-nums ${scoreClass}`}>{score.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default BoonScoresTable;
