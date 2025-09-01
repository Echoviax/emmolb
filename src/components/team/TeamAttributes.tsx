import { Player } from "@/types/Player";
import { Team, TeamPlayer } from "@/types/Team";
import { useState, Fragment, useMemo } from "react";
import { attrCategories, attrAbbrevs, statDefinitions, attrCategoryNames } from "./Constants";
import { greaterBoonTable, lesserBoonTable, modificationTable } from "./BoonDictionary";
import { Palette, palettes } from "./ColorPalettes";
import { usePlayers } from "@/hooks/api/Player";
import { Checkbox } from "./Checkbox";
import { downloadCSV } from "./CSVGenerator";
import Link from "next/link";
import { LesserBoonSelector, PlayerAttributesTable } from "../player/PlayerAttributes";

const SETTING_INCLUDE_ITEMS = 'teamSummary_includeItems';
const SETTING_INCLUDE_BOONS = 'teamSummary_includeBoons';
const SETTING_INCLUDE_CONDITIONAL = 'teamSummary_includeConditional';
const SETTING_ATTRS_COLLAPSED = 'teamSummary_attrsCollapsed';
const SETTING_PLAYERS_COLLAPSED = 'teamSummary_playersCollapsed';
const SETTING_HIDDEN_PLAYERS = 'teamSummary_hiddenPlayers';
const SETTING_HIDDEN_STATS = 'hiddenStats';
export const SETTING_PALETTE = 'teamSummary_palette';
export const SETTING_SHOW_EXPANDED_TABLE = 'teamSummary_showExpandedTable';

export type PlayerWithSlot = Player & Pick<TeamPlayer, 'slot'>;

export function isRelevantAttr(posType: string, slot: string | null, category: string) {
    switch (category) {
        case 'Batting':
        case 'Running':
            return posType == 'Batter';
        case 'Pitching':
            return posType == 'Pitcher';
        case 'Defense':
            return !slot || slot != 'DH';
        case 'Other':
            return true;
    }
    return false
}

export type AttributeValue = {
    value: number;
    flatBonus?: number;
    addMultBonus?: number;
    multMultBonus?: number;
}

export function computeAttributeValues({ player, lesserBoonOverride, includeItems = true, includeBoons = true, includeConditional = false }: { player: PlayerWithSlot; lesserBoonOverride?: string; includeItems?: boolean; includeBoons?: boolean; includeConditional?: boolean; }) {
    const lesserBoon = lesserBoonOverride ? lesserBoonTable[lesserBoonOverride]
        : player.lesser_boon && lesserBoonTable[player.lesser_boon.name];
    const greaterBoon = player.greater_boon && greaterBoonTable[player.greater_boon.name];
    const modifications = player.modifications?.map(mod => modificationTable[mod.name]).filter(x => x) ?? [];
    const items = [player.equipment.head, player.equipment.body, player.equipment.hands, player.equipment.feet, player.equipment.accessory];
    const itemTotals: Map<string, number> = new Map<string, number>();
    items.forEach((item) => {
        if (item == null || item.rarity == 'Normal') return;
        item.effects.forEach((effect) => {
            const amount = Math.round(effect.value * 100);
            itemTotals.set(effect.attribute, amount + (itemTotals.get(effect.attribute) ?? 0));
        });
    });

    const attrTotals: Record<string, AttributeValue> = {};
    attrCategoryNames.forEach((category) => {
        const mappedCategory = category === 'Running' ? 'base_running' :
            (category === 'Other' ? 'defense' : category.toLowerCase());
        const talk = player.talk?.[mappedCategory];
        if (!talk)
            return;

        const attrs = attrCategories[category];
        let categoryTotal = 0;
        attrs.forEach((attr) => {
            const stars = talk.stars?.[attr].length ?? 0;
            const itemTotal = includeItems ? itemTotals.get(attr) ?? 0 : 0;

            let flatBonus = 0;
            let addMultBonus = 0;
            let multMultBonus = 1;
            if (includeBoons) {
                addMultBonus += lesserBoon?.[attr] ?? 0;
                if (greaterBoon && (!greaterBoon.isConditional || includeConditional)) {
                    addMultBonus += greaterBoon.attributes?.[attr] ?? 0;
                    addMultBonus += greaterBoon.categories?.[category] ?? 0;
                }
                for (const mod of modifications) {
                    if (mod.bonusType === 'flat')
                        flatBonus += mod.attributes[attr] ?? 0;
                    else if (mod.bonusType === 'add-mult')
                        addMultBonus += mod.attributes[attr] ?? 0;
                    else if (mod.bonusType === 'mult-mult')
                        multMultBonus *= mod.attributes[attr] ?? 0;
                }
            }

            const total = (stars + (itemTotal + flatBonus) / 25) * (1 + addMultBonus) * multMultBonus;
            attrTotals[attr] = {
                value: total,
                flatBonus,
                addMultBonus,
                multMultBonus,
            }
            categoryTotal += total;
        });
        attrTotals[`${category}_Overall`] = { value: categoryTotal / attrs.length };
    });
    return attrTotals;
}

