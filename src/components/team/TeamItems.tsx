import { Player } from "@/types/Player";
import { Team, TeamPlayer } from "@/types/Team";
import { useState } from "react";
import { attrAbbrevs, attrTypes, battingAttrs, defenseAttrs, otherAttrs, pitchingAttrs, runningAttrs } from "./Constants";
import { StatEmoji, StatTypes } from "@/lib/statTypes";
import { usePlayers } from "@/hooks/api/Player";
import { Checkbox } from "./Checkbox";
import Link from "next/link";
import { usePersistedState } from "@/hooks/PersistedState";

const SETTING_ABBREVIATE = 'teamItems_abbreviate';
const SETTING_SHOW_TOTALS = 'teamItems_showTotals';
const SETTING_SHOW_ITEM_NAMES = 'teamItems_showItemNames';

export default function TeamItems({ team, }: { team: Team; }) {
    const { data: players } = usePlayers({
        playerIds: team?.players?.map(p => p.player_id),
        staleTime: 0,
    });

    const [highlights, setHighlights] = useState<Record<string, boolean>>({});
    const [abbreviate, setAbbreviate] = useState(() => JSON.parse(localStorage.getItem(SETTING_ABBREVIATE) ?? 'false'));
    const [showTotals, setShowTotals] = useState(() => JSON.parse(localStorage.getItem(SETTING_SHOW_TOTALS) ?? 'true'));
    const [showItemNames, setShowItemNames] = usePersistedState(SETTING_SHOW_ITEM_NAMES, false);

    function toggleAttr(attribute: string): void {
        const newHighlights = { ...highlights };
        newHighlights[attribute] = !highlights[attribute];
        setHighlights(newHighlights);
    }

    function handleToggleAbbreviate(newValue: boolean) {
        setAbbreviate(newValue);
        localStorage.setItem(SETTING_ABBREVIATE, String(newValue));
    }

    function handleToggleShowTotals(newValue: boolean) {
        setShowTotals(newValue);
        localStorage.setItem(SETTING_SHOW_TOTALS, String(newValue));
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
            <div className='flex flex-col'>
                <div className='text-sm text-center'>Click on an attribute to highlight it.</div>
                <div className='flex mt-2 gap-2 justify-center'>
                    <button onClick={() => setHighlights({})} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                        Reset highlights
                    </button>
                </div>
                <div className='flex mt-6 gap-2 justify-start'>
                    <div className='text-sm font-semibold'>Batting:</div>
                    <div className='flex flex-wrap gap-2 justify-start'>
                        {battingAttrs.map(attr =>
                            <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-selected)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                {attr}
                            </button>
                        )}
                    </div>
                </div>
                <div className='flex mt-2 gap-2 justify-start'>
                    <div className='text-sm font-semibold'>Pitching:</div>
                    <div className='flex flex-wrap gap-2 justify-start'>
                        {pitchingAttrs.map(attr =>
                            <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-selected)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                {attr}
                            </button>
                        )}
                    </div>
                </div>
                <div className='flex mt-2 gap-2 justify-start'>
                    <div className='text-sm font-semibold'>Defense:</div>
                    <div className='flex flex-wrap gap-2 justify-start'>
                        {defenseAttrs.map(attr =>
                            <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-selected)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                {attr}
                            </button>
                        )}
                    </div>
                </div>
                <div className='flex mt-2 gap-2 justify-start'>
                    <div className='text-sm font-semibold'>Baserunning:</div>
                    {runningAttrs.map(attr =>
                        <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-selected)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                            {attr}
                        </button>
                    )}
                    <div className='max-sm:hidden text-sm font-semibold ml-10'>Other:</div>
                    <div className='max-sm:hidden flex flex-wrap gap-2 justify-start'>
                        {otherAttrs.map(attr =>
                            <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-selected)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                {attr}
                            </button>
                        )}
                    </div>
                </div>
                <div className='sm:hidden flex mt-2 gap-2 justify-start'>
                    <div className='text-sm font-semibold'>Other:</div>
                    <div className='flex flex-wrap gap-2 justify-start'>
                        {otherAttrs.map(attr =>
                            <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-selected)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                {attr}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className='mt-4 flex flex-col'>
                <div className='flex mt-4 gap-8 justify-center'>
                    <Checkbox checked={abbreviate} label="Abbreviate" onChange={val => handleToggleAbbreviate(val)} />
                    <Checkbox checked={showTotals} label="Show Totals" onChange={val => handleToggleShowTotals(val)} />
                    <Checkbox checked={showItemNames} label="Show Item Names/Emoji" onChange={val => setShowItemNames(val)} />
                </div>
            </div>
            <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-1 lg:gap-2 mt-6 mb-4'>
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
                    <div className='text-sm font-semibold uppercase'>Acc.</div>
                </div>
                {showTotals && <div className='max-2xl:hidden row-1 col-7 flex flex-col items-center justify-end'>
                    <div className='text-sm font-semibold uppercase'>Total</div>
                </div>}
                {team.players.map((player, i) => {
                    const statsPlayer = players?.find((p: Player) => p.id === player.player_id);
                    if (!statsPlayer) return null;
                    const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
                    const columns: Record<string, Record<string, Record<string, number>>> = {
                        Pitching: {},
                        Batting: {},
                        Baserunning: {},
                        Defense: {},
                        Special: {},
                    }

                    return (
                        <div key={i} className={`row-auto max-2xl:row-span-2 col-span-full grid grid-cols-subgrid pt-2 border-t border-(--theme-text)/50`}>
                            <div className='col-1'>
                                <Link className='hover:underline' href={`/player/${player.player_id}`}>
                                    <div className='grid md:grid-cols-[min-content_max-content] md:grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                        <div className='row-1 col-1 text-xs md:text-sm font-semibold self-baseline'>{player.slot}</div>
                                        <div className='max-md:hidden row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                        <div className='max-md:hidden row-2 col-2 text-md'>{player.last_name}</div>
                                    </div>
                                </Link>
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
                                    <div className={`flex flex-col bg-(--theme-primary) border-2 rounded-lg text-theme-primary py-1 lg:py-2 px-0.5 lg:px-1 lg:gap-0.5`} style={{ borderColor: color }}>
                                        {showItemNames && (
                                            <div className='flex max-w-36 justify-center md:justify-start gap-1 px-1 pb-1'>
                                                <div className='text-lg self-start'>{item.emoji}</div>
                                                <div className='max-md:hidden self-center text-xs text-wrap shrink'>{name}</div>
                                            </div>
                                        )}
                                        {item.effects.map((effect, i) => {
                                            const amount = Math.round(effect.value * 100);
                                            const cat = StatTypes[effect.attribute];
                                            if (!columns[cat][effect.attribute]) columns[cat][effect.attribute] = {};
                                            columns[cat][effect.attribute][effect.type] = (columns[cat][effect.attribute][effect.type] ?? 0) + effect.value;
                                            return <div key={i} className={`flex items-baseline text-xs md:text-sm px-1 rounded-lg ${!isRelevantAttr(player, effect.attribute) && 'text-(--theme-text)/60'} ${highlights[effect.attribute] && 'bg-(--theme-selected) font-semibold'}`}>
                                                <div className='max-sm:hidden w-2 text-left mr-1.5'>{StatEmoji[effect.attribute]}</div>
                                                <div className='w-3.5 md:w-6 text-right tabular-nums'>{amount}</div>
                                                {effect.type === 'Multiplier' && <div>%</div>}
                                                {abbreviate
                                                    ? <div className={`text-xs uppercase ${!highlights[effect.attribute] && 'font-medium ml-1'}`}>{attrAbbrevs[effect.attribute]}</div>
                                                    : <div className='ml-1'>{effect.attribute}</div>}
                                            </div>
                                        })}
                                    </div>
                                </div>
                            })}
                            {showTotals &&
                                <div className='col-[2/7] 2xl:col-7 max-md:mt-2 md:max-2xl:mt-4 flex justify-start gap-1 md:gap-1.5 gap-x--2'>
                                    <div className='2xl:hidden pr-1 text-sm font-semibold uppercase text-center border-r border-(--theme-text)/50' style={{writingMode: "sideways-lr"}}>TOTAL</div>
                                    {(['Batting', 'Pitching', 'Defense', 'Baserunning'] as const).map(cat => {
                                        if (player.position_type === 'Batter' && cat === 'Pitching' ||
                                            player.position_type === 'Pitcher' && cat === 'Batting') return null;

                                        const attrs = Object.entries(columns[cat] ?? {}).sort((a, b) => b[1]['FlatBonus'] - a[1]['FlatBonus']);
                                        if (cat === 'Baserunning' && columns['Special']['Luck'])
                                            attrs.push(['Luck', columns['Special']['Luck']]);
                                        return <div key={cat} className={`flex flex-col lg:gap-0.5 ${abbreviate ? 'w-36' : 'w-50'}`}>
                                            {attrs.map(([stat, values]) => (
                                                <div key={stat} className={`flex items-baseline text-xs md:text-sm px-1 rounded-lg group
                                                            ${!isRelevantAttr(player, stat) ? 'text-(--theme-text)/60' : ''}
                                                            ${highlights[stat] ? 'bg-(--theme-selected) font-semibold' : ''}`}>
                                                    <span className='w-4 md:w-5 text-left'>{StatEmoji[stat]}</span>
                                                    {abbreviate
                                                        ? <div className={`flex-1 text-xs uppercase ${!highlights[stat] && 'font-medium'}`}>{attrAbbrevs[stat]}</div>
                                                        : <div className='flex-1'>{stat}</div>}
                                                    <span className='w-8 text-right pr-1 tabular-nums'>
                                                        {values['FlatBonus'] && <>+{Math.round(values['FlatBonus'] * 100)}</>}
                                                    </span>
                                                    <span className='w-10 text-right pr-1 tabular-nums'>
                                                        {values['Multiplier'] && <>+{Math.round(values['Multiplier'] * 100)}%</>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    })}
                                </div>
                            }
                        </div>
                    );
                })}
            </div>
        </>
    );
}
