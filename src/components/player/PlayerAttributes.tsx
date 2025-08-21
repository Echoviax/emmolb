import { Player } from "@/types/Player";
import { useState, Fragment } from "react";
import { battingAttrs, pitchingAttrs, defenseAttrs, runningAttrs, trunc } from "../team/Constants";
import { boonTable } from "../team/BoonDictionary";

export function LesserBoonSelector({ boon, onChange }: { boon: string, onChange: (newBoon: string) => void }) {
    return <select className="bg-theme-primary text-theme-text px-2 py-1 rounded w-32 truncate" value={boon} onChange={(e) => onChange(e.target.value)}>
        {["No Boon", "ROBO", "Demonic", "Angelic", "Undead", "Giant", "Fire Elemental", "Water Elemental", "Air Elemental", "Earth Elemental", "Draconic", "Fae", "One With All", "Archer's Mark", "Geometry Expert",
            "Scooter", "The Light", "Tenacious Badger", "Stormrider", "Insectoid", "Clean", "Shiny", "Psychic", "UFO", "Spectral", "Amphibian", "Mer", "Calculated"].map((boon: string) => (<option key={boon} value={boon}>{boon}</option>))}
    </select>;
}

export function PlayerAttributesTable({ player, boon }: { player: Player, boon: string }) {
    const [openDropboxes, setOpenDropboxes] = useState<Record<string, boolean>>({})

    const statsPlayer = player;
    if (!statsPlayer) return null;

    const name = `${player.first_name} ${player.last_name}`;
    const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
    const itemTotals: Map<string, number> = new Map<string, number>();
    items.forEach((item) => {
        if (item == null || item.rarity == 'Normal') return;
        item.effects.forEach((effect) => {
            const amount = Math.round(effect.value * 100);
            itemTotals.set(effect.attribute, amount + (itemTotals.get(effect.attribute) ?? 0));
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
                        <div className="grid grid-cols-[8.2rem_auto_8.2rem_8.2rem_8.2rem_8.2rem] mb-2">
                            {['Stat Name', 'Stars', 'Star Bucket', 'Item Total', 'Total Bucket', 'Nominal Total'].map((title: string) => (
                                <div key={title} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                    {title}
                                </div>))}
                            {stats.map((stat, k) => {
                                const feedTotal = 0;
                                const boonMultiplier = boonTable?.[boon] ? Object.keys(boonTable[boon]).includes(stat) ? boonTable[boon][stat] : 1 : 1;

                                const stars = talk ? talk.stars?.[stat].length : null;
                                const starText = (
                                    <div className="flex items-center">
                                        {stars ? (<>
                                            <span className="text-xl">{"🌟".repeat(Math.floor(stars / 5))}</span>
                                            <span>{"⭐".repeat(stars % 5)}</span>
                                        </>) : ''}
                                    </div>
                                );
                                const itemTotal = itemTotals.get(stat) ?? 0;
                                const bottomBucket = stars !== null ? Math.max(0, stars * 25 - 12.5) : null;
                                const topBucket = stars !== null ? Math.max(0, stars * 25 + 12.5) : null;
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
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold`}>
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
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold`}>
                                            {trunc(itemTotal * boonMultiplier)}
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 font-semibold`}>
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
                                        </div>
                                        <div className={`${k % 2 == 1 ? 'bg-theme-primary' : 'bg-theme-secondary'} p-1 text-center font-semibold`}>
                                            {stars !== null ?
                                                `${trunc((stars * 25 + itemTotal + feedTotal) * boonMultiplier)}`
                                                : `???`
                                            }
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

export default function PlayerAttributes({ player, }: { player: Player }) {
    const [boon, setBoon] = useState<string>(player.lesser_boon?.name ?? "None");

    return (
        <div className='flex flex-col items-center gap-2 mt-6'>
            <div className="text-lg font-bold">Attributes</div>
            <LesserBoonSelector boon={boon} onChange={setBoon} />
            <PlayerAttributesTable player={player} boon={boon} />
        </div>
    );
}