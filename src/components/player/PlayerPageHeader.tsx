import { useState } from "react";
import { PlayerWithSlot } from "../team/TeamAttributes";
import { Team } from "@/types/Team";
import { Equipment, EquipmentEffect } from "@/types/Player";

export type EquipmentTooltipProps = {
    equipment: Equipment | undefined;
    emoji: string;
    name: string;
    isActive: boolean;
    onToggle: () => void;
    appendName?: boolean; // Hey this is just so the optimize page isn't funky
};

export function EquipmentTooltip({ equipment, emoji, name, isActive, onToggle, appendName = true }: EquipmentTooltipProps) {
    const itemBorder: Record<string, string> = { 'Normal': '#1c2a3a', 'Magic': '#42A5F5', 'Rare': '#FFEE58' };
    const itemFont: Record<string, string> = { 'Normal': 'text-gray-500', 'Magic': 'text-blue-500', 'Rare': 'text-yellow-500' };
    const itemColor: Record<string, string> = { 'Normal': 'from-gray-500 to-gray-700', 'Magic': 'from-blue-500 to-blue-700', 'Rare': 'from-yellow-500 to-yellow-700' };
    const formattedName = equipment ? `${equipment.prefix?.join(' ') ?? ''} ${equipment.name ?? ''} ${equipment.suffix?.join(' ') ?? ''}`.trim() : name;
    return (
        <div className="relative group" onClick={(e) => { e.stopPropagation(); onToggle(); } }>
            <div className="w-18 h-18 border-3 text-theme-primary rounded-lg flex flex-col items-center justify-center shadow cursor-pointer" style={{ borderColor: itemBorder[equipment?.rarity ?? 'Normal'] }}>
                <div className="text-3xl">
                    {equipment ? emoji : '❔'}
                </div>
                <div className="text-xs font-semibold text-center mt-1 px-1" style={{ fontSize: 8 }}>{equipment?.rareName ?? formattedName}{appendName ? equipment?.rareName ? ` ${equipment.name}` : '' : ''}</div>
                <div className={`absolute bottom-[-2rem] left-1/2 -translate-x-1/2 transition-opacity duration-200 pointer-events-none group-hover:opacity-100 z-40 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="pointer-events-none z-[100] ">
                        <div className="bg-theme-primary border-2 border-theme-accent rounded-xl shadow-xl text-center text-xs w-56 overflow-hidden">
                            <div className={`bg-gradient-to-r ${itemColor[equipment ? equipment.rarity : 'Normal']} text-white relative font-bold py-1 px-2 flex items-center justify-center`}>
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
                                                +{(100 * effect.value).toFixed(0)}
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

type PlayerPageHeaderProps = {
    player: PlayerWithSlot;
    team: Team;
}

export function PlayerPageHeader({ player, team }: PlayerPageHeaderProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    if (player === undefined || player === null) {
        return (
            <div className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                <div className="text-lg font-bold p-4 text-center">No Player Selected</div>
            </div>
        );
    }
    const toggle = (label: string) => {setActiveTooltip((prev) => (prev === label ? null : label));};

    return (
        <div className="flex flex-col max-w-2xl w-full">
            <div className="text-xl mb-2 text-center font-bold mt-2">{team.emoji} {player.first_name} {player.last_name} ({player.slot})</div>
            <div className="w-3/4 mx-auto h-3 rounded-full bg-theme-accent mb-2">
                <div className="h-3 rounded-full" style={{ width: `${player.durability * 100}%`, backgroundColor: '#29cc00' }} />
            </div>
            <div className="flex justify-center flex-wrap gap-4 my-4">
                <EquipmentTooltip equipment={player.equipment.head} emoji='🧢' name='Head' isActive={activeTooltip === 'head'} onToggle={() => toggle('head')} />
                <EquipmentTooltip equipment={player.equipment.body} emoji='👕' name='Body' isActive={activeTooltip === 'body'} onToggle={() => toggle('body')} />
                <EquipmentTooltip equipment={player.equipment.hands} emoji='🧤' name='Hands' isActive={activeTooltip === 'hands'} onToggle={() => toggle('hands')} />
                <EquipmentTooltip equipment={player.equipment.feet} emoji='👟' name='Feet' isActive={activeTooltip === 'feet'} onToggle={() => toggle('feet')} />
                <EquipmentTooltip equipment={player.equipment.accessory} emoji='💍' name='Accessory' isActive={activeTooltip === 'accessory'} onToggle={() => toggle('accessory')} />
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
        </div>
    )
}