// components/CashewsPlayerStats.tsx
// Authors: Navy, Luna
import { Equipment, EquipmentEffect, Player } from "@/types/Player";
import { defaultStats, DerivedPlayerStats, MapAPIPlayerStats } from "@/types/PlayerStats";
import { TeamPlayer } from "@/types/Team";
import { useState } from "react";

type StatTooltipProps = {
    label: string;
    value: number | string;
    tooltip: string;
    isActive: boolean;
    onToggle: () => void;
}

type ExpandedPlayerStatsProps = {
    player: TeamPlayer & Player | null;
    category?: any;
};

type EquipmentTooltipProps = {
    equipment: Equipment | undefined;
    emoji: string;
    name: string;
    isActive: boolean;
    onToggle: () => void;
    appendName?: boolean; // Hey this is just so the optimize page isn't funky
};

function StatTooltip({ label, value, tooltip, isActive, onToggle }: StatTooltipProps) {
    return (
        <div className="relative group bg-theme-secondary border border-theme-accent rounded-md p-2 flex flex-col items-center" onClick={(e) => {e.stopPropagation(); onToggle();}}>
            <div className="text-xs font-bold cursor-pointer text-theme-text">{label}</div>
            <div className="text-sm font-normal text-theme-secondary">{value}</div>
            <div className={`absolute bottom-full mb-2 px-2 py-1 text-xs rounded z-50 text-center whitespace-pre transition-opacity bg-theme-primary text-theme-text group-hover:opacity-100 group-hover:pointer-events-auto ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{tooltip}</div>
        </div>
    );
}

export function EquipmentTooltip({ equipment, emoji, name, isActive, onToggle, appendName=true }: EquipmentTooltipProps) {
    const itemBorder: Record<string, string> = {'Normal': '#1c2a3a', 'Magic': '#42A5F5', 'Rare': '#FFEE58'}
    const itemFont: Record<string, string> = {'Normal': 'text-gray-500', 'Magic': 'text-blue-500', 'Rare': 'text-yellow-500'}
    const itemColor: Record<string, string> = {'Normal': 'from-gray-500 to-gray-700', 'Magic': 'from-blue-500 to-blue-700', 'Rare': 'from-yellow-500 to-yellow-700'}
    const formattedName = equipment ? `${equipment.prefix?.join(' ') ?? ''} ${equipment.name ?? ''} ${equipment.suffix?.join(' ') ?? ''}`.trim() : name;    
    return (
        <div className="relative group" onClick={(e) => {e.stopPropagation(); onToggle();}}>
            <div className="w-18 h-18 border-3 text-theme-primary rounded-lg flex flex-col items-center justify-center shadow cursor-pointer" style={{borderColor: itemBorder[equipment?.rarity ?? 'Normal']}}>
                <div className="text-3xl">
                    {equipment ? emoji : '❔'}
                </div>
                <div className="text-xs font-semibold text-center mt-1 px-1" style={{fontSize: 8}}>{equipment?.rareName ?? formattedName}{appendName ? equipment?.rareName ? ` ${equipment.name}` : '' : ''}</div>
                <div className={`absolute bottom-[-2rem] left-1/2 -translate-x-1/2 transition-opacity duration-200 pointer-events-none group-hover:opacity-100 z-40 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="pointer-events-none z-[100] ">
                        <div className="bg-theme-primary border-2 border-theme-accent rounded-xl shadow-xl text-center text-xs w-56 overflow-hidden">
                            <div className={`bg-gradient-to-r ${itemColor[equipment ? equipment.rarity : 'Normal'] } text-white relative font-bold py-1 px-2 flex items-center justify-center`}>
                                <span className="absolute left-1 top-1/2 -translate-y-1/2">{emoji}</span>
                                <span className="mx-4 whitespace-normal break-words text-center">{equipment?.rareName ?? formattedName}{appendName ? equipment?.rareName ? ` ${equipment.name}` : '' : ''}</span>
                                <span className="absolute right-1 top-1/2 -translate-y-1/2">{emoji}</span>
                            </div>
                            <div className="p-2 space-y-1">
                                <div className="text-[10px]">
                                    {equipment?.rarity} {equipment?.slot} Equipment
                                </div>
                                {equipment?.effects.map((effect: EquipmentEffect) => (
                                    <div key={`${equipment.rareName}-${effect.attribute}-${effect.value}`} className={itemFont[equipment.rarity]}>
                                        <span>
                                            <span className="font-semibold">
                                                +{(100*effect.value).toFixed(0)}
                                            </span>
                                            <span className="opacity-80">
                                                 {effect.attribute}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ExpandedPlayerStats({ player, category }: ExpandedPlayerStatsProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    if (player === undefined || player === null) {
        return (
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold p-4 text-center">No Player Selected</div>
            </div>
        );
    }
    const toggle = (label: string) => {setActiveTooltip((prev) => (prev === label ? null : label));};
    const stats = Object.values(player.stats)[0] as DerivedPlayerStats ?? MapAPIPlayerStats(defaultStats);

    return (
        <div className='max-w-2xl w-full' onClick={() => setActiveTooltip(null)}>
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-xl mb-2 text-center font-bold mt-2">{'emoji' in player ? player.emoji : ''} {player.first_name} {player.last_name} ({player.slot})</div>
                <div className="w-3/4 mx-auto h-3 rounded-full bg-theme-accent mb-2">
                    <div className="h-3 rounded-full" style={{width: `${player.durability*100}%`, backgroundColor: '#29cc00'}} />
                </div>
                <div className="flex justify-center flex-wrap gap-4 my-4">
                    <EquipmentTooltip equipment={player.equipment.head} emoji='🧢' name='Head' isActive={activeTooltip === 'head'} onToggle={() => toggle('head')}/>
                    <EquipmentTooltip equipment={player.equipment.body} emoji='👕' name='Body' isActive={activeTooltip === 'body'} onToggle={() => toggle('body')}/>
                    <EquipmentTooltip equipment={player.equipment.hands} emoji='🧤' name='Hands' isActive={activeTooltip === 'hands'} onToggle={() => toggle('hands')}/>
                    <EquipmentTooltip equipment={player.equipment.feet} emoji='👟' name='Feet' isActive={activeTooltip === 'feet'} onToggle={() => toggle('feet')}/>
                    <EquipmentTooltip equipment={player.equipment.accessory} emoji='💍' name='Accessory' isActive={activeTooltip === 'accessory'} onToggle={() => toggle('accessory')}/>
                </div>
                <div className="grid grid-rows-2 grid-flow-col gap-3 max-w-xl mx-auto mt-4">
                    <div className="bg-theme-secondary border border-theme-accent rounded-md px-4 py-1 flex flex-col items-center justify-center text-center">
                        <div className="text-sm text-theme-text font-semibold">Born</div>
                        <div className="text-theme-secondary text-base font-bold">{`Season ${player.birth_season}, ${player.birthday}`}</div>
                    </div>
                    <div className="bg-theme-secondary border border-theme-accent rounded-md px-4 py-1 flex flex-col items-center justify-center text-center">
                        <div className="text-sm text-theme-text font-semibold">Home</div>
                        <div className="text-theme-secondary text-base font-bold">{player.home}</div>
                    </div>
                    <div className="bg-theme-secondary border border-theme-accent rounded-md px-4 py-1 flex flex-col items-center justify-center text-center">
                        <div className="text-sm text-theme-text font-semibold">Likes</div>
                        <div className="text-theme-secondary text-base font-bold">{player.likes}</div>
                    </div>
                    <div className="bg-theme-secondary border border-theme-accent rounded-md px-4 py-1 flex flex-col items-center justify-center text-center">
                        <div className="text-sm text-theme-text font-semibold">Dislikes</div>
                        <div className="text-theme-secondary text-base font-bold">{player.dislikes}</div>
                    </div>
                    <div className="bg-theme-secondary border border-theme-accent rounded-md px-4 py-1 flex flex-col items-center justify-center text-center">
                        <div className="text-sm text-theme-text font-semibold">Bats</div>
                        <div className="text-theme-secondary text-base font-bold">{player.bats}</div>
                    </div>
                    <div className="bg-theme-secondary border border-theme-accent rounded-md px-4 py-1 flex flex-col items-center justify-center text-center">
                        <div className="text-sm text-theme-text font-semibold">Throws</div>
                        <div className="text-theme-secondary text-base font-bold">{player.throws}</div>
                    </div>
                </div>
                <div className="text-lg font-bold pt-2 text-center">Season Stats</div>
                {((category && category == 'batting') || !category) && (<div className="mb-4">
                    <div className="text-base font-semibold mb-1 text-center">Batting</div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                        <StatTooltip label='BA' value={stats.ba != Infinity ? stats.ba.toFixed(3) : '-'} tooltip="Batting Average" isActive={activeTooltip === 'BA'} onToggle={() => toggle('BA')} />
                        <StatTooltip label='OBP' value={stats.obp != Infinity ? stats.obp.toFixed(3) : '-'} tooltip="On-Base Percentage" isActive={activeTooltip === 'OBP'} onToggle={() => toggle('OBP')} />
                        <StatTooltip label='SLG' value={stats.slg != Infinity ? stats.slg.toFixed(3) : '-'} tooltip="Slugging Percentage" isActive={activeTooltip === 'SLG'} onToggle={() => toggle('SLG')} />
                        <StatTooltip label='OPS' value={stats.ops != Infinity ? stats.ops.toFixed(3) : '-'} tooltip="On-Base Plus Slugging" isActive={activeTooltip === 'OPS'} onToggle={() => toggle('OPS')} />
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
                        <StatTooltip label='ERA' value={stats.era != Infinity ? stats.era.toFixed(3) : '-'} tooltip="Earned Run Average" isActive={activeTooltip === 'ERA'} onToggle={() => toggle('ERA')} />
                        <StatTooltip label='WHIP' value={stats.whip != Infinity ? stats.whip.toFixed(3) : '-'} tooltip="Walks and Hits Per Inning" isActive={activeTooltip === 'WHIP'} onToggle={() => toggle('WHIP')} />
                        <StatTooltip label='K/BB' value={stats.kbb != Infinity ? stats.kbb.toFixed(3) : '-'} tooltip="Strikeout to Walk Ratio" isActive={activeTooltip === 'KBB'} onToggle={() => toggle('KBB')} />
                        <StatTooltip label='K/9' value={stats.k9 != Infinity ? stats.k9.toFixed(3) : '-'} tooltip="Strikeouts Per 9 Innings" isActive={activeTooltip === 'K9'} onToggle={() => toggle('K9')} />
                        <StatTooltip label='H/9' value={stats.h9 != Infinity ? stats.h9.toFixed(3) : '-'} tooltip="Hits Per 9 Innings" isActive={activeTooltip === 'H9'} onToggle={() => toggle('H9')} />
                        <StatTooltip label='BB/9' value={stats.bb9 != Infinity ? stats.bb9.toFixed(3) : '-'} tooltip="Walks Per 9 Innings" isActive={activeTooltip === 'BB9'} onToggle={() => toggle('BB9')} />
                        <StatTooltip label='HR/9' value={stats.hr9 != Infinity ? stats.hr9.toFixed(3) : '-'} tooltip="Home Runs Per 9 Innings" isActive={activeTooltip === 'HR9'} onToggle={() => toggle('HR9')} />
                        <StatTooltip label='IP' value={stats.ip != Infinity ? stats.ip.toFixed(1) : '-'} tooltip="Innings Played" isActive={activeTooltip === 'IP'} onToggle={() => toggle('IP')} />
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