import { Boon, Equipment, Player } from "@/types/Player";
import { useState, Fragment, useMemo } from "react";
import { battingAttrs, pitchingAttrs, defenseAttrs, runningAttrs, trunc, attrCategories, attrAbbrevs, statDefinitions } from "../team/Constants";
import { lesserBoonTable } from "../team/BoonDictionary";
import { AttributePaletteSelector, AttributeValue, AttributeValueCell, computeAttributeValues, isRelevantAttr, PlayerWithSlot, SETTING_INCLUDE_ITEMS, SETTING_PALETTE } from "../team/TeamAttributes";
import { Palette, palettes } from "../team/ColorPalettes";
import { usePersistedState } from "@/hooks/PersistedState";
import { Checkbox } from "../team/Checkbox";
import { Tooltip } from "../ui/Tooltip";

export function LesserBoonSelector({ boon, onChange }: { boon: Boon, onChange: (newBoon: string) => void }) {
    return <select className="bg-theme-primary text-theme-text px-2 py-1 rounded w-32 truncate" value={boon.name} onChange={(e) => onChange(e.target.value)}>
        {["No Boon", "ROBO", "Demonic", "Angelic", "Undead", "Giant", "Fire Elemental", "Water Elemental", "Air Elemental", "Earth Elemental", "Draconic", "Fae", "One With All", "Archer's Mark", "Geometry Expert",
            "Scooter", "The Light", "Tenacious Badger", "Stormrider", "Insectoid", "Clean", "Shiny", "Psychic", "UFO", "Spectral", "Amphibian", "Mer", "Calculated"].map((boon: string) => (<option key={boon} value={boon}>{boon}</option>))}
    </select>;
}


export type EquipmentEffect = {
    flatBonusValue: number;
    multiplierValue: number;
    items: Equipment[]
}

