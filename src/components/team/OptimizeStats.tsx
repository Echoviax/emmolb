'use client'
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import { MapAPITeamResponse, PlaceholderTeam, Team, TeamPlayer } from "@/types/Team";
import { Equipment, EquipmentEffect, EquipmentEffectTypes, MapAPIPlayerResponse, Player } from "@/types/Player";
import { FeedMessage } from "@/types/FeedMessage";
import { getPlayerStatRows } from "./CSVGenerator";
import { EquipmentTooltip } from "../player/PlayerPageHeader";
import { capitalize } from "@/helpers/StringHelper";
import { attrTypes, statDefinitions } from "./Constants";
import { PositionalWeights } from "./PositionalWeights";
import { Tooltip } from "../ui/Tooltip";

type EquipmentSlot = 'head' | 'body' | 'hands' | 'feet' | 'accessory';

function getPositionalWeights(positionalWeights: Record<string, Record<string, number>>, position: string, attribute: string): number {
    const positionWeights = positionalWeights[position];
    if (!positionWeights) {
        return 1.0;
    }

    const weight = positionWeights[attribute];
    return weight !== undefined ? weight : 1.0;
}

function shouldFilterAttribute(attribute: string, player: Player, ignoreBaserunningAndFielding?: boolean): boolean {
    const attrType = attrTypes[attribute];

    // Filter out pitching stats for batters
    if (attrType === 'Pitching' && player.position_type === 'Batter') return true;

    // Filter out batting stats for pitchers
    if (attrType === 'Batting' && player.position_type === 'Pitcher') return true;

    // Filter out running/defense stats for pitchers or when ignored
    if ((attrType === 'Running' || attrType === 'Defense') &&
        (player.position_type === 'Pitcher' || ignoreBaserunningAndFielding)) return true;

    return false;
}

// Get weights and apply positional multipliers
// normalWeight is between 1 and 2
function getStatWeights(player: Player, mode: 'strength' | 'weakness' | 'neutral', ignoreBaserunningAndFielding: boolean, positionalWeights: Record<string, number>): Record<string, number> {
    const playerTalk = reducePlayerTalk(player);

    if (!playerTalk) return {};
    const entries = Object.entries(playerTalk);

    const sorted = entries
        .filter(([statName, val]) => {
            if (Number.isNaN(Number(val))) return false;

            return !shouldFilterAttribute(statName, player, ignoreBaserunningAndFielding);
        })
        .sort((a, b) => mode === 'strength' ? (b[1] as number) - (a[1] as number) : (a[1] as number) - (b[1] as number));

    const weights: Record<string, number> = {};
    for (let i = 0; i < sorted.length; i++) {
        // between 1 and 2
        const normalWeight = mode === 'neutral' ? 1 : (1 + (sorted.length - i) / sorted.length);
        const positionalWeight = positionalWeights[sorted[i][0]] !== undefined ? positionalWeights[sorted[i][0]] : 1.0;

        weights[sorted[i][0]] = normalWeight * positionalWeight;
    }

    return weights;
}

// Give equipment a score
function scoreEquipment(equipment: Equipment, playerTalk: Record<string, number>, weights: Record<string, number>) {
    const res = equipment.effects.reduce((sum, effect) => {
        const playerStatValue = playerTalk[effect.attribute] ?? 0;
        const weight = weights[effect.attribute] ?? 0;
        if (weight == 0) return sum;
        if (effect.type == EquipmentEffectTypes.FLATBONUS) {
            return sum + weight * effect.value * 100;
        } else if (effect.type == EquipmentEffectTypes.MULTIPLIER) {
            // just do mult on base value for now
            // next step, take lesser boons into account            
            return sum + weight * (playerStatValue * 100 * effect.value);
        } else {
            return sum;
        }
    }, 0);
    return res;
}

