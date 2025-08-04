import { Player } from "@/types/Player";
import { Team, TeamPlayer } from "@/types/Team";
import { Dispatch, SetStateAction, useState } from "react";
import { attrTypes, battingAttrs, defenseAttrs, otherAttrs, pitchingAttrs, runningAttrs } from "./Constants";
import { StatEmoji, StatTypes } from "@/lib/statTypes";

export default function TeamItemsPage({ setSubpage, APICalls, team, players, }: { setSubpage: Dispatch<SetStateAction<string>>; APICalls: () => void; team: Team; players: Player[] | undefined }) {

    const [highlights, setHighlights] = useState<Record<string, boolean>>({});

    function toggleAttr(attribute: string): void {
        const newHighlights = { ...highlights };
        newHighlights[attribute] = !highlights[attribute];
        setHighlights(newHighlights);
    }

    function isRelevantAttr(player: TeamPlayer, attribute: string) {
        const attrType = attrTypes[attribute];
        switch (attrType) {
            case 'Batting':
            case 'Running':
                return player.position_type == 'Batter';
            case 'Pitching':
                return player.position_type == 'Pitcher';
            case 'Defense':
                return player.slot != 'DH';
            case 'Other':
                return true;
        }
        return false
    }

    return (
        <>
            <main className='mt-16'>
                <div className='flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 mx-auto'>
                    <h2 className='text-2xl font-bold mb-2 text-center'>Team Equipment</h2>
                    <button onClick={() => setSubpage('summary')} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md mb-4">
                        Swap to Summary
                    </button>
                    <div className='mt-4 flex flex-col'>
                        <div className='text-md text-center'>Click on an attribute to highlight it.</div>
                        <div className='flex mt-2 gap-2 justify-center'>
                            <button onClick={() => APICalls()} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Refresh items
                            </button>
                            <button onClick={() => setHighlights({})} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Reset highlights
                            </button>
                        </div>
                        <div className='flex mt-6 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Batting:</div>
                            {battingAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Pitching:</div>
                            {pitchingAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Defense:</div>
                            {defenseAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Baserunning:</div>
                            {runningAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                            <div className='text-sm font-semibold ml-10'>Other:</div>
                            {otherAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-2 mt-6'>
                        <div className='row-1 col-2 flex flex-col items-center'>
                            <div className='text-2xl'>🧢</div>
                            <div className='text-sm font-semibold uppercase'>Head</div>
                        </div>
                        <div className='row-1 col-3 flex flex-col items-center'>
                            <div className='text-2xl'>👕</div>
                            <div className='text-sm font-semibold uppercase'>Body</div>
                        </div>
                        <div className='row-1 col-4 flex flex-col items-center'>
                            <div className='text-2xl'>🧤</div>
                            <div className='text-sm font-semibold uppercase'>Hands</div>
                        </div>
                        <div className='row-1 col-5 flex flex-col items-center'>
                            <div className='text-2xl'>👟</div>
                            <div className='text-sm font-semibold uppercase'>Feet</div>
                        </div>
                        <div className='row-1 col-6 flex flex-col items-center'>
                            <div className='text-2xl'>💍</div>
                            <div className='text-sm font-semibold uppercase'>Accessory</div>
                        </div>
                        <div className='row-1 col-7 flex flex-col items-center justify-end'>
                            <div className='text-sm font-semibold uppercase'>Total</div>
                        </div>
                        {team.players.map((player, i) => {
                            const statsPlayer = players?.find((p: Player) => p.id === player.player_id);
                            if (!statsPlayer) return null;
                            const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
                            const totals: Map<string, number> = new Map<string, number>();
                            const columns: Record<string, Record<string, number>> = {
                                Pitching: {},
                                Batting: {},
                                Baserunning: {},
                                Defense: {},
                            }

                            return (
                                <div key={i} className={`row-${i + 2} col-span-full grid grid-cols-subgrid pt-2 border-t border-(--theme-text)/50`}>
                                    <div className='col-1'>
                                        <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                            <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                            <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                            <div className='row-2 col-2 text-md'>{player.last_name}</div>
                                        </div>
                                    </div>
                                    {items.map((item, i) => {
                                        if (item == null || item.rarity == 'Normal') return null;
                                        let name = item.name;
                                        let color = '#1c2a3a';
                                        switch (item.rarity) {
                                            case 'Rare':
                                                name = `${item.rareName!} ${item.name}`;
                                                color = '#ffee58';
                                                break;
                                            case 'Magic':
                                                name = `${item.prefix![0]} ${item.name} ${item.suffix![0]}`;
                                                color = '#42a5f5';
                                                break;
                                        }
                                        return <div key={i} className={`col-${i + 2}`}>
                                            <div className={`flex flex-col bg-(--theme-primary) border-2 rounded-lg text-theme-primary py-2 px-1 gap-0.5`} style={{ borderColor: color }}>
                                                {/* <div className='text-[7pt] font-semibold mb-1'>{name}</div> */}
                                                {item.effects.map((effect, i) => {
                                                    const amount = Math.round(effect.value * 100);
                                                    const relevant = isRelevantAttr(player, attrTypes[effect.attribute]);
                                                    totals.set(effect.attribute, amount + (totals.get(effect.attribute) ?? 0));
                                                    const type = StatTypes[effect.attribute]
                                                    if (!columns[type]) columns[type] = {};
                                                    columns[type][effect.attribute] = (columns[type][effect.attribute] ?? 0) + effect.value;
                                                    return <div key={i} className={`flex text-sm gap-1.5 px-1 rounded-lg ${!isRelevantAttr(player, effect.attribute) && 'text-(--theme-text)/60'} ${highlights[effect.attribute] && 'bg-(--theme-score) font-semibold'}`}>
                                                        <div className='w-2 text-left'>{StatEmoji[effect.attribute]}</div>
                                                        <div className='w-5 text-right'>{amount}</div>
                                                        <div>{effect.attribute}</div>
                                                    </div>
                                                })}
                                            </div>
                                        </div>
                                    })}
                                    <div className='col-7 grid grid-cols-[auto_1fr_1fr_auto] auto-rows-min justify-start gap-1.5 gap-x--2'>
                                        {(['Pitching', 'Batting', 'Baserunning', 'Defense', 'Special'] as const).map(type => (
                                            <div key={type} className='flex flex-col gap-1'>
                                                {Object.entries(columns[type] ?? {}).sort((a, b) => b[1] - a[1]).map(([stat, val]) => (
                                                    <div key={stat} className={`flex text-sm w-35 px-1 rounded-lg group
                                                        ${!isRelevantAttr(player, stat) ? 'text-(--theme-text)/60' : ''}
                                                        ${highlights[stat] ? 'bg-(--theme-score) font-semibold' : ''}`}>
                                                        <span className='w-5 text-left'>{StatEmoji[stat]}</span>
                                                        <span className='w-5 text-right pr-1'>{Math.round(val * 100)}</span>
                                                        <span>{stat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
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