export function PlayerAttributesTable({ player, boon }: { player: Player, boon: Boon }) {
    const [openDropboxes, setOpenDropboxes] = useState<Record<string, boolean>>({})

    const statsPlayer = player;
    if (!statsPlayer) return null;

    const name = `${player.first_name} ${player.last_name}`;
    const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
    const itemTotals: Map<string, EquipmentEffect> = new Map<string, EquipmentEffect>();
    items.forEach((item) => {
        if (item == null || item.rarity == 'Normal') return;
        item.effects.forEach((effect) => {
            if (effect.type == 'FlatBonus') {
                const flatAmount = Math.round(effect.value * 100) + (itemTotals.get(effect.attribute)?.flatBonusValue ?? 0);
                itemTotals.set(effect.attribute, { flatBonusValue: flatAmount, multiplierValue: (itemTotals.get(effect.attribute)?.multiplierValue ?? 0), items: [...(itemTotals.get(effect.attribute)?.items ?? []), item] });
                return;
            } else { // Multiplier
                const multAmount = effect.value + (itemTotals.get(effect.attribute)?.multiplierValue ?? 0)
                itemTotals.set(effect.attribute, { flatBonusValue: (itemTotals.get(effect.attribute)?.flatBonusValue ?? 0), multiplierValue: multAmount, items: [...(itemTotals.get(effect.attribute)?.items ?? []), item] });
            }
        })
    })

    return (
        <>
            {['Batting', 'Pitching', 'Defense', 'Baserunning'].map((category, j) => {
                let stats: string[] = [];
                switch (category) {
                    case 'Pitching':
                        stats = pitchingAttrs;
                        break;
                    case 'Batting':
                        stats = battingAttrs;
                        break;
                    case 'Defense':
                        stats = defenseAttrs;
                        break;
                    case 'Baserunning':
                        stats = runningAttrs;
                        break;
                }
                const mappedCategory = category === 'Baserunning' ? 'base_running' : category.toLowerCase();
                const talk = statsPlayer.talk?.[mappedCategory];
                return (<Fragment key={category}>
                    <button
                        key={`${name}-${category}`}
                        onClick={() =>
                            setOpenDropboxes(prev => ({
                                ...prev,
                                [category]: !prev[category],
                            }))
                        }
                        className={`w-[50rem] px-3 py-1 text-l ${talk ? `bg-theme-primary hover:opacity-80` : `bg-theme-secondary opacity-80 hover:opacity-60`} rounded-md`}
                    >
                        {category}
                    </button>
                    <div className={`w-full px-3 py-1 ${openDropboxes[category] ? '' : 'hidden'}`}>
                        <div className="grid grid-cols-6 mb-2">
                            {['Stat Name', 'Stars', 'Base', 'Items', 'Boons', 'Total'].map((title: string) => (
                                <div key={title} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                    {title}
                                </div>))}
                            {stats.map((stat, k) => {
                                const feedTotal = 0;
                                const boonMultiplier = 1 + (lesserBoonTable?.[boon.name]?.[stat] ?? 0);

                                const stars = talk ? talk.stars?.[stat].total * 4 : null;
                                const starText = (
                                    <div className="flex items-center">
                                        {stars ? (<>
                                            <span className="text-xl">{"🌟".repeat(Math.floor(stars / 10))}</span>
                                            <span>{"⭐".repeat(stars % 10)}</span>
                                        </>) : ''}
                                    </div>
                                );
                                const bottomBucket = stars !== null ? Math.max(0, stars * 25 - 12.5) : null;
                                const topBucket = stars !== null ? Math.max(0, stars * 25 + 12.5) : null;

                                const statTotal = talk ? talk.stars?.[stat].total * 100 : null;
                                const statBase = talk ? talk.stars?.[stat].base_total * 100 : null;

                                const multItemBonus = calculateMultItemBonuses(itemTotals, stat, statTotal, statBase);
                                const flatBonus = itemTotals.has(stat) ? itemTotals.get(stat)!.flatBonusValue : 0;
                                const items = itemTotals.has(stat) ? itemTotals.get(stat)!.items : [];


                                return (
                                    <Fragment key={stat}>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold relative`}>
                                            {stat}
                                            {boonMultiplier !== 1 && (
                                                <span className="absolute -right-1 text-xs">ㅤ *{boonMultiplier}</span>
                                            )}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold`}>
                                            {stars !== null ? starText : '???'}
                                        </div>
                                        {/* <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold`}>
                                            <div className="flex justify-between w-full opacity-80">
                                                <div className='text-start'>
                                                    {stars !== null ?
                                                        `${bottomBucket ? trunc(bottomBucket * boonMultiplier) : (bottomBucket)}`
                                                        : '???'
                                                    }
                                                </div>
                                                <div className="absolute h-2 mt-0.7 ml-14 mx-2">–</div>
                                                <div className='text-end'>
                                                    {stars !== null ?
                                                        `${topBucket ? trunc(topBucket * boonMultiplier) : (topBucket)}`
                                                        : '???'
                                                    }
                                                </div>
                                            </div>
                                        </div> */}
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold`}>
                                            {statBase ? trunc(statBase) : '???'}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold flex justify-center`}>
                                            {trunc(flatBonus + multItemBonus)}
                                            <div className="flex justify-center">
                                                {items.map((item, _index) => (
                                                    <Tooltip content={getItemStatDisplay(item, stat)} position="bottom">
                                                        <span>{item.emoji}</span>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold`}>
                                            {trunc((statBase ? statBase : 0 + multItemBonus + flatBonus) * (boonMultiplier - 1))}
                                            {boonMultiplier !== 1 && (
                                                <Tooltip
                                                    content={`${Math.trunc((boonMultiplier - 1) * 100)}% ${stat}`}
                                                    position="bottom"
                                                >
                                                    <span>{boon.emoji}</span>
                                                </Tooltip>
                                            )}
                                        </div>

                                        {/* <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold`}>
                                            <div className="flex justify-between w-full opacity-80">
                                                <span className="text-start">
                                                    {stars !== null ?
                                                        `${trunc((bottomBucket! + itemTotal + feedTotal) * boonMultiplier)}`
                                                        : '???'
                                                    }
                                                </span>
                                                <div className="absolute h-2 mt-0.7 ml-14 mx-2">–</div>
                                                <span className="text-end">
                                                    {stars !== null ?
                                                        `${trunc((topBucket! + itemTotal + feedTotal) * boonMultiplier)}`
                                                        : '???'
                                                    }
                                                </span>
                                            </div>
                                        </div> */}
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold`}>
                                            {statTotal ? trunc(statTotal) : '???'}
                                        </div>
                                    </Fragment>
                                );
                            })}
                        </div>
                    </div>
                </Fragment>);
            })}
        </>
    );
}

function PlayerAttributesCondensedCategory({ player, attrValues, category, palette }: { player: PlayerWithSlot, attrValues: Record<string, AttributeValue>, category: string, palette: Palette }) {
    const isRelevant = isRelevantAttr(player.position_type, player.slot, category);
    const attrCount = attrCategories[category].length;

    return (
        <div className={`flex items-stretch gap-1.5 md:gap-2 ${!isRelevant && 'opacity-60'}`}>
            <div className='md:pr-0.5 text-sm font-semibold uppercase text-center border-r border-(--theme-text)/50' style={{ writingMode: "sideways-lr" }}>{category}</div>
            <div className='grid gap-x-1 md:gap-x-2 gap-y-3 grid-rows-2 md:grid-rows-1 grid-flow-row'>
                {attrCategories[category].map((attr, i) => (
                    <div key={attr} className={`flex flex-col gap-0.5 ${i >= attrCount / 2 ? 'row-2 md:row-1' : 'row-1'}`}>
                        <Tooltip content={statDefinitions[attr]} position="top">
                            <div className='text-sm text-center font-semibold uppercase'>{attrAbbrevs[attr]}</div>
                        </Tooltip>
                        <AttributeValueCell attrValue={attrValues[attr]} palette={palette} isRelevant={true} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlayerAttributesCondensed({ player, boonName }: { player: PlayerWithSlot, boonName: string }) {
    // const [includeItems, setIncludeItems] = usePersistedState(SETTING_INCLUDE_ITEMS, true);
    const includeItems = true;
    const [selectedPalette, setSelectedPalette] = usePersistedState(SETTING_PALETTE, 'default');
    const attrValues = useMemo(() => computeAttributeValues({ player, lesserBoonOverride: boonName, includeItems }), [player, boonName, includeItems]);
    const palette = palettes[selectedPalette];

    return (
        <div className='flex flex-col gap-8 md:gap-4 mt-4 mb-6'>
            <div className='flex flex-wrap gap-x-8 gap-y-2 mb-2 justify-center'>
                {/* <Checkbox checked={includeItems} label="Include Items" onChange={setIncludeItems} /> */}
                <div className='flex gap-2 items-center'>
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Palette:</div>
                    <AttributePaletteSelector value={selectedPalette} onChange={setSelectedPalette} />
                </div>
            </div>
            <PlayerAttributesCondensedCategory category='Batting' player={player} attrValues={attrValues} palette={palette} />
            <div className='flex gap-3 md:gap-6'>
                <PlayerAttributesCondensedCategory category='Pitching' player={player} attrValues={attrValues} palette={palette} />
                <PlayerAttributesCondensedCategory category='Other' player={player} attrValues={attrValues} palette={palette} />
            </div>
            <div className='flex gap-3 md:gap-6'>
                <PlayerAttributesCondensedCategory category='Defense' player={player} attrValues={attrValues} palette={palette} />
                <PlayerAttributesCondensedCategory category='Running' player={player} attrValues={attrValues} palette={palette} />
            </div>
        </div>
    );
}

function calculateMultItemBonuses(itemTotals: Map<string, EquipmentEffect>, stat: string, statTotal: number | null, baseTotal: number | null): number {
    if (statTotal == null || baseTotal == null) return 0;
    if (!itemTotals.has(stat)) return 0;
    const effect = itemTotals.get(stat)!;
    if (effect.multiplierValue == 0) return 0;

    const base = baseTotal + effect.flatBonusValue;
    return base * effect.multiplierValue;
}

function getItemStatDisplay(item: Equipment, stat: string): string {
    const effects = item.effects.filter(e => e.attribute === stat);
    if (effects.length === 0) return "";
    const effectsDisplay = effects.map((effect) => {
        if (effect.type == 'FlatBonus') {
            return `+${trunc(effect.value * 100)}`;
        } else {
            return `${trunc(effect.value * 100)}%`;
        }
    }
    ).join(", ");
    return `${effectsDisplay} ${stat}`;
}

export default function PlayerAttributes({ player, }: { player: PlayerWithSlot }) {
    const [boonOverride, setBoonOverride] = useState<string>();
    const noneBoon: Boon = { name: "None", description: "", emoji: "" };
    let boon = player.lesser_boon;

    if (boonOverride) {
        boon = { name: boonOverride, description: "", emoji: "*" };
    } else if (!boon) {
        boon = noneBoon;
    }

    return (
        <div className='flex flex-col items-center-safe gap-2 mt-4 max-w-full'>
            <div className='flex gap-2 items-baseline'>
                <div className='text-base'>Lesser Boon:</div>
                <LesserBoonSelector boon={boon} onChange={setBoonOverride} />
            </div>
            <PlayerAttributesCondensed player={player} boonName={boon.name} />
            <PlayerAttributesTable player={player} boon={boon} />
        </div>
    );
}
