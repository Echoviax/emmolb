import { FeedMessage } from "@/types/FeedMessage";
import { Player } from "@/types/Player";
import { Team } from "@/types/Team";
import { Dispatch, SetStateAction, useState, useEffect, Fragment, useMemo } from "react";
import { OpenDropboxes, battingAttrs, pitchingAttrs, defenseAttrs, runningAttrs, trunc, attrCategories } from "./Constants";
import { boonTable } from "./BoonDictionary";
import { Settings } from "../Settings";

const categories = ['Batting', 'Pitching', 'Defense', 'Running'];

type CheckboxProps = {
    checked: boolean;
    label: string;
    onChange: (value: boolean) => void;
};

function Checkbox({ checked, label, onChange }: CheckboxProps) {
    return (
        <label className="w-full flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm font-medium text-theme-secondary opacity-80 overflow-hidden text-ellipsis whitespace-nowrap pr-4">{label}</span>
            <div className="relative flex-shrink-0">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-(--theme-primary)' : 'bg-(--theme-secondary)'}`} />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
        </label>
    );
}

export default function TeamSummaryPage({ setSubpage, team, players, }: { setSubpage: Dispatch<SetStateAction<string>>; team: Team; players: Player[] | undefined; }) {
    const [includeItems, setIncludeItems] = useState(true);
    const [includeBoons, setIncludeBoons] = useState(true);

    const teamPlayersJoined = useMemo(() => team && players ? team.players.map(tp => {
        const player = players.find((p: Player) => p.id === tp.player_id);
        if (!player) throw new Error(`Player ${tp.first_name} ${tp.last_name} missing from players array`);
        return player;
    }) : [], [team, players]);

    const playerData = useMemo(() => {
        const playerData: Record<string, Record<string, number>> = {}
        teamPlayersJoined.forEach(player => {
            const boon = player.lesser_boon?.name ?? "None";
            const items = [player.equipment.head, player.equipment.body, player.equipment.hands, player.equipment.feet, player.equipment.accessory];
            const itemTotals: Map<string, number> = new Map<string, number>();
            items.forEach((item) => {
                if (item == null || item.rarity == 'Normal') return;
                item.effects.forEach((effect) => {
                    const amount = Math.round(effect.value * 100);
                    itemTotals.set(effect.attribute, amount + (itemTotals.get(effect.attribute) ?? 0));
                })
            });

            const attrTotals: Record<string, number> = {};
            categories.forEach((category) => {
                const mappedCategory = category === 'Running' ? 'base_running' : category.toLowerCase();
                const talk = player.talk?.[mappedCategory];
                if (!talk)
                    return;

                const attrs = attrCategories[category];
                let categoryTotal = 0;
                attrs.forEach((attr) => {
                    const stars = talk.stars?.[attr].length ?? 0;
                    const boonMultiplier = includeBoons ? boonTable[boon]?.[attr] ?? 1 : 1;
                    const itemTotal = includeItems ? itemTotals.get(attr) ?? 0 : 0;

                    const total = (stars + itemTotal / 25) * boonMultiplier;
                    attrTotals[attr] = total;
                    categoryTotal += total;
                });
                attrTotals[`${category}_Overall`] = categoryTotal / attrs.length;
            });
            playerData[player.id] = attrTotals;
        });
        return playerData;
    }, [teamPlayersJoined, includeBoons, includeItems]);

    const overallData = useMemo(() => {
        const attrTotals: Record<string, Record<string, number>> = {
            'Batter_Overall': {},
            'Pitcher_Overall': {},
        };
        categories.forEach((category) => {
            const attrs = [...attrCategories[category], `${category}_Overall`];
            attrs.forEach((attr) => {
                ['Batter', 'Pitcher'].forEach(posType => {
                    let categoryTotal = 0;
                    let playerCount = 0;
                    teamPlayersJoined.filter(p => p.position_type == posType).forEach(player => {
                        const attrValue = playerData[player.id][attr];
                        if (attrValue !== undefined) {
                            categoryTotal += attrValue;
                            playerCount++;
                        }
                    });
                    attrTotals[`${posType}_Overall`][attr] = categoryTotal / playerCount;
                });
            });
        });
        return attrTotals;
    }, [teamPlayersJoined, playerData]);
    console.log(playerData);
    console.log(overallData);

    return (
        <>
            <main className='mt-16'>
                <div className='flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 mx-auto'>
                    <h2 className='text-2xl font-bold mb-2 text-center'>Team Stats Summary</h2>
                    <button onClick={() => setSubpage('items')} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md mb-4">
                        Swap to Equipment
                    </button>
                    <div className='mt-4 flex flex-col'>
                        <div className='text-sm text-center'>Note: Values are measured in stars (25 attribute rating) and are approximate due to rounding on clubhouse reports.</div>
                        <div className='flex mt-2 gap-2 justify-center'>
                            <Checkbox checked={includeItems} label="Include Items" onChange={val => setIncludeItems(val)} />
                            <Checkbox checked={includeBoons} label="Include Boons" onChange={val => setIncludeBoons(val)} />
                        </div>
                    </div>
                    <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-2 mt-6'>
                        {team.players.map((player, i) => {
                            const statsPlayer = players?.find((p: Player) => p.id === player.player_id);
                            if (!statsPlayer) return null;
                            return (
                                <div key={`player-${i}`} className={`col-span-full grid grid-cols-subgrid pt-2 border-t border-[--theme-text]/50`}>
                                    <div className='col-1'>
                                        <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                            <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                            <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                            <div className='row-2 col-2 text-md'>{player.last_name}</div>
                                        </div>
                                    </div>
                                    <div key={`stats-${i}`} className={`col-[2/7] grid grid-cols-4 gap-2`}>
                                        {['Batting', 'Pitching', 'Defense', 'Baserunning'].map((category, j) => {
                                            return <div></div>
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}