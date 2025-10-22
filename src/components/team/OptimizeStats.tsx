'use client'
import Loading from "@/components/Loading";
import { useCallback, useEffect, useState } from "react";
import { MapAPITeamResponse, PlaceholderTeam, Team, TeamPlayer } from "@/types/Team";
import { Equipment, EquipmentEffect, EquipmentEffectTypes, MapAPIPlayerResponse, Player } from "@/types/Player";
import { getPlayerStatRows } from "./CSVGenerator";
import { EquipmentTooltip } from "../player/PlayerPageHeader";
import { capitalize } from "@/helpers/StringHelper";
import { attrTypes, positionsList, statDefinitions } from "./Constants";
import { PositionalWeights } from "./PositionalWeights";
import { Tooltip } from "../ui/Tooltip";

type EquipmentSlot = 'head' | 'body' | 'hands' | 'feet' | 'accessory';
type OptimizationMode = 'strength' | 'weakness' | 'neutral';

const CUSTOM_PLAYER_WEIGHTS_KEY = 'customPlayerWeights';
const PLAYER_OPTIMIZE_SETTINGS_KEY = 'playerOptimizeSettings';

// Helper functions for localStorage
function saveCustomPlayerWeightsToStorage(weights: Record<string, Record<string, number>>) {
    try {
        localStorage.setItem(CUSTOM_PLAYER_WEIGHTS_KEY, JSON.stringify(weights));
    } catch (error) {
        console.error('Failed to save custom player weights to localStorage:', error);
    }
}