type AttributeValueCellProps = {
    attrValue: AttributeValue | undefined,
    palette: Palette,
    isRelevant: boolean,
    isHidden?: boolean,
    colSpan?: number,
    rowSpan?: number,
    isOverall?: boolean,
}

export function AttributeValueCell({ attrValue, palette, isRelevant, isHidden = false, colSpan = 1, rowSpan = 1, isOverall = false }: AttributeValueCellProps) {
    const value = attrValue?.value;
    const boonEffect = attrValue?.addMultBonus;
    const isUnknown = value === undefined;
    const intValue = value && Math.floor(value);
    const decValue = value && Math.floor(10 * value) % 10;
    const bgColor = isUnknown ? 'var(--color-slate-800)' : palette.colorScale[Math.min(intValue!, palette.colorScale.length - 1)];
    const textColor = isUnknown || intValue! > 1 && palette.isLightToDark || intValue! < 9 && !palette.isLightToDark ? 'text-white text-shadow-md/75' : 'text-black';
    const borderClass = useMemo(() => {
        if (isUnknown) {
            return '';
        }
        if (isOverall) {
            return 'border-3 border-[var(--theme-text)] border-dashed';
        }
        return '';
    }, [isOverall, isUnknown]);
    return <div className={`relative flex items-center justify-center snap-start size-12 text-center rounded-md ${textColor} ${isHidden && 'hidden'} ${!isRelevant && 'opacity-60'} ${borderClass}`} style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}`, background: bgColor }}>
        {boonEffect !== undefined && boonEffect !== 0 && !isOverall && !isUnknown && (
            <div className={`absolute ${boonEffect > 0 ? 'top-0' : 'bottom-0'} right-0.5 text-xs`}>
                {boonEffect > 0 && <span className={`${textColor}`}>▲</span>}
                {boonEffect < 0 && <span className={`${textColor}`}>▼</span>}
            </div>
        )}
        <div>
            {isUnknown
                ? <span className='text-2xl'>—</span>
                : <Fragment><span className='text-2xl font-semibold'>{intValue}</span><span className='text-sm'>.{decValue}</span></Fragment>}
        </div>
    </div>
}

function TeamAttributesCondensedGrid({ players }: { team: Team; players: PlayerWithSlot[] }) {
    const [includeItems, setIncludeItems] = useState(() => JSON.parse(localStorage.getItem(SETTING_INCLUDE_ITEMS) ?? 'true'));
    const [includeBoons, setIncludeBoons] = useState(() => JSON.parse(localStorage.getItem(SETTING_INCLUDE_BOONS) ?? 'true'));
    const [includeConditional, setIncludeConditional] = useState(() => JSON.parse(localStorage.getItem(SETTING_INCLUDE_CONDITIONAL) ?? 'true'));
    const [attrsCollapsed, setAttrsCollapsed] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem(SETTING_ATTRS_COLLAPSED) ?? 'null') || {
        Batting: true,
        Pitching: true,
        Defense: true,
        Running: true,
    });
    const [playersCollapsed, setPlayersCollapsed] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem(SETTING_PLAYERS_COLLAPSED) ?? 'null') || {
        Batter: false,
        Pitcher: false,
    });
    const [hiddenPlayers, setHiddenPlayers] = useState<string[]>(() => JSON.parse(localStorage.getItem(SETTING_HIDDEN_PLAYERS) ?? '[]'));
    const [hiddenStats, setHiddenStats] = useState<string[]>(() => JSON.parse(localStorage.getItem(SETTING_HIDDEN_STATS) ?? '[]'));
    const [showHideControls, setShowHideControls] = useState<boolean>(false);
    const [selectedPalette, setSelectedPalette] = useState(() => localStorage.getItem(SETTING_PALETTE) ?? 'default');
    const palette = palettes[selectedPalette];

    const totalAttrCount = useMemo(() =>
        attrCategoryNames.reduce((sum, cat) => sum + attrCategories[cat].length, 0),
        []
    );

    const visibleTotalAttrCount = showHideControls ? totalAttrCount : totalAttrCount - hiddenStats.length;

    const playerData = useMemo(() => {
        const playerData: Record<string, Record<string, AttributeValue>> = {}
        players.forEach(player => {
            playerData[player.id] = computeAttributeValues({ player, includeItems, includeBoons, includeConditional });
        });
        return playerData;
    }, [players, includeBoons, includeItems, includeConditional]);

    const overallData = useMemo(() => {
        const attrTotals: Record<string, Record<string, AttributeValue>> = {
            'Batter_Overall': {},
            'Pitcher_Overall': {},
        };
        attrCategoryNames.forEach((category) => {
            const attrs = [...attrCategories[category], `${category}_Overall`];
            attrs.forEach((attr) => {
                ['Batter', 'Pitcher'].forEach(posType => {
                    let categoryTotal = 0;
                    let playerCount = 0;
                    players.filter(p => p.position_type == posType).forEach(player => {
                        const attrValue = playerData[player.id][attr];
                        if (attrValue !== undefined) {
                            categoryTotal += attrValue.value;
                            playerCount++;
                        }
                    });
                    if (playerCount > 0)
                        attrTotals[`${posType}_Overall`][attr] = { value: categoryTotal / playerCount };
                });
            });
        });
        return attrTotals;
    }, [players, playerData]);

    function handleExpandCollapseAttrs(category: string, newValue: boolean) {
        setAttrsCollapsed(x => {
            const newAttrs = { ...x };
            newAttrs[category] = newValue;
            localStorage.setItem(SETTING_ATTRS_COLLAPSED, JSON.stringify(newAttrs));
            return newAttrs;
        });
    }

    function handleExpandCollapsePlayers(posType: string, newValue: boolean) {
        setPlayersCollapsed(x => {
            const newPlayers = { ...x };
            newPlayers[posType] = newValue;
            localStorage.setItem(SETTING_PLAYERS_COLLAPSED, JSON.stringify(newPlayers));
            return newPlayers;
        });
    }

    function handleToggleIncludeItems(newValue: boolean) {
        setIncludeItems(newValue);
        localStorage.setItem(SETTING_INCLUDE_ITEMS, String(newValue));
    }

    function handleToggleIncludeBoons(newValue: boolean) {
        setIncludeBoons(newValue);
        localStorage.setItem(SETTING_INCLUDE_BOONS, String(newValue));
    }

    function handleToggleIncludeConditional(newValue: boolean) {
        setIncludeConditional(newValue);
        localStorage.setItem(SETTING_INCLUDE_CONDITIONAL, String(newValue));
    }

    function handlePaletteChange(newValue: string) {
        setSelectedPalette(newValue);
        localStorage.setItem(SETTING_PALETTE, newValue);
    }

    function handleTogglePlayerHiddenStatus(playerId: string) {
        setHiddenPlayers(prev => {
            const isCurrentlyHidden = prev.includes(playerId);
            const newHiddenPlayers = isCurrentlyHidden ? prev.filter(id => id !== playerId) : [...prev, playerId];
            localStorage.setItem(SETTING_HIDDEN_PLAYERS, JSON.stringify(newHiddenPlayers));
            return newHiddenPlayers;
        });
    }

    function handleToggleStatHiddenStatus(stat: string) {
        setHiddenStats(prev => {
            const isCurrentlyHidden = prev.includes(stat);
            const newHiddenStats = isCurrentlyHidden ? prev.filter(id => id !== stat) : [...prev, stat];
            localStorage.setItem(SETTING_HIDDEN_STATS, JSON.stringify(newHiddenStats));
            return newHiddenStats;
        });
    }

    function handleToggleVisibility() {
        if (hiddenPlayers.length > 0 || hiddenStats.length > 0) {
            setHiddenStats(() => {
                localStorage.setItem(SETTING_HIDDEN_STATS, '[]');
                return [];
            });
            setHiddenPlayers(() => {
                localStorage.setItem(SETTING_HIDDEN_PLAYERS, '[]');
                return [];
            });
        } else {
            const allStats = Object.values(attrCategories).flat();
            setHiddenStats(() => {
                localStorage.setItem(SETTING_HIDDEN_STATS, JSON.stringify(allStats));
                return allStats;
            });
            const allPlayers = players.map(p => p.id);
            setHiddenPlayers(() => {
                localStorage.setItem(SETTING_HIDDEN_PLAYERS, JSON.stringify(allPlayers));
                return allPlayers;
            });
        }
    }

    return (
        <>
            <div className='flex flex-wrap mt-4 gap-x-8 gap-y-2 justify-center'>
                <Checkbox checked={includeItems} label="Include Items" onChange={val => handleToggleIncludeItems(val)} />
                <Checkbox checked={includeBoons} label="Include Boons/Mods" onChange={val => handleToggleIncludeBoons(val)} />
                <Checkbox checked={includeConditional} disabled={!includeBoons} label="Conditional Bonuses" onChange={val => handleToggleIncludeConditional(val)} />
                <Checkbox checked={showHideControls} label="Manage Visibility" onChange={setShowHideControls} />
                <div className='flex gap-2 items-center'>
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Palette:</div>
                    <select className='text-sm bg-(--theme-primary) p-1 rounded-sm' value={selectedPalette} onChange={evt => handlePaletteChange(evt.target.value)}>
                        <option value='default'>Default</option>
                        <option value='viridis'>Viridis</option>
                        <option value='viridisReversed'>Viridis (Reversed)</option>
                        <option value='inferno'>Inferno</option>
                        <option value='infernoReversed'>Inferno (Reversed)</option>
                        <option value='magma'>Magma</option>
                        <option value='magmaReversed'>Magma (Reversed)</option>
                        <option value='plasma'>Plasma</option>
                        <option value='plasmaReversed'>Plasma (Reversed)</option>
                        <option value='cividis'>Cividis</option>
                        <option value='cividisReversed'>Cividis (Reversed)</option>
                        <option value='redToGreen'>RGB</option>
                        <option value='redToGreenReversed'>RGB (Reversed)</option>
                    </select>
                </div>
            </div>
            <div className='flex flex-nowrap items-start gap-2 max-w-full'>
                <div className='grid gap-2 mt-6 grid-flow-row'>
                    <div className='row-1 col-1 h-8'></div>
                    <div className='row-2 col-1 h-5'></div>
                    {showHideControls && (<button className='row-1 col-span-2 h-5 self-center bg-theme-primary text-xs hover:opacity-80 rounded-md' onClick={handleToggleVisibility}>Toggle Visiblity</button>)}
                    {['Batter', 'Pitcher'].map((posType, i) =>
                        <div key={posType} className={`${i === 0 && 'row-start-3'} row-span-9 col-start-1 col-span-3 grid grid-rows-subgrid grid-cols-subgrid items-center`}>
                            <div className={`flex items-center row-span-full col-1 h-full p-2 border-r border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${playersCollapsed[posType] && 'hidden'}`} onClick={() => handleExpandCollapsePlayers(posType, true)}>
                                <div className='text-2xl'>⊟</div>
                            </div>
                            <div className={`flex items-center row-span-full col-1 h-full p-2 border-r border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${!playersCollapsed[posType] && 'hidden'}`} onClick={() => handleExpandCollapsePlayers(posType, false)}>
                                <div className='text-2xl'>⊞</div>
                            </div>
                            {players.filter(p => p.position_type == posType && (!hiddenPlayers.includes(p.id) || showHideControls)).map((player, i) =>
                                <Fragment key={player.id}>
                                    <div className={`row-auto content-center col-2 h-12 flex items-center ${playersCollapsed[posType] && 'hidden'}`}>
                                        {showHideControls && (
                                            <button onClick={() => handleTogglePlayerHiddenStatus(player.id)} className="flex items-center justify-center size-6 shrink-0">
                                                {hiddenPlayers.includes(player.id) ? '👁️‍🗨️' : '👁️'}
                                            </button>
                                        )}
                                        <Link className='hover:underline flex-grow' href={`/player/${player.id}`}>
                                            <div className='grid md:grid-cols-[min-content_max-content] md:grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                                <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                                <div className='max-md:hidden row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                                <div className='max-md:hidden row-2 col-2 text-md -mt-1'>{player.last_name}</div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className={`row-auto col-3 flex gap-x-0.5 text-xl ${playersCollapsed[posType] && 'hidden'}`}>
                                        {player.greater_boon &&
                                            <div className={`${(!includeBoons || greaterBoonTable[player.greater_boon.name].isConditional && !includeConditional) && 'opacity-60'}`} title={player.greater_boon.name}>
                                                {player.greater_boon.emoji}
                                            </div>
                                        }
                                        {player.lesser_boon &&
                                            <div className={`${!includeBoons && 'opacity-60'}`} title={player.lesser_boon.name}>
                                                {player.lesser_boon.emoji}
                                            </div>
                                        }
                                        {player.modifications.map(mod => (
                                            <div key={mod.name} className={`relative ${!includeBoons && 'opacity-60'}`} title={mod.name}>
                                                <div>
                                                    {mod.emoji}
                                                </div>
                                                {modificationTable[mod.name]?.stackCount && (
                                                    <div className='absolute right-0 bottom-0 text-sm font-bold text-shadow-sm/50'>
                                                        {modificationTable[mod.name].stackCount}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Fragment>
                            )}
                            <div className={`row-span-full col-2 text-sm uppercase font-semibold ${!playersCollapsed[posType] && 'hidden'}`}>{`${posType}s`}<br />Overall</div>
                        </div>
                    )}
                </div>
                <div className='grid gap-2 mt-6 pb-2 grid-flow-row overflow-x-auto snap-x' style={{ scrollbarColor: 'var(--theme-primary) var(--theme-background)' }}>
                    <div className='row-start-1 row-span-20 col-start-4 grid grid-rows-subgrid grid-cols-subgrid items-center justify-items-center' style={{ gridColumn: `span ${visibleTotalAttrCount}` }}>
                        {attrCategoryNames.map(cat => {
                            const attrs = attrCategories[cat];
                            const visibleAttrCount = showHideControls ? attrs.length : attrs.filter(attr => !hiddenStats.includes(attr)).length;
                            return <Fragment key={cat}>
                                <div className={`row-1 text-2xl text-center w-full border-b border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${attrsCollapsed[cat] && 'hidden'}`} style={{ gridColumn: `span ${visibleAttrCount}` }} onClick={() => handleExpandCollapseAttrs(cat, true)}>⊟</div>
                                <div className={`row-1 col-auto text-2xl text-center w-full border-b border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${!attrsCollapsed[cat] && 'hidden'}`} style={{ gridColumn: `span ${visibleAttrCount}` }} onClick={() => handleExpandCollapseAttrs(cat, false)}>⊞</div>
                                {attrs.filter(attr => !(hiddenStats.includes(attr) && !showHideControls)).map((attr, i) =>
                                    <div key={attr} className={`row-2 col-auto text-sm text-center uppercase font-semibold ${attrsCollapsed[cat] && 'hidden'} ${hiddenStats.includes(attr) && !showHideControls && 'hidden'}`} title={statDefinitions[attr]}>
                                        {showHideControls && (
                                            <button onClick={() => handleToggleStatHiddenStatus(attr)} className="flex items-center justify-center size-6 shrink-0">
                                                {hiddenStats.includes(attr) ? '👁️‍🗨️' : '👁️'}
                                            </button>
                                        )}
                                        {attrAbbrevs[attr]}
                                    </div>
                                )}
                                <div className={`row-2 col-auto min-w-20 text-sm text-center uppercase font-semibold border-(--theme-text)/50 ${!attrsCollapsed[cat] && 'hidden'}`} style={{ gridColumn: `span ${visibleAttrCount}` }}>{cat}</div>
                            </Fragment>
                        })}
                        {['Batter', 'Pitcher'].map(posType =>
                            <Fragment key={posType}>
                                {players.filter(p => p.position_type == posType && (!hiddenPlayers.includes(p.id) || showHideControls)).map(player => attrCategoryNames.map(cat => {
                                    const isRelevant = isRelevantAttr(posType, player.slot, cat);
                                    const attrs = attrCategories[cat];
                                    const visibleAttrCount = showHideControls ? attrs.length : attrs.filter(attr => !hiddenStats.includes(attr)).length;
                                    return <Fragment key={`${player.id} ${cat}`}>
                                        {attrCategories[cat].filter(attr => !(hiddenStats.includes(attr) && !showHideControls)).map(attr => {
                                                return <AttributeValueCell key={attr} attrValue={playerData[player.id][attr]} palette={palette} isRelevant={isRelevant} isHidden={playersCollapsed[posType] || attrsCollapsed[cat] || (hiddenStats.includes(attr) && !showHideControls)} />;
                                            }
                                        )}
                                        <AttributeValueCell attrValue={playerData[player.id][`${cat}_Overall`]} palette={palette} isRelevant={isRelevant} isHidden={playersCollapsed[posType] || !attrsCollapsed[cat]} colSpan={visibleAttrCount} isOverall={true} />
                                    </Fragment>
                                }))}
                                {attrCategoryNames.map(cat => {
                                    const isRelevant = isRelevantAttr(posType, null, cat);
                                    const attrs = attrCategories[cat];
                                    const visibleAttrCount = showHideControls ? attrs.length : attrs.filter(attr => !hiddenStats.includes(attr)).length;
                                    return <Fragment key={cat}>
                                        {attrCategories[cat].filter(attr => !(hiddenStats.includes(attr) && !showHideControls)).map(attr =>
                                            <AttributeValueCell key={attr} attrValue={overallData[`${posType}_Overall`][attr]} palette={palette} isRelevant={isRelevant} isHidden={!playersCollapsed[posType] || attrsCollapsed[cat] || (hiddenStats.includes(attr) && !showHideControls)} rowSpan={9} isOverall={true} />
                                        )}
                                        <AttributeValueCell attrValue={overallData[`${posType}_Overall`][`${cat}_Overall`]} palette={palette} isRelevant={isRelevant} isHidden={!playersCollapsed[posType] || !attrsCollapsed[cat]} colSpan={visibleAttrCount} rowSpan={9} isOverall={true} />
                                    </Fragment>
                                })}
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function TeamAttributesExpandedTable({ players }: { team: Team, players: PlayerWithSlot[] }) {
    const [selectedBoons, setSelectedBoons] = useState<Record<string, string>>({});

    return (
        <div className='grid grid-cols-[auto_auto] gap-2 mt-6'>
            {players.map((player, i) => {
                const boon = selectedBoons[player.id] ?? player.lesser_boon?.name ?? "No Boon";
                return (
                    <div key={`player-${i}`} className={`col-span-full grid grid-cols-subgrid pt-2 border-t border-[--theme-text]/50`}>
                        <div className='col-1'>
                            <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                <div className='row-2 col-2 text-md'>{player.last_name}</div>
                                <div className='row-3 col-2 text-md'>
                                    <LesserBoonSelector boon={boon} onChange={(newBoon) => setSelectedBoons((prev) => ({ ...prev, [player.id]: newBoon }))} />
                                </div>
                            </div>
                        </div>
                        <div key={`stats-${i}`} className={`col-2 flex flex-col items-center gap-2`}>
                            <PlayerAttributesTable player={player} boon={boon} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function TeamAttributes({ team, }: { team: Team; }) {
    const [showExpandedTable, setShowExpandedTable] = useState(() => JSON.parse(localStorage.getItem(SETTING_SHOW_EXPANDED_TABLE) ?? 'false'));

    const { data: players } = usePlayers({
        playerIds: team?.players?.map(p => p.player_id),
        staleTime: 0,
    });

    const teamPlayersJoined = useMemo(() => team && players ? team.players.map(tp => {
        const player = players.find((p: Player) => p.id === tp.player_id);
        if (!player) throw new Error(`Player ${tp.first_name} ${tp.last_name} missing from players array`);
        return { ...player, slot: tp.slot } as PlayerWithSlot;
    }) : [], [team, players]);

    function handleToggleShowExpandedTable(newValue: boolean) {
        setShowExpandedTable(newValue);
        localStorage.setItem(SETTING_SHOW_EXPANDED_TABLE, String(newValue));
    }

    return (
        <>
            {!showExpandedTable && <div className='text-sm text-center'>Note: Ratings are measured in stars, with each star equivalent to a +25 bonus in that attribute. Values are approximate due to rounding on clubhouse reports.</div>}
            <div className='flex gap-2 justify-center'>
                <button onClick={() => handleToggleShowExpandedTable(!showExpandedTable)} className="self-center mt-2 px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    {!showExpandedTable ? 'Switch to Expanded Table' : 'Switch to Condensed Grid'}
                </button>
                <button onClick={() => downloadCSV(players!)} className="self-center mt-2 px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                    Download CSV
                </button>
            </div>
            {showExpandedTable
                ? <TeamAttributesExpandedTable team={team} players={teamPlayersJoined} />
                : <TeamAttributesCondensedGrid team={team} players={teamPlayersJoined} />
            }
        </>
    );
}