import { Player } from "@/types/Player";
import { TeamPlayer } from "@/types/Team";
import { useState } from "react";

type StatTooltipProps = {
    label: string;
    value: number | string;
    tooltip: string;
    isActive: boolean;
    onToggle: () => void;
}

type PlayerStatsProps = {
    player: TeamPlayer | Player | null;
    category?: any;
}

function StatTooltip({ label, value, tooltip, isActive, onToggle }: StatTooltipProps) {
    return (
        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center" onClick={(e) => {e.stopPropagation(); onToggle();}}>
            <div className="text-xs font-bold cursor-pointer text-theme-text">{label}</div>
            <div className="text-sm font-normal text-theme-secondary">{value}</div>
            <div className={`absolute bottom-full mb-2 px-2 py-1 text-xs rounded z-50 text-center whitespace-pre transition-opacity bg-theme-primary text-theme-text group-hover:opacity-100 group-hover:pointer-events-auto ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{tooltip}</div>
        </div>
    );
}

export default function PlayerStats({ player, category }: PlayerStatsProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    if (player === null) {
        return (
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold p-4 text-center">No Player Selected</div>
            </div>
        );
    }
    if (player === undefined) {
        return (
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold p-4 text-center">Stats on benched players aren't currently supported</div>
            </div>
        );
    }
    const toggle = (label: string) => {setActiveTooltip((prev) => (prev === label ? null : label))};
    const stats = 'team_id' in player ? player.stats[player.team_id] : player.stats;


    return (
        <div onClick={() => setActiveTooltip(null)}>
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold pt-2 text-center">Season Stats</div>
                <div className="text-lg mb-2 text-center">{'emoji' in player ? player.emoji : ''} {player.first_name} {player.last_name}</div>
                {((category && category == 'batting') || !category) && (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Batting</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='BA' value={stats.ba != 0 ? stats.ba.toFixed(3) : '-'} tooltip="Batting Average" isActive={activeTooltip === 'BA'} onToggle={() => toggle('BA')} />
                        <StatTooltip label='OBP' value={stats.obp != 0 ? stats.obp.toFixed(3) : '-'} tooltip="On-Base Percentage" isActive={activeTooltip === 'OBP'} onToggle={() => toggle('OBP')} />
                        <StatTooltip label='SLG' value={stats.slg != 0 ? stats.slg.toFixed(3) : '-'} tooltip="Slugging Percentage" isActive={activeTooltip === 'SLG'} onToggle={() => toggle('SLG')} />
                        <StatTooltip label='OPS' value={stats.ops != 0 ? stats.ops.toFixed(3) : '-'} tooltip="On-Base Plus Slugging" isActive={activeTooltip === 'OPS'} onToggle={() => toggle('OPS')} />
                        <StatTooltip label='H' value={stats.hits} tooltip="Hits" isActive={activeTooltip === 'H'} onToggle={() => toggle('H')} />
                        <StatTooltip label='1B' value={stats.singles} tooltip="Singles" isActive={activeTooltip === '1B'} onToggle={() => toggle('1B')} />
                        <StatTooltip label='2B' value={stats.doubles} tooltip="Doubles" isActive={activeTooltip === '2B'} onToggle={() => toggle('2B')} />
                        <StatTooltip label='3B' value={stats.triples} tooltip="Triples" isActive={activeTooltip === '3B'} onToggle={() => toggle('3B')} />
                        <StatTooltip label='HR' value={stats.home_runs} tooltip="Home Runs" isActive={activeTooltip === 'HR'} onToggle={() => toggle('HR')} />
                        <StatTooltip label='BB' value={stats.walked} tooltip="Walks" isActive={activeTooltip === 'BB'} onToggle={() => toggle('BB')} />
                        <StatTooltip label='PA' value={stats.plate_appearances} tooltip="Plate Appearances" isActive={activeTooltip === 'PA'} onToggle={() => toggle('PA')} />
                        <StatTooltip label='AB' value={stats.at_bats} tooltip="At Bats" isActive={activeTooltip === 'AB'} onToggle={() => toggle('AB')} />
                        <StatTooltip label='SB' value={stats.stolen_bases} tooltip="Stolen Bases" isActive={activeTooltip === 'SB'} onToggle={() => toggle('SB')} />
                        <StatTooltip label='CS' value={stats.caught_stealing} tooltip="Caught Stealing" isActive={activeTooltip === 'CS'} onToggle={() => toggle('CS')} />
                        <StatTooltip label='GIDP' value={stats.grounded_into_double_play} tooltip="Grounded Into Double Plays" isActive={activeTooltip === 'GIDP'} onToggle={() => toggle('GIDP')} />
                    </div>
                </div>)}
                {((category && category == 'pitching') || !category) && (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Pitching</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='ERA' value={stats.era != 0 ? stats.era.toFixed(3) : '-'} tooltip="Earned Run Average" isActive={activeTooltip === 'ERA'} onToggle={() => toggle('ERA')} />
                        <StatTooltip label='WHIP' value={stats.whip != 0 ? stats.whip.toFixed(3) : '-'} tooltip="Walks and Hits Per Inning" isActive={activeTooltip === 'WHIP'} onToggle={() => toggle('WHIP')} />
                        <StatTooltip label='K/BB' value={stats.kbb != 0 ? stats.kbb.toFixed(3) : '-'} tooltip="Strikeout to Walk Ratio" isActive={activeTooltip === 'KBB'} onToggle={() => toggle('KBB')} />
                        <StatTooltip label='K/9' value={stats.k9 != 0 ? stats.k9.toFixed(3) : '-'} tooltip="Strikeouts Per 9 Innings" isActive={activeTooltip === 'K9'} onToggle={() => toggle('K9')} />
                        <StatTooltip label='H/9' value={stats.h9 != 0 ? stats.h9.toFixed(3) : '-'} tooltip="Hits Per 9 Innings" isActive={activeTooltip === 'H9'} onToggle={() => toggle('H9')} />
                        <StatTooltip label='BB/9' value={stats.bb9 != 0 ? stats.bb9.toFixed(3) : '-'} tooltip="Walks Per 9 Innings" isActive={activeTooltip === 'BB9'} onToggle={() => toggle('BB9')} />
                        <StatTooltip label='HR/9' value={stats.hr9 != 0 ? stats.hr9.toFixed(3) : '-'} tooltip="Home Runs Per 9 Innings" isActive={activeTooltip === 'HR9'} onToggle={() => toggle('HR9')} />
                        <StatTooltip label='IP' value={stats.ip != 0 ? stats.ip.toFixed(1) : '-'} tooltip="Innings Played" isActive={activeTooltip === 'IP'} onToggle={() => toggle('IP')} />
                        <StatTooltip label='K' value={stats.strikeouts} tooltip="Strikeouts" isActive={activeTooltip === 'K'} onToggle={() => toggle('K')} />
                        <StatTooltip label='BBP' value={stats.walks} tooltip="Walks Allowed (Pitching)" isActive={activeTooltip === 'BBP'} onToggle={() => toggle('BBP')} />
                        <StatTooltip label='HA' value={stats.hits_allowed} tooltip="Hits Allowed (Pitching)" isActive={activeTooltip === 'HA'} onToggle={() => toggle('HA')} />
                        <StatTooltip label='HB' value={stats.hit_batters} tooltip="Hits Batters" isActive={activeTooltip === 'HB'} onToggle={() => toggle('HB')} />
                        <StatTooltip label='ER' value={stats.earned_runs} tooltip="Earned Runs" isActive={activeTooltip === 'ER'} onToggle={() => toggle('ER')} />
                        <StatTooltip label='W' value={stats.wins} tooltip="Earned Runs" isActive={activeTooltip === 'W'} onToggle={() => toggle('W')} />
                        <StatTooltip label='L' value={stats.losses} tooltip="Losses" isActive={activeTooltip === 'L'} onToggle={() => toggle('L')} />
                        <StatTooltip label='QS' value={stats.quality_starts} tooltip="Quality Starts" isActive={activeTooltip === 'QS'} onToggle={() => toggle('QS')} />
                        <StatTooltip label='SV' value={stats.saves} tooltip="Saves" isActive={activeTooltip === 'SV'} onToggle={() => toggle('SV')} />
                        <StatTooltip label='BS' value={stats.blown_saves} tooltip="Blown Saves" isActive={activeTooltip === 'BS'} onToggle={() => toggle('BS')} />
                        <StatTooltip label='G' value={stats.appearances} tooltip="Games Pitched" isActive={activeTooltip === 'G'} onToggle={() => toggle('G')} />
                        <StatTooltip label='GF' value={stats.games_finished} tooltip="Games Finished" isActive={activeTooltip === 'GF'} onToggle={() => toggle('GF')} />
                        <StatTooltip label='CG' value={stats.complete_games} tooltip="Complete Games" isActive={activeTooltip === 'CG'} onToggle={() => toggle('CG')} />
                        <StatTooltip label='SHO' value={stats.shutouts} tooltip="Shutouts" isActive={activeTooltip === 'SHO'} onToggle={() => toggle('SHO')} />
                        <StatTooltip label='NH' value={stats.no_hitters} tooltip="No Hitters" isActive={activeTooltip === 'NH'} onToggle={() => toggle('NH')} />
                    </div>
                </div>)}
                {((category && category == 'defense') || !category) && (<div className="mb-6">
                    <div className="text-base font-semibold mb-1 text-center">Defense</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='E' value={stats.errors} tooltip="Errors" isActive={activeTooltip === 'E'} onToggle={() => toggle('E')} />
                        <StatTooltip label='A' value={stats.assists} tooltip="Assists" isActive={activeTooltip === 'A'} onToggle={() => toggle('A')} />
                        <StatTooltip label='PO' value={stats.putouts} tooltip="Putouts" isActive={activeTooltip === 'PO'} onToggle={() => toggle('PO')} />
                        <StatTooltip label='DP' value={stats.double_plays} tooltip="Double Plays" isActive={activeTooltip === 'DP'} onToggle={() => toggle('DP')} />
                    </div>
                </div>)}
            </div>
        </div>
    );
}