function loadCustomPlayerWeightsFromStorage(): Record<string, Record<string, number>> {
    try {
        const stored = localStorage.getItem(CUSTOM_PLAYER_WEIGHTS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to load custom player weights from localStorage:', error);
        return {};
    }
}

function savePlayerOptimizeSettingsToStorage(settings: Record<string, OptimizationMode>) {
    try {
        localStorage.setItem(PLAYER_OPTIMIZE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save player optimize settings to localStorage:', error);
    }
}

function loadPlayerOptimizeSettingsFromStorage(): Record<string, OptimizationMode> {
    try {
        const stored = localStorage.getItem(PLAYER_OPTIMIZE_SETTINGS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to load player optimize settings from localStorage:', error);
        return {};
    }
}

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
function getStatWeights(player: Player, mode: OptimizationMode, ignoreBaserunningAndFielding: boolean, positionalWeights: Record<string, number>): Record<string, number> {
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
// this score is based off of a player's base_total stats, not stars
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
    const [scored, setScored] = useState<{ name: string; scores: any }[]>([]);
    const [equippedEquipment, setEquippedEquipment] = useState<Equipment[]>([]);
    const [parsedEquipment, setParsedEquipment] = useState<Equipment[]>([]);
    const [entryText, setEntryText] = useState<string>('');
    const [optimizedLineup, setOptimizedLineup] = useState<{ lineup: Player[], originalScore: number, newScore: number } | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [activeOptimizedTooltip, setActiveOptimizedTooltip] = useState<string | null>(null);
    const [ignoreBaserunningAndFielding, setIgnoreBaserunningAndFielding] = useState<boolean>(false);
    const [customPlayerWeights, setCustomPlayerWeights] = useState<Record<string, Record<string, number>>>(loadCustomPlayerWeightsFromStorage());
    const [playerOptimizeSettings, setPlayerOptimizeSettings] = useState<Record<string, OptimizationMode>>(loadPlayerOptimizeSettingsFromStorage());
    const [resetOptimizeSetting, setResetOptimizeSetting] = useState<OptimizationMode>('strength');
    const [autoOptimize, setAutoOptimize] = useState<boolean>(false);
    const [collapsedPlayers, setCollapsedPlayers] = useState<Record<string, boolean>>({});

    const toggleIgnoreBaserunningAndFielding = () => {
        setIgnoreBaserunningAndFielding((prev) => !prev);
    };

    const updatePlayerOptimizeSetting = (playerName: string, setting: OptimizationMode) => {
        const updatedSettings = {
            ...playerOptimizeSettings,
            [playerName]: setting
        };
        setPlayerOptimizeSettings(updatedSettings);
        savePlayerOptimizeSettingsToStorage(updatedSettings);
    };

    const getEffectiveOptimizeSetting = (playerName: string): OptimizationMode => {
        if (playerOptimizeSettings[playerName]) {
            return playerOptimizeSettings[playerName];
        }
        return 'strength'; // Default to strength
    };


    const updateCustomWeight = (playerId: string, attribute: string, weight: number) => {
        const updatedWeights = {
            ...customPlayerWeights,
            [playerId]: {
                ...customPlayerWeights[playerId],
                [attribute]: weight
            }
        };
        setCustomPlayerWeights(updatedWeights);
        saveCustomPlayerWeightsToStorage(updatedWeights);
    };

    // Initialize custom weights based on default positional weights
    const initializePlayerWeights = (player: Player) => {
        const playerName = `${player.first_name} ${player.last_name}`;
        if (!customPlayerWeights[playerName]) {
            const defaultWeights: Record<string, number> = {};
            const playerTalk = reducePlayerTalk(player);

            Object.keys(playerTalk).forEach(attribute => {
                if (shouldFilterAttribute(attribute, player)) return;

                defaultWeights[attribute] = getPositionalWeights(PositionalWeights, player.position, attribute);
            });

            const updatedWeights = {
                ...customPlayerWeights,
                [playerName]: defaultWeights
            };
            setCustomPlayerWeights(updatedWeights);
            saveCustomPlayerWeightsToStorage(updatedWeights);
        }
    };

    // Reset all custom weights with flexible weight calculation
    const resetAllWeights = (usePositionalWeights: boolean = false) => {
        if (!players) return;

        const resetWeights: Record<string, Record<string, number>> = {};

        players.forEach(player => {
            const playerName = `${player.first_name} ${player.last_name}`;
            const playerWeights: Record<string, number> = {};
            const playerTalk = reducePlayerTalk(player);

            Object.keys(playerTalk).forEach(attribute => {
                if (shouldFilterAttribute(attribute, player)) return;

                playerWeights[attribute] = usePositionalWeights
                    ? getPositionalWeights(PositionalWeights, player.position, attribute)
                    : 1.0;
            });

            resetWeights[playerName] = playerWeights;
        });

        setCustomPlayerWeights(resetWeights);
        saveCustomPlayerWeightsToStorage(resetWeights);
    };

    const resetAllCustomWeights = () => resetAllWeights(true);
    const resetAllWeightsToNeutral = () => resetAllWeights(false);

    // Helper function to reset individual player weights
    const resetPlayerWeights = (player: Player, usePositionalWeights: boolean) => {
        const playerName = `${player.first_name} ${player.last_name}`;
        const playerTalk = reducePlayerTalk(player);
        const resetWeights: Record<string, number> = {};

        Object.keys(playerTalk).forEach(attribute => {
            if (shouldFilterAttribute(attribute, player)) return;
            resetWeights[attribute] = usePositionalWeights
                ? getPositionalWeights(PositionalWeights, player.position, attribute)
                : 1.0;
        });

        const updatedWeights = {
            ...customPlayerWeights,
            [playerName]: resetWeights
        };
        setCustomPlayerWeights(updatedWeights);
        saveCustomPlayerWeightsToStorage(updatedWeights);
    };

    // Reset individual player weights to positional weights
    const resetPlayerWeightsToPositional = (player: Player) => resetPlayerWeights(player, true);

    // Reset individual player weights to 1.0
    const resetPlayerWeightsToNeutral = (player: Player) => resetPlayerWeights(player, false);

    // Reset all player optimization settings to the selected setting
    const resetAllOptimizeSettings = () => {
        if (!players) return;

        const resetSettings: Record<string, OptimizationMode> = {};

        players.forEach(player => {
            const playerName = `${player.first_name} ${player.last_name}`;
            resetSettings[playerName] = resetOptimizeSetting;
        });

        setPlayerOptimizeSettings(resetSettings);
        savePlayerOptimizeSettingsToStorage(resetSettings);
    };

    const toggle = (label: string) => { setActiveTooltip((prev) => (prev === label ? null : label)); };
    const toggleOptimized = (label: string) => { setActiveOptimizedTooltip((prev) => (prev === label ? null : label)); };
    const togglePlayerCollapse = (playerName: string) => {
        setCollapsedPlayers((prev) => ({
            ...prev,
            [playerName]: !prev[playerName]
        }));
    };

    // hide or show all collapses
    const toggleAllPlayers = () => {
        if (!players) return;

        const anyExpanded = players.some(player => {
            const playerName = `${player.first_name} ${player.last_name}`;
            return !collapsedPlayers[playerName];
        });

        if (anyExpanded) {
            const allCollapsed: Record<string, boolean> = {};
            players.forEach(player => {
                const playerName = `${player.first_name} ${player.last_name}`;
                allCollapsed[playerName] = true;
            });
            setCollapsedPlayers(allCollapsed);
        } else {
            setCollapsedPlayers({});
        }
    };

    async function APICalls() {
        try {
            const teamRes = await fetch(`/nextapi/team/${id}`);
            if (!teamRes.ok) throw new Error('Failed to load team data');
            const team = MapAPITeamResponse(await teamRes.json());
            setTeam(team);

            const playersRes = await fetch(`/nextapi/players?ids=${team.players.map((p: TeamPlayer) => p.player_id).join(',')}`);
            if (!playersRes.ok) throw new Error('Failed to load player data');
            const players = await playersRes.json();
            setPlayers(players.players.map((p: any) => MapAPIPlayerResponse(p)).sort((a: Player, b: Player) => {
                return positionsList.indexOf(a.position) - positionsList.indexOf(b.position);
            }));
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
        if (!players) return;

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
    }, [players]);

    useEffect(() => {
        if (!statPlayers || !players) return;
        setWeights(weights);
        const scored = players.map((p) => {
            const playerName = `${p.first_name} ${p.last_name}`;
            const customWeights = customPlayerWeights[playerName] || {};
            const effectiveOptimizeSetting = getEffectiveOptimizeSetting(playerName);
            const playerWeights = getStatWeights(p, effectiveOptimizeSetting, ignoreBaserunningAndFielding, customWeights);
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
    }, [statPlayers, players, ignoreBaserunningAndFielding, customPlayerWeights, playerOptimizeSettings]);

    const handleOptimize = useCallback(() => {
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
            const customWeights = customPlayerWeights[playerName] || {};
            const effectiveOptimizeSetting = getEffectiveOptimizeSetting(playerName);
            const playerWeights = getStatWeights(player, effectiveOptimizeSetting, ignoreBaserunningAndFielding, customWeights);
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
            const customWeights = customPlayerWeights[playerName] || {};
            const effectiveOptimizeSetting = getEffectiveOptimizeSetting(playerName);
            const playerWeights = getStatWeights(p, effectiveOptimizeSetting, ignoreBaserunningAndFielding, customWeights);
            const playerTalk: Record<string, number> = reducePlayerTalk(p);

            const finalEquipment = newPlayerEquipment[p.id];
            Object.values(finalEquipment).forEach(equip => {
                newTotalScore += scoreEquipment(equip, playerTalk, playerWeights);
            });
            return { ...p, equipment: finalEquipment };
        });

        const originalTotalScore = scored.reduce((total, p) => total + Object.values(p.scores as Record<string, number>).reduce((subTotal: number, s: number) => subTotal + s, 0), 0);

        setOptimizedLineup({ lineup: finalLineup, originalScore: originalTotalScore, newScore: newTotalScore });
    }, [players, statPlayers, equippedEquipment, parsedEquipment, customPlayerWeights, playerOptimizeSettings, ignoreBaserunningAndFielding, scored]);

    // Auto-run optimization
    useEffect(() => {
        if (autoOptimize && players && statPlayers && equippedEquipment.length > 0) {
            handleOptimize();
        }
    }, [autoOptimize, players, statPlayers, equippedEquipment, parsedEquipment, customPlayerWeights, playerOptimizeSettings, ignoreBaserunningAndFielding, handleOptimize]);

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

                    <div className="mt-6 mb-2">
                        <h2 className="text-xl font-bold mb-2">Original Team Scores</h2>
                        <div className="flex gap-2">
                            <Tooltip content="Set all weights to positional weights.">
                                <button onClick={resetAllCustomWeights} disabled={!players} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 px-3 py-1 rounded text-white text-sm">
                                    Reset all to Positional Weights
                                </button>
                            </Tooltip>
                            <Tooltip content="Set all weights to 1.0.">

                                <button onClick={resetAllWeightsToNeutral} disabled={!players} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 px-3 py-1 rounded text-white text-sm">
                                    Reset all to 1.0
                                </button>
                            </Tooltip>

                        </div>
                        <div className="flex gap-2 items-center mt-3">
                            <span className="text-sm font-medium">Reset all optimization settings to:</span>
                            <select
                                value={resetOptimizeSetting}
                                onChange={(e) => setResetOptimizeSetting(e.target.value as OptimizationMode)}
                                className="bg-theme-secondary text-theme-text px-2 py-1 rounded text-sm"
                            >
                                <option value="strength">Play to Strengths</option>
                                <option value="weakness">Play to Weaknesses</option>
                                <option value="neutral">Neutral</option>
                            </select>
                            <button
                                onClick={resetAllOptimizeSettings}
                                disabled={!players}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 px-3 py-1 rounded text-white text-sm"
                            >
                                Reset All
                            </button>
                        </div>
                        <div className="flex gap-2 items-center mt-3">
                            <span className="text-sm font-medium">Custom Weights Visibility:</span>
                            <button
                                onClick={toggleAllPlayers}
                                disabled={!players}
                                className="bg-theme-secondary hover:opacity-80 disabled:bg-gray-500 px-3 py-1 rounded text-white text-sm"
                            >
                                {players && players.some(player => {
                                    const playerName = `${player.first_name} ${player.last_name}`;
                                    return !collapsedPlayers[playerName];
                                }) ? 'Hide All' : 'Show All'}
                            </button>
                        </div>
                    </div>

                </div>

                <div className="">
                    <h2 className="text-xl font-bold mb-2">Optimization</h2>
                    <div className="flex flex-col gap-2">
                        <Tooltip content="For newer teams that don't have much fielding and baserunning scouted yet." >
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ignoreBaserunningAndFielding}
                                    onChange={toggleIgnoreBaserunningAndFielding}
                                    className="mr-2"
                                />
                                Ignore Baserunning & Fielding
                            </label>
                        </Tooltip>
                        <Tooltip content="Automatically re-optimize on weight change." >
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoOptimize}
                                    onChange={(e) => setAutoOptimize(e.target.checked)}
                                    className="mr-2"
                                />
                                Auto-optimize on changes
                            </label>
                        </Tooltip>
                    </div>
                    <br></br>
                    <button onClick={handleOptimize} disabled={!players || !statPlayers} className="bg-theme-secondary hover:opacity-80 disabled:bg-gray-500 px-4 py-2 rounded">
                        Optimize Equipment
                    </button>

                    {optimizedLineup && (
                        <div className="mt-4">
                            <h2 className="text-xl font-bold mb-3">Optimization Results</h2>
                            <div className="bg-gradient-to-br from-theme-secondary to-theme-primary border-2 border-theme-accent rounded-lg p-4 shadow-lg">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-theme-accent/30">
                                        <span className="text-sm opacity-80">Original Team Score:</span>
                                        <span className="text-lg font-bold">{optimizedLineup.originalScore.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-theme-accent/30">
                                        <span className="text-sm opacity-80">Optimized Team Score:</span>
                                        <span className={`text-lg font-bold ${optimizedLineup.newScore >= optimizedLineup.originalScore ? 'text-green-500' : 'text-red-500'}`}>
                                            {optimizedLineup.newScore.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-semibold">Improvement:</span>
                                        <span className={`text-xl font-bold ${(optimizedLineup.newScore - optimizedLineup.originalScore) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {(optimizedLineup.newScore - optimizedLineup.originalScore) >= 0 ? '+' : ''}{(optimizedLineup.newScore - optimizedLineup.originalScore).toFixed(2)}
                                            {` (${((optimizedLineup.newScore - optimizedLineup.originalScore) / optimizedLineup.originalScore * 100).toFixed(2)}%)`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {players?.map((player, _index) => {
                    const playerName = `${player.first_name} ${player.last_name}`;
                    const optimizedPlayer = optimizedLineup?.lineup.find(p => `${p.first_name} ${p.last_name}` === playerName);
                    const customWeights = customPlayerWeights[playerName] || {};
                    const effectiveOptimizeSetting = getEffectiveOptimizeSetting(playerName);
                    const playerWeights = getStatWeights(player, effectiveOptimizeSetting, ignoreBaserunningAndFielding, customWeights);
                    const playerTalk: Record<string, number> = reducePlayerTalk(player);
                    const originalTotal = ((Object.values(scored.find(s => s.name === playerName)?.scores || []) as number[])
                        .reduce((a, b) => a + b, 0)).toFixed(2);
                    const optimizedTotal = Object.values(optimizedPlayer?.equipment || {}).reduce((acc, equip) => {
                        return acc + (equip ? scoreEquipment(equip, playerTalk, playerWeights) : 0)
                    }, 0).toFixed(2)

                    return (

                        <div key={player.id} className="bg-theme-primary py-2 px-4 rounded-xl h-full">
                            <div className="text-xl mb-2 text-center font-bold mt-2">{playerName} {player.position}</div>

                            {optimizedLineup ? (
                                <div className="flex gap-6 justify-center">
                                    {/* Original Equipment */}
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-sm font-semibold mb-2">
                                            Original
                                        </h3>

                                        <div className="flex justify-center flex-wrap gap-4 mb-2">
                                            {(['head', 'body', 'hands', 'feet', 'accessory'] as EquipmentSlot[]).map((slot) => {
                                                const originalEquip = player.equipment[slot];
                                                const optimizedEquip = optimizedPlayer?.equipment[slot];
                                                const originalScore = scored.find(s => s.name === playerName)?.scores[slot] || 0;
                                                const hasChange = optimizedEquip && originalEquip?.rareName !== optimizedEquip?.rareName;

                                                return (
                                                    <div
                                                        key={`${player.id}-${slot}-orig`}
                                                        className={`flex flex-col items-center w-24 ${hasChange ? 'opacity-60' : ''}`}
                                                    >
                                                        <div className="text-[10px] text-center mb-1 font-semibold">
                                                            {capitalize(slot)}
                                                        </div>

                                                        <EquipmentTooltip
                                                            equipment={originalEquip}
                                                            name=""
                                                            isActive={activeTooltip === `${player.id}-${slot}`}
                                                            onToggle={() => toggle(`${player.id}-${slot}`)}
                                                            appendName={false}
                                                        />

                                                        <div className="mt-1 text-sm">
                                                            {originalScore.toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="text-center font-bold">
                                            Total: {originalTotal}
                                        </div>
                                    </div>

                                    {/* Optimized Equipment */}
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-sm font-semibold mb-2 text-green-500">
                                            Optimized
                                        </h3>

                                        <div className="flex justify-center flex-wrap gap-4 mb-2">
                                            {(['head', 'body', 'hands', 'feet', 'accessory'] as EquipmentSlot[]).map((slot) => {
                                                const originalEquip = player.equipment[slot];
                                                const optimizedEquip = optimizedPlayer?.equipment[slot];
                                                const optimizedScore = (optimizedEquip && playerWeights)
                                                    ? scoreEquipment(optimizedEquip, playerTalk, playerWeights)
                                                    : 0;
                                                const hasChange = optimizedEquip && originalEquip?.rareName !== optimizedEquip?.rareName;

                                                return (
                                                    <div
                                                        key={`${player.id}-${slot}-opt`}
                                                        className={`flex flex-col items-center w-20 ${hasChange ? 'ring-2 ring-green-500 rounded' : ''}`}
                                                    >
                                                        <div className="text-[10px] text-center mb-1 font-semibold">
                                                            {capitalize(slot)}
                                                        </div>

                                                        <EquipmentTooltip
                                                            equipment={optimizedEquip}
                                                            name=""
                                                            isActive={activeOptimizedTooltip === `${player.id}-${slot}-opt`}
                                                            onToggle={() => toggleOptimized(`${player.id}-${slot}-opt`)}
                                                            appendName={false}
                                                        />

                                                        <div className="mt-1 text-sm">
                                                            {optimizedScore.toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className={`text-center font-bold ${parseFloat(optimizedTotal) > parseFloat(originalTotal)
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                            }`}>
                                            Total: {optimizedTotal}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-center flex-wrap gap-4 my-4">
                                        {(['head', 'body', 'hands', 'feet', 'accessory'] as EquipmentSlot[]).map((slot) => (
                                            <div
                                                key={`${player.id}-${slot}`}
                                                className="flex flex-col items-center w-20"
                                            >
                                                <EquipmentTooltip
                                                    equipment={player.equipment[slot]}
                                                    name={capitalize(slot)}
                                                    isActive={activeTooltip === `${player.id}-${slot}`}
                                                    onToggle={() => toggle(`${player.id}-${slot}`)}
                                                    appendName={false}
                                                />

                                                <div className="mt-1 text-sm">
                                                    {scored.find(s => s.name === playerName)?.scores[slot].toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center font-bold">
                                        Total: {(
                                            (Object.values(scored.find(s => s.name === playerName)?.scores || []) as number[])
                                                .reduce((a, b) => a + b, 0)
                                        ).toFixed(2)}
                                    </div>
                                </div>
                            )}

                            {/* Custom Weights Section */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold">Custom Weights</h3>
                                    <button
                                        onClick={() => togglePlayerCollapse(playerName)}
                                        className="text-xs bg-theme-secondary hover:opacity-80 px-2 py-1 rounded"
                                    >
                                        {collapsedPlayers[playerName] ? 'Show' : 'Hide'}
                                    </button>
                                </div>

                                {!collapsedPlayers[playerName] && (
                                    <>
                                        {/* Optimization Setting Dropdown */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">
                                                Optimization Setting:
                                            </label>
                                            <select
                                                className="w-full bg-theme-secondary text-theme-text px-2 py-1 rounded text-sm"
                                                value={playerOptimizeSettings[playerName] || 'strength'}
                                                onChange={(e) => updatePlayerOptimizeSetting(
                                                    playerName,
                                                    e.target.value as OptimizationMode
                                                )}
                                            >
                                                <option value="strength">Play to Strengths</option>
                                                <option value="weakness">Play to Weaknesses</option>
                                                <option value="neutral">Neutral</option>
                                            </select>
                                        </div>

                                        {/* Reset Buttons */}
                                        <div className="mb-3 flex gap-2">
                                            <Tooltip content="Reset this player's custom weights to positional weights">
                                                <button
                                                    onClick={() => resetPlayerWeightsToPositional(player)}
                                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                                                >
                                                    Reset to Positional
                                                </button>
                                            </Tooltip>

                                            <Tooltip content="Reset this player's custom weights to 1.0">
                                                <button
                                                    onClick={() => resetPlayerWeightsToNeutral(player)}
                                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                                                >
                                                    Reset to 1.0
                                                </button>
                                            </Tooltip>
                                        </div>

                                        {/* Weight Sliders by Category */}
                                        {(() => {
                                            initializePlayerWeights(player);
                                            const playerWeights = customPlayerWeights[playerName] || {};

                                            // Group attributes by type
                                            const groupedAttributes: Record<string, [string, number][]> = {
                                                'Batting': [],
                                                'Pitching': [],
                                                'Defense': [],
                                                'Running': [],
                                                'Other': []
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
                                                    <div
                                                        key={category}
                                                        className="border border-theme-accent rounded p-2"
                                                    >
                                                        <h4 className="text-sm font-semibold mb-2 text-center">
                                                            {category}
                                                        </h4>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                                                            {attributes.map(([attribute, weight]) => {
                                                                const playerTalk = reducePlayerTalk(player);
                                                                const baseTotalValue = playerTalk[attribute] || 0;

                                                                return (
                                                                    <div
                                                                        key={attribute}
                                                                        className="flex items-center justify-between bg-theme-secondary rounded px-1 py-0.5"
                                                                    >
                                                                        <Tooltip
                                                                            content={statDefinitions[attribute] || attribute}
                                                                            className="z-50"
                                                                        >
                                                                            <span className="text-xs truncate cursor-help">
                                                                                {attribute}: ({(baseTotalValue * 100).toFixed(0)})
                                                                            </span>
                                                                        </Tooltip>

                                                                        <div className="flex items-center gap-1 ml-2">
                                                                            <input
                                                                                type="range"
                                                                                step="0.1"
                                                                                min="0"
                                                                                max="5"
                                                                                value={weight.toFixed(1)}
                                                                                onChange={(e) => updateCustomWeight(
                                                                                    playerName,
                                                                                    attribute,
                                                                                    parseFloat(e.target.value) || 0
                                                                                )}
                                                                                className="w-3/4"
                                                                                title={weight.toFixed(1)}
                                                                            />
                                                                            <span className="text-xs font-medium w-6 text-center">
                                                                                {weight.toFixed(1)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            }).filter(Boolean);
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
