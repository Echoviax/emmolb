'use client'

import { Bases } from '@/types/Bases'
import { Event } from '@/types/Event'
import { TeamPlayer } from '@/types/Team'
import React from 'react'
import { useSettings } from './Settings'
import { Player } from '@/types/Player'

type PlayerInfo = {
    player: TeamPlayer | string | null;
    onClick?: () => void;
}

type GameStateDisplayProps = {
    event: Event;
    bases: Bases;
    pitcher: PlayerInfo;
    batter: PlayerInfo;
    onDeck: PlayerInfo;
    showBases?: boolean;
    playerObjects?: Player[];
}

export function GameStateDisplay({ event, bases, pitcher, batter, onDeck, showBases=false, playerObjects, }: GameStateDisplayProps) {
  const {settings} = useSettings();
  const renderCircles = (count: number, max: number) =>
    Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border ${
          i < count ? 'bg-theme-text' : 'bg-transparent'
        }`}
      />
    ))

  const baseStyles = (active: boolean) =>
    `absolute w-10 h-10 rotate-45 transition-opacity duration-500 ${
      active ? 'opacity-90 bg-theme-text' : 'opacity-15 bg-theme-text'
    }`

  function PlayerDisplay({ label, player }: { label: string; player: PlayerInfo }){ 
    const isTeamPlayer = (p: any): p is TeamPlayer => p && typeof p === 'object' && 'first_name' in p && 'last_name' in p;
    const p = player.player;
    const name = isTeamPlayer(p) ? `${p.first_name} ${p.last_name}` : typeof(p) === 'string' ? p : '';
    const stat = (isTeamPlayer(p) && p.stats && settings.gamePage?.showStats) ? p.position_type === 'Batter' ? `(${p.stats.ops.toFixed(3)} OPS)` : `(${p.stats.era.toFixed(3)} ERA)` : '';
    return (
    <div className="max-w-full sm:max-w-none">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 leading-tight">
        {label}
      </div>
      <div className="text-[13px] sm:text-sm flex flex-wrap sm:flex-nowrap items-center gap-x-1 leading-snug">
        {player.onClick ? (
          <button
            onClick={player.onClick}
            className="font-medium text-white-400 hover:underline text-left whitespace-normal sm:whitespace-nowrap"
          >
            {name}
              <span className="ml-1 text-xs text-theme-primary opacity-70">
                {stat}
              </span>
          </button>
        ) : (
          <span className="font-medium text-left whitespace-normal sm:whitespace-nowrap">
            {name}
            <span className="ml-1 text-xs text-theme-primary opacity-70">
                {stat}
              </span>
          </span>
        )}
      </div>
    </div>
  );
    }

    function isTeamPlayer(p: unknown): p is TeamPlayer {
        return typeof p === 'object' && p !== null && 'first_name' in p && 'last_name' in p;
    }

    let pitcherThrows: string | undefined;
    let batterHits: string | undefined;
    let onDeckHits: string | undefined;

    const normalize = (name: string) => name.trim().toLowerCase();

    if (isTeamPlayer(pitcher.player) && isTeamPlayer(batter.player) && isTeamPlayer(onDeck.player)) {
        const pitch: TeamPlayer = pitcher.player
        const bat: TeamPlayer = batter.player
        const deck: TeamPlayer = onDeck.player;
        pitcherThrows = playerObjects?.find(
            (p: Player) => normalize(`${p.first_name} ${p.last_name}`) === normalize(`${pitch.first_name} ${pitch.last_name}`)
        )?.throws;

        batterHits = playerObjects?.find(
            (p: Player) => normalize(`${p.first_name} ${p.last_name}`) === normalize(`${bat.first_name} ${bat.last_name}`)
        )?.bats;

        onDeckHits = playerObjects?.find(
            (p: Player) => normalize(`${p.first_name} ${p.last_name}`) === normalize(`${deck.first_name} ${deck.last_name}`)
        )?.bats;
    } else {
        pitcherThrows = playerObjects?.find(
            (p: Player) => normalize(`${p.first_name} ${p.last_name}`) === normalize(String(pitcher.player))
        )?.throws;

        batterHits = playerObjects?.find(
            (p: Player) => normalize(`${p.first_name} ${p.last_name}`) === normalize(String(batter.player))
        )?.bats;

        onDeckHits = playerObjects?.find(
            (p: Player) => normalize(`${p.first_name} ${p.last_name}`) === normalize(String(onDeck.player))
        )?.bats;
    }

  return (
    <>
    <div className="flex justify-center items-start gap-x-10 w-full max-w-md mx-auto px-2">
      {/* Balls / Strikes / Outs */}
      <div className="space-y-2 text-right w-[100px] shrink-0">
        <div>
          <div className="text-sm font-semibold mb-1">Balls</div>
          <div className="flex justify-end space-x-1">{renderCircles(event.balls, 3)}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Strikes</div>
          <div className="flex justify-end space-x-1">{renderCircles(event.strikes, 2)}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Outs</div>
          <div className="flex justify-end space-x-1">{renderCircles(event.outs, 2)}</div>
        </div>
      </div>

      {/* Diamond */}
      <div className="flex justify-center w-[150px]">
        <div className="relative w-24 h-24 mx-auto">
          <div>
          <div
            className={baseStyles(!!bases.second)}
            style={{
              left: 'calc(50% - 20px)',
              top: 'calc(20% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
          </div>
          <div>
          <div
            className={baseStyles(!!bases.first)}
            style={{
              left: 'calc(90% - 20px)',
              top: 'calc(60% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          />
          
          </div>
          <div>
          <div
            className={baseStyles(!!bases.third)}
            style={{
              left: 'calc(10% - 20px)',
              top: 'calc(60% + 20px)',
              transform: 'translate(-50%, -50%) rotate(90deg)',
            }}
          ></div>
          </div>
        </div>
      </div>

      <div className="text-sm space-y-4 text-left w-[100px] shrink-0 whitespace-nowrap">
        <PlayerDisplay
          label={`Pitching${(pitcherThrows && settings.gamePage?.showHandedness) ? ` (${pitcherThrows})` : ``}`}
          player={pitcher}
        />        
        <PlayerDisplay
          label={`Batting${(batterHits && settings.gamePage?.showHandedness) ? ` (${batterHits})` : ''}`}
          player={batter}
        />

        <PlayerDisplay
          label={`On Deck${(onDeckHits && settings.gamePage?.showHandedness) ? ` (${onDeckHits})` : ''}`}
          player={onDeck}
        />
      </div>
    </div>
    {(showBases && settings.gamePage?.showBaserunners) && (
        <div className="text-sm space-y-4 text-left w-full shrink-0 whitespace-nowrap">
            {['first', 'second', 'third'].map((base) => (
                <div key={base} className="max-w-full sm:max-w-none">
                    <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 leading-tight">
                        {base}
                    </div>
                    <div className="text-[13px] sm:text-sm flex flex-wrap sm:flex-nowrap items-center gap-x-1 leading-snug">
                        <span className="font-medium text-left whitespace-normal sm:whitespace-nowrap">
                            {bases[base as keyof Bases]?.split(" (")[0]}
                            <span className="ml-1 text-xs text-theme-primary opacity-70">
                                {bases[base as keyof Bases] ? `(${bases[base as keyof Bases]?.split("(")[1]}` : ''}
                            </span>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )}
    </>);
}