function parseInventoryHTML(html: string): Equipment[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const items: Equipment[] = [];

    const itemDivs = doc.querySelectorAll("div.relative.group");

    itemDivs.forEach(item => {
        const rareName = item.querySelector("div.text-\\[8px\\]")?.textContent?.trim();
        const emoji = item.querySelector("div.text-3xl")?.textContent?.trim() || "❓";

        if (!rareName) return;

        const tooltipDiv = item.querySelector("div[style*='transform: translateX']");

        let rarity = "Normal";
        let slot: string | undefined = undefined;
        const effects: EquipmentEffect[] = [];

        if (tooltipDiv) {
            const slotText = tooltipDiv.querySelector("div.text-\\[10px\\]")?.textContent?.trim() || "";
            const slotTextParts = slotText.split(' ');
            if (slotTextParts.length >= 2) {
                rarity = slotTextParts[0];
                slot = slotTextParts[1];
            }

            const statBonuses = tooltipDiv.querySelectorAll("div.text-blue-400, div.text-yellow-400"); // Accounts for magic and rare items
            statBonuses.forEach(line => {
                const bonus = line.querySelector("span.font-semibold");
                const stat = line.querySelector("span.opacity-80");

                if (bonus && stat) {
                    const isMultiplier = bonus.textContent?.includes('%');
                    const value = parseInt(bonus.textContent?.trim() || "0", 10); // parseInt due to a +
                    const attribute = stat.textContent?.trim() || "Unknown";


                    if (!isNaN(value) && attribute !== "Unknown") {
                        effects.push({
                            attribute: attribute,
                            type: isMultiplier ? EquipmentEffectTypes.MULTIPLIER : EquipmentEffectTypes.FLATBONUS,
                            value: value / 100,
                        });
                    }
                }
            });
        }

        items.push({
            name: rareName,
            rareName,
            emoji,
            rarity,
            slot,
            effects,
        });
    });

    return items;
}

// Hi, hey, hello howdy, yo, heyo
// Uhhhhh. So I might have written bad code
// And the way around my bad code may be to make a fake rareName for Magic Items
function fudgeRareName(equipment: Equipment): Equipment {
    if (!equipment || equipment.rareName) return equipment;
    equipment.rareName = `${equipment.prefix?.join(' ') ?? ''} ${equipment.name ?? ''} ${equipment.suffix?.join(' ') ?? ''}`.trim();
    return equipment;
}

// returns flat list statName->base_total mapping for all talk entries
function reducePlayerTalk(player: Player): Record<string, number> {
    const playerTalk: Record<string, number> = {};
    if (player.talk) {
        Object.entries(player.talk).map(([_categoryKey, entry]) => {
            if (entry) {
                Object.entries(entry.stars || {}).map(([statKey, star]) => {
                    playerTalk[statKey] = star.base_total;
                });
            }
        });
    }
    return playerTalk;
}

