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
    return <select className="bg-theme-primary text-theme-text px-2 py-1 rounded w-32 truncate" value={typeof boon === 'string' ? boon : boon.name} onChange={(e) => onChange(e.target.value)}>
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
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({
        key: 'statName',
        direction: 'ascending',
    });

    const statsPlayer = player;
    if (!statsPlayer) return null;

    const newBoon = player.lesser_boon?.name != boon.name;
    const name = `${player.first_name} ${player.last_name}`;
    const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
    const itemTotals: Map<string, EquipmentEffect> = new Map<string, EquipmentEffect>();
    items.forEach((item) => {
        if (item == null || item.rarity == 'Normal') return;
        item.effects.forEach((effect) => {
            if (effect.type == 'FlatBonus') {
                const flatAmount = Math.round(effect.value * 100) + (itemTotals.get(effect.attribute)?.flatBonusValue ?? 0);
                const existingItems = itemTotals.get(effect.attribute)?.items ?? [];
                const newItems = existingItems.includes(item) ? existingItems : [...existingItems, item];
                itemTotals.set(effect.attribute, { 
                    flatBonusValue: flatAmount, 
                    multiplierValue: (itemTotals.get(effect.attribute)?.multiplierValue ?? 0), 
                    items: newItems 
                });
                return;
            } else { // Multiplier
                const multAmount = effect.value + (itemTotals.get(effect.attribute)?.multiplierValue ?? 0);
                const existingItems = itemTotals.get(effect.attribute)?.items ?? [];
                const newItems = existingItems.includes(item) ? existingItems : [...existingItems, item];
                itemTotals.set(effect.attribute, { 
                    flatBonusValue: (itemTotals.get(effect.attribute)?.flatBonusValue ?? 0), 
                    multiplierValue: multAmount, 
                    items: newItems 
                });
            }
        });
    });

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending')
            direction = 'ascending';
        setSortConfig({ key, direction });
    };

    const sortStatsData = (statRowsData: any[], sortConfig: { key: string | null; direction: 'ascending' | 'descending' }) => {
        const sortableItems = [...statRowsData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key as keyof typeof a];
                const valB = b[sortConfig.key as keyof typeof b];

                if (valA === null) return 1;
                if (valB === null) return -1;

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    };

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

                const statRowsData = stats.map(stat => {
                    const boonMultiplier = 1 + (lesserBoonTable?.[boon.name]?.[stat] ?? 0);
                    const stars = talk ? talk.stars?.[stat].total * 4 : null;
                    const statTotal = talk ? talk.stars?.[stat].total * 100 : null;
                    const statBase = talk ? talk.stars?.[stat].base_total * 100 : null;
                    const multItemBonus = calculateMultItemBonuses(itemTotals, stat, statTotal, statBase);
                    const flatBonus = itemTotals.has(stat) ? itemTotals.get(stat)!.flatBonusValue : 0;
                    const itemBonus = flatBonus + multItemBonus;
                    const items = itemTotals.has(stat) ? itemTotals.get(stat)!.items : [];
                    const totalBeforeBoon = (statBase ?? 0) + itemBonus;
                    const newFinalTotal = totalBeforeBoon * boonMultiplier;
                    const boonBonus = totalBeforeBoon * (boonMultiplier - 1);

                    return {
                        statName: stat,
                        stars: stars,
                        base: statBase,
                        itemBonus: itemBonus,
                        boonBonus: boonBonus,
                        total: newBoon ? newFinalTotal : statTotal,
                        items: items,
                        boonMultiplier: boonMultiplier
                    };
                });

                const sortedStats = sortStatsData(statRowsData, sortConfig);

                const getSortIndicator = (key: string) => {
                    if (sortConfig.key === key) {
                        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
                    }
                    return null;
                };

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
                            <div onClick={() => requestSort('statName')} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary cursor-pointer">Stat Name{getSortIndicator('statName')}</div>
                            <div onClick={() => requestSort('stars')} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary cursor-pointer">Stars{getSortIndicator('stars')}</div>
                            <div onClick={() => requestSort('base')} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary cursor-pointer">Base{getSortIndicator('base')}</div>
                            <div onClick={() => requestSort('itemBonus')} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary cursor-pointer">Items{getSortIndicator('itemBonus')}</div>
                            <div onClick={() => requestSort('boonBonus')} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary cursor-pointer">Boons{getSortIndicator('boonBonus')}</div>
                            <div onClick={() => requestSort('total')} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary cursor-pointer">Total{getSortIndicator('total')}</div>

                            {sortedStats.map((row, k) => {
                                const starText = (
                                    <div className="flex items-center">
                                        {row.stars ? (<>
                                            <span className="text-xl">{"🌟".repeat(Math.floor(row.stars / 10))}</span>
                                            <span>{"⭐".repeat(row.stars % 10)}</span>
                                        </>) : ''}
                                    </div>
                                );

                                return (
                                    <Fragment key={row.statName}>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold relative border-r-2 border-[var(--theme-text)]/30`}>
                                            {row.statName}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold relative border-r-2 border-[var(--theme-text)]/30`}>
                                            {row.stars !== null ? starText : '???'}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold relative border-r-2 border-[var(--theme-text)]/30`}>
                                            {row.base ? trunc(row.base) : '???'}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold relative border-r-2 border-[var(--theme-text)]/30`}>
                                            <div className="text-center">{trunc(row.itemBonus)}</div>
                                            <div className="absolute left-0 top-0 grid grid-cols-3 items-center text-xs z-10">
                                                {row.items.map((item: any, _index: number) => (
                                                    <Tooltip key={_index} content={getItemStatDisplay(item, row.statName)} position="bottom">
                                                        <span className="opacity-70">{item.emoji}</span>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold relative border-r-2 border-[var(--theme-text)]/30`}>
                                            {trunc(row.boonBonus)}
                                            {row.boonMultiplier !== 1 && (
                                                <div className="absolute left-1 top-0 bottom-0 flex items-center z-10">
                                                    <Tooltip content={`${Math.trunc((row.boonMultiplier - 1) * 100)}% ${row.statName}`} position="bottom">
                                                        <span className="opacity-70">{boon.emoji}</span>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold`}>
                                            {row.total ? trunc(row.total) : '???'}
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
