import { Player } from "@/types/Player";
import { Team } from "@/types/Team";
import { useState, Fragment, useMemo } from "react";
import { attrCategories, attrAbbrevs } from "./Constants";
import { boonTable } from "./BoonDictionary";
import { Palette, palettes } from "./ColorPalettes";
import { usePlayers } from "@/hooks/api/Player";
import { Checkbox } from "./Checkbox";

const SETTING_INCLUDE_ITEMS = 'teamSummary_includeItems';
const SETTING_INCLUDE_BOONS = 'teamSummary_includeBoons';
const SETTING_ATTRS_COLLAPSED = 'teamSummary_attrsCollapsed';
const SETTING_PLAYERS_COLLAPSED = 'teamSummary_playersCollapsed';
const SETTING_PALETTE = 'teamSummary_palette';

const categories = ['Batting', 'Pitching', 'Defense', 'Running', 'Other'];

function isRelevantAttr(posType: string, slot: string | null, category: string) {
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

type AttributeValueCellProps = {
    value: number | undefined,
    palette: Palette,
    isRelevant: boolean,
    isHidden: boolean,
    colSpan?: number,
    rowSpan?: number,
    isOverall?: boolean,
}

function AttributeValueCell({ value, palette, isRelevant, isHidden, colSpan = 1, rowSpan = 1, isOverall }: AttributeValueCellProps) {
    const isUnknown = value === undefined;
    const intValue = value && Math.floor(value);
    const decValue = value && Math.floor(10 * value) % 10;
    const bgColor = isUnknown ? 'var(--color-slate-800)' : palette.colorScale[Math.min(intValue!, palette.colorScale.length - 1)];
    const textColor = isUnknown || intValue! > 1 && palette.isLightToDark || intValue! < 9 && !palette.isLightToDark ? 'text-white text-shadow-md/75' : 'text-black';
    return <div className={`flex items-center justify-center size-12 text-center rounded-md ${textColor} ${isHidden && 'hidden'} ${!isRelevant && 'opacity-60'} ${isOverall && !isUnknown && 'border-3 border-(--theme-text) border-dashed'}`} style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}`, background: bgColor }}>
        <div>
            {isUnknown
                ? <span className='text-2xl'>—</span>
                : <Fragment><span className='text-2xl font-semibold'>{intValue}</span><span className='text-sm'>.{decValue}</span></Fragment>}
        </div>
    </div>
}

export default function TeamSummaryPage({ team, }: { team: Team; }) {
    const [includeItems, setIncludeItems] = useState(() => JSON.parse(localStorage.getItem(SETTING_INCLUDE_ITEMS) ?? 'true'));
    const [includeBoons, setIncludeBoons] = useState(() => JSON.parse(localStorage.getItem(SETTING_INCLUDE_BOONS) ?? 'true'));
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
    const [selectedPalette, setSelectedPalette] = useState(() => localStorage.getItem(SETTING_PALETTE) ?? 'default');
    const palette = palettes[selectedPalette];

    const { data: players } = usePlayers({
        playerIds: team?.players?.map(p => p.player_id),
        staleTime: 0,
    });

    const teamPlayersJoined = useMemo(() => team && players ? team.players.map(tp => {
        const player = players.find((p: Player) => p.id === tp.player_id);
        if (!player) throw new Error(`Player ${tp.first_name} ${tp.last_name} missing from players array`);
        return { ...player, slot: tp.slot };
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
                const mappedCategory = category === 'Running' ? 'base_running' :
                    (category === 'Other' ? 'defense' : category.toLowerCase());
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
                    if (playerCount > 0)
                        attrTotals[`${posType}_Overall`][attr] = categoryTotal / playerCount;
                });
            });
        });
        return attrTotals;
    }, [teamPlayersJoined, playerData]);
    console.log(playerData);
    console.log(overallData);

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

    function handlePaletteChange(newValue: string) {
        setSelectedPalette(newValue);
        localStorage.setItem(SETTING_PALETTE, newValue);
    }

    return (
        <>
            <div className='mt-4 flex flex-col'>
                <div className='text-sm text-center'>Note: Ratings are measured in stars, with each star equivalent to a +25 bonus in that attribute. Values are approximate due to rounding on clubhouse reports.</div>
                <div className='flex mt-4 gap-8 justify-center'>
                    <Checkbox checked={includeItems} label="Include Items" onChange={val => handleToggleIncludeItems(val)} />
                    <Checkbox checked={includeBoons} label="Include Boons" onChange={val => handleToggleIncludeBoons(val)} />
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
                        </select>
                    </div>
                </div>
            </div>
            <div className='grid gap-2 mt-6 grid-flow-row'>
                {['Batter', 'Pitcher'].map((posType, i) =>
                    <div key={posType} className={`${i === 0 && 'row-start-3'} row-span-9 col-start-1 col-span-3 grid grid-rows-subgrid grid-cols-subgrid items-center`}>
                        <div className={`flex items-center row-span-full col-1 h-full p-2 border-r border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${playersCollapsed[posType] && 'hidden'}`} onClick={() => handleExpandCollapsePlayers(posType, true)}>
                            <div className='text-2xl'>⊟</div>
                        </div>
                        <div className={`flex items-center row-span-full col-1 h-full p-2 border-r border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${!playersCollapsed[posType] && 'hidden'}`} onClick={() => handleExpandCollapsePlayers(posType, false)}>
                            <div className='text-2xl'>⊞</div>
                        </div>
                        {teamPlayersJoined.filter(p => p.position_type == posType).map((player, i) =>
                            <Fragment key={player.id}>
                                <div className={`row-auto col-2 ${playersCollapsed[posType] && 'hidden'}`}>
                                    <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                        <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                        <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                        <div className='row-2 col-2 text-md -mt-1'>{player.last_name}</div>
                                    </div>
                                </div>
                                <div className={`row-auto col-3 text-xl ${!includeBoons && 'opacity-60'} ${playersCollapsed[posType] && 'hidden'}`}>
                                    {player.lesser_boon?.emoji}
                                </div>
                            </Fragment>
                        )}
                        <div className={`row-span-full col-2 text-sm uppercase font-semibold ${!playersCollapsed[posType] && 'hidden'}`}>{`${posType}s`}<br />Overall</div>
                    </div>
                )}
                <div className='row-start-1 row-span-20 col-start-4 grid grid-rows-subgrid grid-cols-subgrid items-center justify-items-center' style={{ gridColumn: 'span 35' }}>
                    {categories.map(cat => {
                        const attrs = attrCategories[cat];
                        return <Fragment key={cat}>
                            <div className={`row-1 text-2xl text-center w-full border-b border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${attrsCollapsed[cat] && 'hidden'}`} style={{ gridColumn: `span ${attrs.length}` }} onClick={() => handleExpandCollapseAttrs(cat, true)}>⊟</div>
                            <div className={`row-1 col-auto text-2xl text-center w-full border-b border-(--theme-text)/50 hover:bg-(--theme-primary)/70 cursor-pointer ${!attrsCollapsed[cat] && 'hidden'}`} style={{ gridColumn: `span ${attrs.length}` }} onClick={() => handleExpandCollapseAttrs(cat, false)}>⊞</div>
                            {attrs.map((attr, i) =>
                                <div key={attr} className={`row-2 col-auto text-sm text-center uppercase font-semibold ${attrsCollapsed[cat] && 'hidden'}`}>{attrAbbrevs[attr]}</div>
                            )}
                            <div className={`row-2 col-auto min-w-20 text-sm text-center uppercase font-semibold border-(--theme-text)/50 ${!attrsCollapsed[cat] && 'hidden'}`} style={{ gridColumn: `span ${attrs.length}` }}>{cat}</div>
                        </Fragment>
                    })}
                    {['Batter', 'Pitcher'].map(posType =>
                        <Fragment key={posType}>
                            {teamPlayersJoined.filter(p => p.position_type == posType).map(player => categories.map(cat => {
                                const isRelevant = isRelevantAttr(posType, player.slot, cat);
                                return <Fragment key={`${player.id} ${cat}`}>
                                    {attrCategories[cat].map(attr =>
                                        <AttributeValueCell key={attr} value={playerData[player.id][attr]} palette={palette} isRelevant={isRelevant} isHidden={playersCollapsed[posType] || attrsCollapsed[cat]} />
                                    )}
                                    <AttributeValueCell value={playerData[player.id][`${cat}_Overall`]} palette={palette} isRelevant={isRelevant} isHidden={playersCollapsed[posType] || !attrsCollapsed[cat]} colSpan={attrCategories[cat].length} isOverall={true} />
                                </Fragment>
                            }))}
                            {categories.map(cat => {
                                const isRelevant = isRelevantAttr(posType, null, cat);
                                return <Fragment key={cat}>
                                    {attrCategories[cat].map(attr =>
                                        <AttributeValueCell key={attr} value={overallData[`${posType}_Overall`][attr]} palette={palette} isRelevant={isRelevant} isHidden={!playersCollapsed[posType] || attrsCollapsed[cat]} rowSpan={9} isOverall={true} />
                                    )}
                                    <AttributeValueCell value={overallData[`${posType}_Overall`][`${cat}_Overall`]} palette={palette} isRelevant={isRelevant} isHidden={!playersCollapsed[posType] || !attrsCollapsed[cat]} colSpan={attrCategories[cat].length} rowSpan={9} isOverall={true} />
                                </Fragment>
                            })}
                        </Fragment>
                    )}
                </div>
            </div>
        </>
    );
}