export default function OptimizeTeamPage({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<Team>(PlaceholderTeam);
    const [players, setPlayers] = useState<Player[] | undefined>(undefined);
    const [weights, setWeights] = useState<Record<string, Record<string, number>> | undefined>(undefined);
    const [statPlayers, setStatPlayers] = useState<Record<string, Record<string, string | number>> | undefined>(undefined);
    const [feed, setFeed] = useState<FeedMessage[]>([]);
    const [scored, setScored] = useState<{ name: string; scores: any }[]>([]);
    const [equippedEquipment, setEquippedEquipment] = useState<Equipment[]>([]);
    const [parsedEquipment, setParsedEquipment] = useState<Equipment[]>([]);
    const [entryText, setEntryText] = useState<string>('');
    const [optimizedLineup, setOptimizedLineup] = useState<{ lineup: Player[], originalScore: number, newScore: number } | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [activeOptimizedTooltip, setActiveOptimizedTooltip] = useState<string | null>(null);
    const [optimizeSetting, setOptimizeSetting] = useState<'strength' | 'weakness' | 'neutral'>('strength');
    const [ignoreBaserunningAndFielding, setIgnoreBaserunningAndFielding] = useState<boolean>(false);
    const [usePositionalWeights, setUsePositionalWeights] = useState<boolean>(true);
    const [useCustomWeights, setUseCustomWeights] = useState<boolean>(false);
    const [customPlayerWeights, setCustomPlayerWeights] = useState<Record<string, Record<string, number>>>({});

    const toggleIgnoreBaserunningAndFielding = () => {
        setIgnoreBaserunningAndFielding((prev) => !prev);
    };

    // Toggle positional weights on/off and recalculate if you do
    const toggleUsePositionalWeights = () => {
        setUsePositionalWeights((prev) => {
            const newValue = !prev;

            // Re-initialize all existing custom weight matrices when toggled
            if (players) {
                const updatedWeights: Record<string, Record<string, number>> = {};

                players.forEach(player => {
                    const playerName = `${player.first_name} ${player.last_name}`;
                    if (customPlayerWeights[playerName]) {
                        const defaultWeights: Record<string, number> = {};
                        const playerTalk = reducePlayerTalk(player);

                        Object.keys(playerTalk).forEach(attribute => {
                            if (shouldFilterAttribute(attribute, player)) return;

                            defaultWeights[attribute] = newValue
                                ? getPositionalWeights(PositionalWeights, player.position, attribute)
                                : 1.0;
                        });

                        updatedWeights[playerName] = defaultWeights;
                    }
                });

                setCustomPlayerWeights(prev => ({ ...prev, ...updatedWeights }));
            }

            return newValue;
        });
    };

    const toggleUseCustomWeights = () => {
        setUseCustomWeights((prev) => !prev);
    };

    const updateCustomWeight = (playerId: string, attribute: string, weight: number) => {
        setCustomPlayerWeights((prev) => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [attribute]: weight
            }
        }));
    };

    // Initialize custom weights based on default positional weights
    const initializePlayerWeights = (player: Player) => {
        const playerName = `${player.first_name} ${player.last_name}`;
        if (!customPlayerWeights[playerName]) {
            const defaultWeights: Record<string, number> = {};
            const playerTalk = reducePlayerTalk(player);

            Object.keys(playerTalk).forEach(attribute => {
                if (shouldFilterAttribute(attribute, player)) return;

                defaultWeights[attribute] = usePositionalWeights
                    ? getPositionalWeights(PositionalWeights, player.position, attribute)
                    : 1.0;
            });

            setCustomPlayerWeights((prev) => ({
                ...prev,
                [playerName]: defaultWeights
            }));
        }
    };

    const toggle = (label: string) => { setActiveTooltip((prev) => (prev === label ? null : label)); };
    const toggleOptimized = (label: string) => { setActiveOptimizedTooltip((prev) => (prev === label ? null : label)); };

    async function APICalls() {
        try {
            const teamRes = await fetch(`/nextapi/team/${id}`);
            if (!teamRes.ok) throw new Error('Failed to load team data');
            const team = MapAPITeamResponse(await teamRes.json());
            setTeam(team);

            const playersRes = await fetch(`/nextapi/players?ids=${team.players.map((p: TeamPlayer) => p.player_id).join(',')}`);
            if (!playersRes.ok) throw new Error('Failed to load player data');
            const players = await playersRes.json();
            setPlayers(players.players.map((p: any) => MapAPIPlayerResponse(p)));

            const feedRes = await fetch(`/nextapi/feed/${id}`);
            if (!feedRes.ok) throw new Error('Failed to load feed data');
            const feed = await feedRes.json();
            setFeed(feed.feed as FeedMessage[]);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        APICalls();
    }, [id]);

    useEffect(() => {
        if (!players || !feed) return;
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

        const stats = players?.map((player: Player) => getPlayerStatRows({ statsPlayer: player, }));
        setEquippedEquipment(players?.flatMap((player: Player) => Object.values(player.equipment).map((equip) => fudgeRareName(equip))));
        const statPlayers: Record<string, Record<string, string | number>> = stats.reduce((acc, rowSet) => {
            for (const row of rowSet) {
                const playerId = row.PlayerName;
                const statName = row.Stat;
                const value = row.NominalTotal;

                if (!acc[playerId]) acc[playerId] = {};
                acc[playerId][statName] = value;
            }
            return acc;
        }, {} as Record<string, Record<string, string | number>>);
        setStatPlayers(statPlayers);
    }, [players, feed]);

    useEffect(() => {
        if (!statPlayers || !players) return;
        setWeights(weights);
        const scored = players.map((p) => {
            const playerName = `${p.first_name} ${p.last_name}`;
            const customWeights = useCustomWeights && customPlayerWeights[playerName] ? customPlayerWeights[playerName] : {};
            const playerWeights = getStatWeights(p, optimizeSetting, ignoreBaserunningAndFielding, customWeights);
            const playerTalk: Record<string, number> = reducePlayerTalk(p);

            return {
                name: playerName,
                scores: {
                    head: p.equipment.head ? scoreEquipment(p.equipment.head, playerTalk, playerWeights) : 0,
                    body: p.equipment.body ? scoreEquipment(p.equipment.body, playerTalk, playerWeights) : 0,
                    hands: p.equipment.hands ? scoreEquipment(p.equipment.hands, playerTalk, playerWeights) : 0,
                    feet: p.equipment.feet ? scoreEquipment(p.equipment.feet, playerTalk, playerWeights) : 0,
                    accessory: p.equipment.accessory ? scoreEquipment(p.equipment.accessory, playerTalk, playerWeights) : 0,
                }
            };
        });
        setScored(scored);
    }, [statPlayers, players, optimizeSetting, ignoreBaserunningAndFielding, useCustomWeights, customPlayerWeights]);

    const handleOptimize = () => {
        if (!players || !statPlayers) return;

        const allItems = [...equippedEquipment, ...parsedEquipment].filter(Boolean);
        const itemPool = new Map<string, Equipment>();
        allItems.forEach(item => {
            if (item.rareName) {
                itemPool.set(item.rareName, item);
            }
        });

        type PotentialAssignment = { score: number; item: Equipment; player: Player; slot: string };
        const potentialAssignments: PotentialAssignment[] = [];

        for (const player of players) {
            const playerName = `${player.first_name} ${player.last_name}`;
            const customWeights = useCustomWeights && customPlayerWeights[playerName] ? customPlayerWeights[playerName] : {};
            const playerWeights = getStatWeights(player, optimizeSetting, ignoreBaserunningAndFielding, customWeights);
            if (!playerWeights) continue;
            const playerTalk: Record<string, number> = reducePlayerTalk(player);

            for (const item of itemPool.values()) {
                const score = scoreEquipment(item, playerTalk, playerWeights);
                potentialAssignments.push({ score, item, player, slot: item.slot! });
            }
        }

        potentialAssignments.sort((a, b) => b.score - a.score);

        const assignedItems = new Set<string>();
        const filledSlots = new Set<string>();
        const newPlayerEquipment: Record<string, Record<string, Equipment>> = {};
        players.forEach(p => newPlayerEquipment[p.id] = {});

        for (const assignment of potentialAssignments) {
            const { item, player, slot } = assignment;
            const slotKey = `${player.id}-${slot}`;

            if (item.rareName && !assignedItems.has(item.rareName) && !filledSlots.has(slotKey)) {
                newPlayerEquipment[player.id][slot.toLowerCase()] = item;
                assignedItems.add(item.rareName);
                filledSlots.add(slotKey);
            }
        }

        let newTotalScore = 0;
        const finalLineup = players.map(p => {
            const playerName = `${p.first_name} ${p.last_name}`;
            const customWeights = useCustomWeights && customPlayerWeights[playerName] ? customPlayerWeights[playerName] : {};
            const playerWeights = getStatWeights(p, 'strength', ignoreBaserunningAndFielding, customWeights);
            const playerTalk: Record<string, number> = reducePlayerTalk(p);

            const finalEquipment = newPlayerEquipment[p.id];
            Object.values(finalEquipment).forEach(equip => {
                newTotalScore += scoreEquipment(equip, playerTalk, playerWeights);
            });
            return { ...p, equipment: finalEquipment };
        });

        const originalTotalScore = scored.reduce((total, p) => total + Object.values(p.scores as Record<string, number>).reduce((subTotal: number, s: number) => subTotal + s, 0), 0);

        setOptimizedLineup({ lineup: finalLineup, originalScore: originalTotalScore, newScore: newTotalScore });
    };

    if (loading) return (<Loading />);

    if (!team) return (<div className="text-white text-center mt-10">Can't find that team</div>);

    return (
        <main className="mt-16 p-4" onClick={() => { setActiveTooltip(null); setActiveOptimizedTooltip(null); }}>
            <span className="font-bold text-lg mb-3">How does optimization work?</span><br></br>
            Optimization calculates weights based on the player's current stats. Then, depending on which option you have selected, it either<br></br>
            - Tries to make already large numbers larger, resulting in a bunch of stand out players.<br></br>
            - Tries to make all the small numbers larger, resulting in a more averaged team of players.<br></br>
            - Treats all stats equally, allowing for custom weights to shine.<br></br>
            It calculates these through a greedy algorithm, testing the resulting score of every piece of equipment on every player, and then assigning them to the one with the highest score<br></br><br></br>
            <span className="font-bold text-lg">Drawbacks</span><br></br>
            - Items are equipped from top to bottom. This is possible to change, and I plan on that soon<br></br>
            - Inventories can only really be copied on computer, so this can only reorganize equipment on mobile<br></br>
            <span className="italic font-semibold">- This can only calculate score for known stat values, so if not every player on your team has every talk unlocked, this will not be fully accurate</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <h2 className="text-xl font-bold mb-2">(Optional) Paste Inventory HTML</h2>
                    <form onSubmit={(e) => { e.preventDefault(); setParsedEquipment(parseInventoryHTML(entryText)); }}>
                        <textarea
                            className="w-full h-40 bg-theme-primary border border-theme-accent rounded p-2 text-sm"
                            onChange={(e) => setEntryText(e.target.value)}
                            value={entryText}
                            placeholder="Open up inspect element, find the div that holds your items, then copy and paste the outerHTML here. This currently supports one page."
                        />
                        <button type="submit" className="bg-theme-secondary hover:opacity-80 px-4 py-2 rounded mt-2">Parse Inventory</button>

                    </form>

                    <h2 className="text-xl font-bold mt-6 mb-2">Original Team Scores</h2>
                    <div className="space-y-4">
                        {players?.map((player) => {
                            return (
                                <div key={player.id} className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                                    <div className="text-xl mb-2 text-center font-bold mt-2">{player.first_name} {player.last_name}</div>
                                    <div className="flex justify-center flex-wrap gap-4 my-4">
                                        {(['head', 'body', 'hands', 'feet', 'accessory'] as EquipmentSlot[]).map((slot) => (
                                            <div key={`${player.id}-${slot}`} className="flex flex-col items-center w-20">
                                                <EquipmentTooltip
                                                    equipment={player.equipment[slot]}
                                                    name={capitalize(slot)}
                                                    isActive={activeTooltip === `${player.id}-${slot}`}
                                                    onToggle={() => toggle(`${player.id}-${slot}`)}
                                                    appendName={false}
                                                />
                                                <div className="mt-1 text-sm">
                                                    {scored.find(s => s.name === `${player.first_name} ${player.last_name}`)?.scores[slot].toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center font-bold">
                                        Total: {((Object.values(scored.find(s => s.name === `${player.first_name} ${player.last_name}`)?.scores || []) as number[])
                                            .reduce((a, b) => a + b, 0)).toFixed(2)}
                                    </div>

                                    {useCustomWeights && (
                                        <div className="mt-4 space-y-3">
                                            {(() => {
                                                initializePlayerWeights(player);
                                                const playerWeights = customPlayerWeights[`${player.first_name} ${player.last_name}`] || {};

                                                // Group attributes by type
                                                const groupedAttributes: Record<string, [string, number][]> = {
                                                    'Batting': [],
                                                    'Pitching': [],
                                                    'Defense': [],
                                                    'Running': []
                                                };

                                                Object.entries(playerWeights).forEach(([attribute, weight]) => {
                                                    const attrType = attrTypes[attribute] || 'Other';
                                                    if (groupedAttributes[attrType]) {
                                                        groupedAttributes[attrType].push([attribute, weight]);
                                                    }
                                                });

                                                return Object.entries(groupedAttributes).map(([category, attributes]) => {
                                                    if (attributes.length === 0) return null;

                                                    return (
                                                        <div key={category} className="border border-theme-accent rounded p-2">
                                                            <h4 className="text-sm font-semibold mb-2 text-center">{category}</h4>
                                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                                {attributes.map(([attribute, weight]) => (
                                                                    <div key={attribute} className="flex items-center justify-between bg-theme-secondary rounded px-1 py-0.5">
                                                                        <Tooltip content={statDefinitions[attribute] || attribute} className="z-50">
                                                                            <span className="text-xs truncate flex-1 cursor-help">{attribute}:</span>
                                                                        </Tooltip>
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            min="0"
                                                                            max="5"
                                                                            value={weight.toFixed(1)}
                                                                            onChange={(e) => updateCustomWeight(`${player.first_name} ${player.last_name}`, attribute, parseFloat(e.target.value) || 0)}
                                                                            className="w-12 px-1 ml-1 bg-theme-primary rounded text-xs text-center"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }).filter(Boolean);
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="">
                    <h2 className="text-xl font-bold mb-2">Optimization</h2>
                    <select className="bg-theme-primary text-theme-text px-2 py-1 rounded mb-2" value={optimizeSetting} onChange={(e) => setOptimizeSetting(e.target.value as 'strength' | 'weakness' | 'neutral')}>
                        <option value="strength">Play to Strengths</option>
                        <option value="weakness">Play to Weaknesses</option>
                        <option value="neutral">Neutral</option>
                    </select>
                    <br></br>
                    <Tooltip content="For newer teams that don't have much fielding and baserunning scouted yet." >
                        <label className="flex items-center mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={ignoreBaserunningAndFielding}
                                onChange={toggleIgnoreBaserunningAndFielding}
                                className="mr-2"
                            />
                            Ignore Baserunning & Fielding
                        </label>
                    </Tooltip>
                    <label className="flex items-center mb-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useCustomWeights}
                            onChange={toggleUseCustomWeights}
                            className="mr-2"
                        />
                        Use Custom Weight Matrix
                    </label>
                    {useCustomWeights && (
                        <Tooltip content="This applies some basic weights based on position. This will overwrite any existing weights!" >
                            <label className="flex items-center mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={usePositionalWeights}
                                    onChange={toggleUsePositionalWeights}
                                    className="mr-2"
                                />
                                Use Positional Weights for Matrix Initialization
                            </label>
                        </Tooltip>
                    )}
                    <br></br>
                    <button onClick={handleOptimize} disabled={!players || !statPlayers} className="bg-theme-secondary hover:opacity-80 disabled:bg-gray-500 px-4 py-2 rounded">
                        Optimize Equipment
                    </button>

                    {optimizedLineup && (
                        <div className="mt-6">
                            <h2 className="text-xl font-bold mb-2">Optimized Lineup</h2>
                            <div className="p-3 rounded bg-theme-secondary border border-theme-accent mb-4 text-center">
                                <p>Original Team Score: <span className="font-bold">{optimizedLineup.originalScore.toFixed(2)}</span></p>
                                <p>Optimized Team Score: <span className="font-bold">{optimizedLineup.newScore.toFixed(2)}</span></p>
                                <p>Improvement: <span className="font-bold">+{(optimizedLineup.newScore - optimizedLineup.originalScore).toFixed(2)}</span></p>
                            </div>

                            <div className="space-y-4">
                                {optimizedLineup.lineup.map((player) => {
                                    const playerName = `${player.first_name} ${player.last_name}`;
                                    const customWeights = useCustomWeights && customPlayerWeights[playerName] ? customPlayerWeights[playerName] : {};
                                    const playerWeights = getStatWeights(player, optimizeSetting, ignoreBaserunningAndFielding, customWeights);
                                    const playerTalk: Record<string, number> = reducePlayerTalk(player);

                                    const playerTotalScore = playerWeights ? Object.values(player.equipment).reduce((acc, equip) => {
                                        return acc + (equip ? scoreEquipment(equip, playerTalk, playerWeights) : 0)
                                    }, 0) : 0;
                                    return (
                                        <div key={player.id} className="bg-theme-primary py-2 px-4 rounded-xl mt-1 h-full">
                                            <div className="text-xl mb-2 text-center font-bold mt-2">{playerName}</div>
                                            <div className="flex justify-center flex-wrap gap-4 my-4">
                                                {(['head', 'body', 'hands', 'feet', 'accessory'] as EquipmentSlot[]).map((slot) => {
                                                    const optimizedItem = player.equipment[slot];
                                                    const itemScore = (optimizedItem && playerWeights) ? scoreEquipment(optimizedItem, playerTalk, playerWeights) : 0;
                                                    return (
                                                        <div key={`${player.id}-${slot}-opt`} className="flex flex-col items-center w-20">
                                                            <EquipmentTooltip
                                                                equipment={optimizedItem}
                                                                name={capitalize(slot)}
                                                                isActive={activeOptimizedTooltip === `${player.id}-${slot}`}
                                                                onToggle={() => toggleOptimized(`${player.id}-${slot}`)}
                                                                appendName={false}
                                                            />
                                                            <div className="mt-1 text-sm">
                                                                {itemScore.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-center font-bold">
                                                Total: {playerTotalScore.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
