import { FeedMessage } from "@/types/FeedMessage";
import { Player } from "@/types/Player";
import { Team } from "@/types/Team";
import { Dispatch, SetStateAction, useState, useEffect, Fragment } from "react";
import { OpenDropboxes, battingAttrs, pitchingAttrs, defenseAttrs, runningAttrs, trunc } from "./Constants";
import { downloadCSV } from "./CSVGenerator";
import { boonTable } from "./BoonDictionary";

export default function TeamSummaryPage ({ setSubpage, team, players, feed, }: { setSubpage: Dispatch<SetStateAction<string>>; team: Team; players: Player[] | undefined; feed: FeedMessage[] }) {
    const [highlights, setHighlights] = useState<Record<string, boolean>>({});
    const [openDropboxes, setOpenDropboxes] = useState<OpenDropboxes>({}) // PlayerName: "batting: true, defense: false, etc"
    const [boons, setBoons] = useState<Record<string, string>>({});
    
    useEffect(() => {
        if (!players || !team) return;
        const newBoons: Record<string, string> = {};
        for (const player of team.players) {
            const statsPlayer = players.find((p: Player) => p.id === player.player_id);
            if (!statsPlayer) continue;
            const boon = statsPlayer.lesser_boon?.name ?? "None";
            newBoons[player.player_id] = boon;
        }
        setBoons(newBoons);
    }, [players, team]);

    function toggleAttr(attribute: string): void {
        const newHighlights = { ...highlights };
        newHighlights[attribute] = !highlights[attribute];
        setHighlights(newHighlights);
    }

    const feedTotals: Record<string, Record<number, Record<number, Record<string, number>>>> = {} // Name: {Season: {Day: {Stat: Buff}}}
    for (const message of feed) {
        if (message.type != 'augment') continue;
        const regex = /([\p{L}\s.'-]+?) gained \+(\d+) (\w+)\./gu;
        const matches = [...message.text.matchAll(regex)];

        for (const match of matches) {
            const name = match[1].trim();
            const amount = Number(match[2]);
            const attribute = match[3];
            let day = Number(message.day);
            if (Number.isNaN(day)) day = 240;
            const season = Number(message.season);

            if (!feedTotals[name]) feedTotals[name] = {};
            if (!feedTotals[name][season]) feedTotals[name][season] = {};
            if (!feedTotals[name][season][day]) feedTotals[name][season][day] = {};
            if (!feedTotals[name][season][day][attribute]) feedTotals[name][season][day][attribute] = 0;

            feedTotals[name][season][day][attribute] += amount;
        }
    }

    return (
        <>
            <main className='mt-16'>
                <div className='flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 mx-auto'>
                    <h2 className='text-2xl font-bold mb-2 text-center'>Team Stats Summary</h2>
                    <button onClick={() => setSubpage('items')} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md mb-4">
                        Swap to Equipment
                    </button>
                    <div className='mt-4 flex flex-col'>
                        <div className='text-md text-center'>Click on an attribute to highlight it.</div>
                        <div className='flex mt-2 gap-2 justify-center'>
                            <button onClick={() => setHighlights({})} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Reset highlights
                            </button>
                            <button onClick={() => downloadCSV(players!, feedTotals)} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Download CSV
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
                        </div>
                    </div>
                    <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-2 mt-6'>
                        {team.players.map((player, i) => {
                            const statsPlayer = players?.find((p: Player) => p.id === player.player_id);
                            if (!statsPlayer) return null;
                            const name = `${player.first_name} ${player.last_name}`;
                            const boon = boons ? boons?.[player.player_id] : "No Boon";
                            const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
                            const itemTotals: Map<string, number> = new Map<string, number>();
                            items.map((item) => {
                                if (item == null || item.rarity == 'Normal') return null;
                                item.effects.map((effect) => {
                                    const amount = Math.round(effect.value * 100);
                                    itemTotals.set(effect.attribute, amount + (itemTotals.get(effect.attribute) ?? 0));
                                })
                            })
                            return (
                                <div key={`player-${i}`} className={`col-span-full grid grid-cols-subgrid pt-2 border-t border-[--theme-text]/50`}>
                                    <div className='col-1'>
                                        <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                            <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                            <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                            <div className='row-2 col-2 text-md'>{player.last_name}</div>
                                            <div className='row-3 col-2 text-md'>
                                                <select className="bg-theme-primary text-theme-text px-2 py-1 rounded w-32 truncate" value={boons[player.player_id]} onChange={(e) => setBoons((prev) => ({...prev, [player.player_id]: e.target.value}))}>
                                                    {["No Boon", "ROBO", "Demonic", "Angelic", "Undead", "Giant", "Fire Elemental", "Water Elemental", "Air Elemental", "Earth Elemental", "Draconic", "Fae", "One With All", "Archer's Mark", "Geometry Expert", 
                                                        "Scooter", "The Light", "Tenacious Badger", "Stormrider", "Insectoid", "Clean", "Shiny", "Psychic", "UFO", "Spectral", "Amphibian", "Mer", "Calculated"].map((boon: string) => 
                                                        (<option key={boon} value={boon}>{boon}</option>))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div key={`stats-${i}`} className={`col-[2/7] grid grid-cols-4 gap-2`}>
                                        {['Batting', 'Pitching', 'Defense', 'Baserunning'].map((category, j) => {
                                            let stats: string[] = [];
                                            switch (category){
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
                                            const talkDay = talk?.day ?? 0;
                                            const talkSeason = talk?.season ?? 0;
                                            return (<>
                                                <button
                                                    key={`${name}-${category}`}
                                                    onClick={() =>
                                                    setOpenDropboxes(prev => ({
                                                        ...prev,
                                                        [name]: {
                                                            ...prev[name],
                                                            [category]: !prev[name]?.[category],
                                                        },
                                                    }))
                                                    }
                                                    className={`col-[1/5] w-[50rem] px-3 py-1 text-l ${talk ? `bg-theme-primary hover:opacity-80` : `bg-theme-secondary opacity-80 hover:opacity-60`} rounded-md`}
                                                >
                                                    {category}
                                                </button>
                                                <div className={`col-[1/5] w-full px-3 py-1 ${openDropboxes[name]?.[category] ? '' : 'hidden'}`}>
                                                    <div className="grid grid-cols-[8.2rem_auto_8.2rem_8.2rem_8.2rem_8.2rem] mb-2">
                                                        {['Stat Name', 'Stars', 'Star Bucket', 'Item Total', 'Total Bucket', 'Nominal Total'].map((title: string) => (
                                                            <div key={title} className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                                {title}
                                                            </div>))}
                                                        {stats.map((stat, k) => {
                                                            const feedTotal = 0;
                                                            const playerFeed = feedTotals[name];
                                                            const boonMultiplier = boonTable?.[boon] ? Object.keys(boonTable[boon]).includes(stat) ? boonTable[boon][stat] : 1 : 1;
                                                            // if (playerFeed) {
                                                            //     for (const [seasonStr, seasonData] of Object.entries(playerFeed)) {
                                                            //         const season = Number(seasonStr);
                                                            //         if (season < talkSeason) continue;

                                                            //         for (const [dayStr, statMap] of Object.entries(seasonData)) {
                                                            //             const day = Number(dayStr);
                                                            //             if (season === talkSeason && day < talkDay) continue;

                                                            //             const amount = statMap[stat];
                                                            //             if (amount) feedTotal += amount;
                                                            //         }
                                                            //     }
                                                            // }

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
                                                            const bottomBucket = stars !== null ? Math.max(0, stars*25-12.5) : null;
                                                            const topBucket = stars !== null ? Math.max(0, stars*25+12.5) : null;
                                                            return (
                                                                <Fragment key={stat}>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold relative`}>
                                                                        {stat}
                                                                        {boonMultiplier !== 1 && (
                                                                            <span className="absolute -right-1 text-xs">ㅤ *{boonMultiplier}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold`}>
                                                                        {stars !== null ? starText : '???'}
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold`}>
                                                                        <div className="flex justify-between w-full opacity-80">
                                                                            <div className='text-start'>
                                                                                {stars !== null ? 
                                                                                    `${bottomBucket ? trunc(bottomBucket*boonMultiplier) : (bottomBucket)}` 
                                                                                    : '???'
                                                                                }
                                                                            </div>
                                                                            <div className="absolute h-2 mt-0.7 ml-14 mx-2">–</div>
                                                                            <div className='text-end'>
                                                                                {stars !== null ? 
                                                                                    `${topBucket ? trunc(topBucket*boonMultiplier) : (topBucket)}` 
                                                                                    : '???'
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 text-center font-semibold`}>
                                                                        {trunc(itemTotal*boonMultiplier)}
                                                                    </div>
                                                                    {/* <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 text-center font-semibold`}>
                                                                        {trunc(feedTotal*boonMultiplier)}
                                                                    </div> */}
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold`}>
                                                                        <div className="flex justify-between w-full opacity-80">
                                                                            <span className="text-start">
                                                                                {stars !== null ? 
                                                                                    `${trunc((bottomBucket! + itemTotal + feedTotal)*boonMultiplier)}` 
                                                                                    : '???'
                                                                                }
                                                                            </span>
                                                                            <div className="absolute h-2 mt-0.7 ml-14 mx-2">–</div>
                                                                            <span className="text-end">
                                                                                {stars !== null ? 
                                                                                    `${trunc((topBucket! + itemTotal + feedTotal)*boonMultiplier)}` 
                                                                                    : '???'
                                                                                }
                                                                            </span>
                                                                        </div>                                                                    
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 text-center font-semibold`}>
                                                                        {stars !== null ? 
                                                                            `${trunc((stars*25+itemTotal+feedTotal)*boonMultiplier)}` 
                                                                            : `???`
                                                                        }
                                                                    </div>
                                                                </Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>);
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