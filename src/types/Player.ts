import { FeedMessage } from "./FeedMessage";
import { DerivedPlayerStats, MapAPIPlayerStats, PlayerStats } from "./PlayerStats";
import { attrTypes } from "../components/team/Constants";

export const EquipmentEffectTypes = {
    FLATBONUS: "FlatBonus",
    MULTIPLIER: "Multiplier",
} as const;


export type EquipmentEffect = {
    attribute: string;
    tier?: number;
    type: string;
    value: number;
}

export type BaseAttributeBonus = {
    amount: number;
    attribute: string;
    source: string;
}

export type PendingLevelUp = {
    earned_at: string;
    id: string;
    level: number;
}

export type Boon = {
    description: string,
    emoji: string,
    name: string,
}

const boons: Record<string, Boon> = {
    "No Boon": {
        emoji: "",
        name: "",
        description: "",
    },
    "Accountant": {
        emoji: "📒",
        name: "Accountant",
        description: "This Player keeps a balanced ledger. +50% Accuracy, -50% Persuasion.",
    },
    "Afterburner": {
        emoji: "🚀",
        name: "Afterburner",
        description: "This Player is ignited. +50% Velocity, -50% Stuff.",
    },
    "Air Elemental": {
        emoji: "💨",
        name: "Air Elemental",
        description: "This Player is the air itself. +50% Aiming, -50% Contact.",
    },
    "Ambassador": {
        emoji: "🎖️",
        name: "Ambassador",
        description: "This Player carries the banner with grace. +50% Persuasion, -50% Guts.",
    },
    "Amphibian": {
        emoji: "🐸",
        name: "Amphibian",
        description: "This Player adapts to land and sea. +50% Performance, -50% Aiming.",
    },
    "Analyst": {
        emoji: "📊",
        name: "Analyst",
        description: "This Player knows the trends. +50% Wisdom, -50% Selflessness.",
    },
    "Anchor": {
        emoji: "⚓",
        name: "Anchor",
        description: "This Player is stuck in place. +50% Defiance, -50% Accuracy.",
    },
    "Angelic": {
        emoji: "👼",
        name: "Angelic",
        description: "This Player is blessed by the heavens. +50% Control, -50% Presence.",
    },
    "Arachnid": {
        emoji: "🕷️",
        name: "Arachnid",
        description: "This Player's has eight legs. +50% Intimidation, -50% Vision.",
    },
    "Archer's Mark": {
        emoji: "🏹",
        name: "Archer's Mark",
        description: "This Player becomes a sharpshooter. +50% Aiming, -50% Discipline.",
    },
    "Battery": {
        emoji: "🔋",
        name: "Battery",
        description: "This Player runs forever. +50% Stamina, -50% Rotation.",
    },
    "Beacon": {
        emoji: "🕯️",
        name: "Beacon",
        description: "This Player shines steady leadership. +50% Presence, -50% Control.",
    },
    "Bulwark": {
        emoji: "🛡️",
        name: "Bulwark",
        description: "This Player raises their shield. +50% Determination, -50% Selflessness.",
    },
    "Calculated": {
        emoji: "🧮",
        name: "Calculated",
        description: "This Player refines their logic. +50% Discipline, -50% Cunning.",
    },
    "Caped": {
        emoji: "🪶",
        name: "Caped",
        description: "This Player flies around with their cape. +50% Lift, -50% Vision.",
    },
    "Charger": {
        emoji: "🦏",
        name: "Charger",
        description: "This Player charges ahead. +50% Speed, -50% Insight.",
    },
    "Clean": {
        emoji: "🧹",
        name: "Clean",
        description: "This Player stays completely clean. +50% Discipline, -50% Determination.",
    },
    "Clockwork": {
        emoji: "🕰️",
        name: "Clockwork",
        description: "This Player pitches on perfect time. +50% Control, -50% Stamina.",
    },
    "Confused": {
        emoji: "🤷",
        name: "Confused",
        description: "This Player is a little mixed up. +50% Deception, -50% Accuracy.",
    },
    "Courier": {
        emoji: "🕊️",
        name: "Courier",
        description: "This Player carries the mail. +50% Persuasion, -50% Stuff.",
    },
    "Cyclist": {
        emoji: "🚲",
        name: "Cyclist",
        description: "This Player is riding a bike. +50% Velocity, -50% Deception.",
    },
    "Cyclone": {
        emoji: "🌪️",
        name: "Cyclone",
        description: "This Player is a rolling storm. +50% Rotation, -50% Presence.",
    },
    "Deadeye": {
        emoji: "🔭",
        name: "Deadeye",
        description: "This Player never loses the mark. +50% Aiming, -50% Determination.",
    },
    "Demonic": {
        emoji: "😈",
        name: "Demonic",
        description: "This Player is possessed by infernal power. +50% Defiance, -50% Control.",
    },
    "Director": {
        emoji: "🎥",
        name: "Director",
        description: "This Player is on set. +50% Control, -50% Accuracy.",
    },
    "Disguised": {
        emoji: "🌳",
        name: "Disguised",
        description: "This Player's is disguising as a tree. +50% Deception, -50% Velocity.",
    },
    "Draconic": {
        emoji: "🐲",
        name: "Draconic",
        description: "This Player channels draconic might. +50% Muscle, -50% Aiming.",
    },
    "Eagle-eye": {
        emoji: "🦅",
        name: "Eagle-eye",
        description: "This Player locks onto the target. +50% Aiming, -50% Cunning.",
    },
    "Earth Elemental": {
        emoji: "⛰️",
        name: "Earth Elemental",
        description: "This Player stands like stone. +50% Determination, -50% Stealth.",
    },
    "Elvish": {
        emoji: "🧝",
        name: "Elvish",
        description: "This Player has pointy ears. +50% Intuition, -50% Persuasion.",
    },
    "Excavator": {
        emoji: "⛏️",
        name: "Excavator",
        description: "This Player is digging. +50% Greed, -50% Muscle.",
    },
    "Fae": {
        emoji: "🧚",
        name: "Fae",
        description: "This Player is touched by the Fae. +50% Cunning, -50% Discipline.",
    },
    "Feral Sense": {
        emoji: "🐺",
        name: "Feral Sense",
        description: "This Player trusts their instincts. +50% Intuition, -50% Stamina.",
    },
    "Fire Elemental": {
        emoji: "🔥",
        name: "Fire Elemental",
        description: "This Player burns with elemental fire. +50% Lift, -50% Selflessness.",
    },
    "Gambit": {
        emoji: "♟️",
        name: "Gambit",
        description: "This Player plays the long con. +50% Deception, -50% Rotation.",
    },
    "Geometry Expert": {
        emoji: "📐",
        name: "Geometry Expert",
        description: "This Player has mastered geometry. +50% Rotation, -50% Stamina.",
    },
    "Giant": {
        emoji: "🗿",
        name: "Giant",
        description: "This Player is gigantic. +50% Intimidation, -50% Insight.",
    },
    "Gorilla": {
        emoji: "🦍",
        name: "Gorilla",
        description: "This Player wins with brute force. +50% Muscle, -50% Cunning.",
    },
    "Granite": {
        emoji: "🏔️",
        name: "Granite",
        description: "This Player is solid. +50% Muscle, -50% Determination.",
    },
    "Grounded": {
        emoji: "🌱",
        name: "Grounded",
        description: "This Player stays planted in the ground. +50% Contact, -50% Lift.",
    },
    "Guardian": {
        emoji: "🐑",
        name: "Guardian",
        description: "This Player stands guard. +50% Selflessness, -50% Intimidation.",
    },
    "Hardy": {
        emoji: "🐪",
        name: "Hardy",
        description: "This Player is hardy. +50% Stamina, -50% Velocity.",
    },
    "Headliner": {
        emoji: "🎤",
        name: "Headliner",
        description: "This Player owns the stage. +50% Presence, -50% Velocity.",
    },
    "Hextouch": {
        emoji: "🪄",
        name: "Hextouch",
        description: "This Player's pitches are cursed. +50% Stuff, -50% Stamina.",
    },
    "Holey": {
        emoji: "🕳️",
        name: "Holey",
        description: "This Player is full of holes. +50% Stealth, -50% Greed.",
    },
    "Horizon": {
        emoji: "🌅",
        name: "Horizon",
        description: "This Player can see beyond the horizon. +50% Vision, -50% Wisdom.",
    },
    "Ill": {
        emoji: "🤢",
        name: "Ill",
        description: "This Player is not feeling well. +50% Guts, -50% Deception.",
    },
    "Insectoid": {
        emoji: "🐞",
        name: "Insectoid",
        description: "This Player takes on an insect form. +50% Cunning, -50% Determination.",
    },
    "Ironclad": {
        emoji: "⚙️",
        name: "Ironclad",
        description: "This Player grinds on without pause. +50% Determination, -50% Greed.",
    },
    "Kind": {
        emoji: "💖",
        name: "Kind",
        description: "This Player lifts everyone around them. +50% Selflessness, -50% Discipline.",
    },
    "Kite": {
        emoji: "🪁",
        name: "Kite",
        description: "This Player is attached to a kite. +50% Lift, -50% Stealth.",
    },
    "Leaf": {
        emoji: "🍃",
        name: "Leaf",
        description: "This Player is a leaf on the wind. +50% Speed, -50% Intimidation.",
    },
    "Lionheart": {
        emoji: "🦁",
        name: "Lionheart",
        description: "This Player roars at pressure. +50% Guts, -50% Accuracy.",
    },
    "Loyal": {
        emoji: "🐕",
        name: "Loyal",
        description: "This Player's loyalty shines. +50% Selflessness, -50% Insight.",
    },
    "Magnetic": {
        emoji: "🧲",
        name: "Magnetic",
        description: "This Player attracts things to them. +50% Greed, -50% Performance.",
    },
    "Majestic": {
        emoji: "🦬",
        name: "Majestic",
        description: "This Player's majesty is undeniable. +50% Presence, -50% Accuracy.",
    },
    "Marathoner": {
        emoji: "🏃",
        name: "Marathoner",
        description: "This Player really likes running. +50% Speed, -50% Lift.",
    },
    "Mer": {
        emoji: "🧜",
        name: "Mer",
        description: "This Player embraces the tides. +50% Wisdom, -50% Stealth.",
    },
    "Meteor": {
        emoji: "☄️",
        name: "Meteor",
        description: "This Player is a shooting star. +50% Velocity, -50% Accuracy.",
    },
    "Metronome": {
        emoji: "🎼",
        name: "Metronome",
        description: "This Player keeps the rhythm. +50% Discipline, -50% Contact.",
    },
    "Miasma": {
        emoji: "☠️",
        name: "Miasma",
        description: "This Player leaves a toxic wake. +50% Stuff, -50% Presence.",
    },
    "Mischievous": {
        emoji: "🐒",
        name: "Mischievous",
        description: "This Player is monkeying around. +50% Performance, -50% Stealth.",
    },
    "Navigator": {
        emoji: "⛵",
        name: "Navigator",
        description: "This Player charts the seas. +50% Control, -50% Rotation.",
    },
    "Needle": {
        emoji: "🪡",
        name: "Needle",
        description: "This Player can thread the needle. +50% Stealth, -50% Aiming.",
    },
    "Night Owl": {
        emoji: "🌙",
        name: "Night Owl",
        description: "This Player thrives in darkness. +50% Stealth, -50% Speed.",
    },
    "Observer": {
        emoji: "🦉",
        name: "Observer",
        description: "This Player watches every detail. +50% Insight, -50% Muscle.",
    },
    "Ogre": {
        emoji: "👹",
        name: "Ogre",
        description: "This Player looms large. +50% Intimidation, -50% Wisdom.",
    },
    "One With All": {
        emoji: "⚾",
        name: "One With All",
        description: "This Player trains with the basics. +50% Contact, -50% Muscle.",
    },
    "Orator": {
        emoji: "💬",
        name: "Orator",
        description: "This Player talks a lot. +50% Persuasion, -50% Velocity.",
    },
    "Peacebroker": {
        emoji: "🤝",
        name: "Peacebroker",
        description: "This Player smooths over every dispute. +50% Persuasion, -50% Defiance.",
    },
    "Pinpoint": {
        emoji: "📌",
        name: "Pinpoint",
        description: "This Player has pinpoint precision. +50% Accuracy, -50% Velocity.",
    },
    "Playful": {
        emoji: "🐠",
        name: "Playful",
        description: "This Player is very playful. +50% Performance, -50% Muscle.",
    },
    "Psychic": {
        emoji: "🔮",
        name: "Psychic",
        description: "This Player glimpses the future. +50% Intuition, -50% Rotation.",
    },
    "Quarterback": {
        emoji: "🏈",
        name: "Quarterback",
        description: "This Player is a quarterback. +50% Accuracy, -50% Control.",
    },
    "ROBO": {
        emoji: "🤖",
        name: "ROBO",
        description: "This Player has assumed a ROBO-form. +50% Accuracy, -50% Deception.",
    },
    "Sage": {
        emoji: "🧙",
        name: "Sage",
        description: "This Player always offers good advice. +50% Wisdom, -50% Vision.",
    },
    "Satellite": {
        emoji: "🛰️",
        name: "Satellite",
        description: "This Player can see the ball from orbit. +50% Vision, -50% Muscle.",
    },
    "Scooter": {
        emoji: "🛴",
        name: "Scooter",
        description: "This Player hops on a scooter. +50% Speed, -50% Discipline.",
    },
    "Second Wind": {
        emoji: "🌬️",
        name: "Second Wind",
        description: "This Player breathes in extra innings. +50% Stamina, -50% Accuracy.",
    },
    "Seer": {
        emoji: "👁️",
        name: "Seer",
        description: "This Player reads the room at a glance. +50% Intuition, -50% Presence.",
    },
    "Shiny": {
        emoji: "🌟",
        name: "Shiny",
        description: "This Player shines brightly. +50% Vision, -50% Performance.",
    },
    "Shopper": {
        emoji: "🛒",
        name: "Shopper",
        description: "This Player shops til' they drop. +50% Rotation, -50% Persuasion.",
    },
    "Sneaky": {
        emoji: "🦊",
        name: "Sneaky",
        description: "This Player moves unseen. +50% Cunning, -50% Intimidation.",
    },
    "Snowperson": {
        emoji: "☃️",
        name: "Snowperson",
        description: "This Player waits patiently. +50% Discipline, -50% Aiming.",
    },
    "Softballer": {
        emoji: "🥎",
        name: "Softballer",
        description: "This Player pitches with a softball. +50% Stuff, -50% Rotation.",
    },
    "Soul in the Machine": {
        emoji: "🤖",
        name: "Soul in the Machine",
        description: "This Player has assumed a ROBO-form. +50% Accuracy, -50% Deception.",
    },
    "Spectral": {
        emoji: "👻",
        name: "Spectral",
        description: "This Player is mostly transparent. +50% Stealth, -50% Contact.",
    },
    "Spotlight": {
        emoji: "✨",
        name: "Spotlight",
        description: "This Player craves attention. +50% Presence, -50% Intuition.",
    },
    "Stargazer": {
        emoji: "🌠",
        name: "Stargazer",
        description: "This Player likes looking at the stars. +50% Insight, -50% Discipline.",
    },
    "Stoneskin": {
        emoji: "🪨",
        name: "Stoneskin",
        description: "This Player is made of stone. +50% Guts, -50% Control.",
    },
    "Stonewall": {
        emoji: "🧱",
        name: "Stonewall",
        description: "This Player refuses to budge. +50% Defiance, -50% Intuition.",
    },
    "Stormrider": {
        emoji: "⛈️",
        name: "Stormrider",
        description: "This Player rides the storm. +50% Velocity, -50% Control.",
    },
    "Striker": {
        emoji: "⚽",
        name: "Striker",
        description: "This Player is good at soccer. +50% Insight, -50% Lift.",
    },
    "Sweet Tooth": {
        emoji: "🍬",
        name: "Sweet Tooth",
        description: "This Player needs more candy. +50% Contact, -50% Aiming.",
    },
    "Techie": {
        emoji: "🖥️",
        name: "Techie",
        description: "This Player is knowledgeable about tech. +50% Insight, -50% Intimidation.",
    },
    "Tenacious Badger": {
        emoji: "🦡",
        name: "Tenacious Badger",
        description: "This Player digs in. +50% Guts, -50% Intuition.",
    },
    "The Light": {
        emoji: "🚦",
        name: "The Light",
        description: "This Player sees the light. +50% Vision, -50% Speed.",
    },
    "Thief": {
        emoji: "🦝",
        name: "Thief",
        description: "This Player likes other people's stuff. +50% Greed, -50% Wisdom.",
    },
    "Thoroughbred": {
        emoji: "🐎",
        name: "Thoroughbred",
        description: "This Player is purebred speed. +50% Performance, -50% Cunning.",
    },
    "Tireless": {
        emoji: "🐜",
        name: "Tireless",
        description: "This Player never tires. +50% Stamina, -50% Guts.",
    },
    "Titan": {
        emoji: "🐘",
        name: "Titan",
        description: "This Player moves like a colossus. +50% Muscle, -50% Contact.",
    },
    "Treasure Map": {
        emoji: "🗺️",
        name: "Treasure Map",
        description: "This Player has a map. +50% Greed, -50% Vision.",
    },
    "Tusked": {
        emoji: "🐗",
        name: "Tusked",
        description: "This Player tusks are on display. +50% Intimidation, -50% Performance.",
    },
    "UFO": {
        emoji: "🛸",
        name: "UFO",
        description: "This Player takes flight. +50% Lift, -50% Greed.",
    },
    "Undead": {
        emoji: "🧟",
        name: "Undead",
        description: "This Player rises as Undead. +50% Determination, -50% Speed.",
    },
    "Vampiric": {
        emoji: "🧛",
        name: "Vampiric",
        description: "This Player has a taste for blood. +50% Cunning, -50% Vision.",
    },
    "Venomous": {
        emoji: "🐍",
        name: "Venomous",
        description: "This Player's touch is venom. +50% Stuff, -50% Persuasion.",
    },
    "Water Elemental": {
        emoji: "💧",
        name: "Water Elemental",
        description: "This Player flows like water. +50% Contact, -50% Intimidation.",
    },
    "Weaver": {
        emoji: "🧵",
        name: "Weaver",
        description: "This Player weaves magic into each pitch. +50% Deception, -50% Stuff.",
    },
    "Wheel": {
        emoji: "🎡",
        name: "Wheel",
        description: "This Player likes to roll around. +50% Rotation, -50% Stuff.",
    },
    "Wildcard": {
        emoji: "🃏",
        name: "Wildcard",
        description: "This Player never plays by the book. +50% Defiance, -50% Deception.",
    },
    "Wingmate": {
        emoji: "🛩️",
        name: "Wingmate",
        description: "This Player boosts others into the sky. +50% Selflessness, -50% Lift.",
    },
    "Wise": {
        emoji: "🐢",
        name: "Wise",
        description: "This Player grows wise. +50% Wisdom, -50% Greed.",
    },
}

export function getBoon(name: string): Boon | undefined {
    return boons[name] ?? undefined
}

export type Equipment = {
    cost?: number;
    durability?: number;
    effects: EquipmentEffect[];
    emoji: string;
    name: string;
    prefixPositionType?: string;
    rareName?: string;
    prefix?: string[];
    rarity: string;
    slot?: string;
    specialized?: boolean;
    suffix?: string[];
}

export type AttributeStar = {
    attribute: string;
    base_display: string;
    base_regular: number;
    base_shiny: number;
    base_stars: number;
    base_total: number;
    display: string;
    regular: number;
    shiny: number;
    stars: number;
    total: number;
}

export type TalkEntry = {
    attributes?: Record<string, number>;
    day: string | number;
    quote: string;
    season: number;
    stars: Record<string, AttributeStar>;
}

export type AugmentHistoryEntry = {
    amount: number;
    attribute: string;
    augment_name: string;
    timestamp: string;
}

export type FoodBuff = {
    applied_at: string;
    attribute: string;
    emoji: string;
    instance_id: string;
    name: string;
}

export type Player = {
    attribute_stars?: Record<string, Record<string, AttributeStar>>;
    augment_history?: AugmentHistoryEntry[];
    augments?: number;
    base_attribute_bonuses?: BaseAttributeBonus[];
    bats: string;
    birthday: string | number;
    birth_season: number;
    dislikes: string;
    greater_boon?: Boon;
    greater_boons: Boon[];
    greater_durability: number;
    equipment: {
        accessory?: Equipment;
        body?: Equipment;
        feet?: Equipment;
        hands?: Equipment;
        head?: Equipment;
    }
    feed?: FeedMessage[];
    first_name: string;
    food_buffs?: FoodBuff[];
    home: string;
    last_name: string;
    lesser_boon?: Boon;
    lesser_boons?: Boon[];
    lesser_durability: number;
    level: number;
    likes: string;
    modifications: Boon[];
    number: number;
    pending_level_ups?: any[];
    pitch_category_bonuses?: Record<string, number>;
    pitch_selection: Record<string, number>;
    pitch_type_bonuses?: Record<string, number>;
    position: string;
    position_type: string;
    scheduled_level_ups?: any[];
    season_stats: Record<string, Record<string, string>>;
    stats: Record<string, DerivedPlayerStats>;
    suffix?: string | null;
    talk?: {
        [category: string]: TalkEntry | null;
    }
    talk2: Record<string, Record<string, number>>,
    team_id: string;
    throws: string;
    xp?: number;
    id: string;
}

function mapEffect(effect: any): EquipmentEffect {
    return {
        attribute: effect.Attribute,
        tier: effect.Tier,
        type: effect.Type,
        value: effect.Value,
    };
}

function mapEquipment(raw: any): Equipment | undefined {
    if (!raw) return;

    return {
        cost: raw.Cost,
        durability: raw.Durability,
        effects: Array.isArray(raw.Effects) ? raw.Effects.map(mapEffect) : [],
        emoji: raw.Emoji,
        name: raw.Name,
        prefixPositionType: raw.PrefixPositionType,
        rareName: raw.RareName,
        prefix: raw.Prefixes,
        rarity: raw.Rarity,
        slot: raw.Slot,
        specialized: raw.Specialized,
        suffix: raw.Suffixes,
    };
}

// TODO: handle multiple boons - need to update playerpageheader with this
export function mapBoon(raw: any): Boon | undefined {
    if (!raw) return;

    // Handle array case (API sometimes returns boons as arrays)
    const boonData = Array.isArray(raw) ? raw[0] : raw;
    if (!boonData) return;

    return {
        description: boonData.Description,
        emoji: boonData.Emoji,
        name: boonData.Name,
    }
}

export const pitchAbbrToName: Record<string, string> = {
    'FF': 'Fastball',
    'SI': 'Sinker',
    'FC': 'Cutter',
    'SL': 'Slider',
    'CU': 'Curveball',
    'KC': 'Knuckle Curve',
    'CH': 'Changeup',
    'FS': 'Splitter',
    'ST': 'Sweeper',
}

// fast, offspeed, breaking
export const pitchAbbrToCategory: Record<string, string> = {
    'FF': 'Fast',
    'SI': 'Fast',
    'FC': 'Fast',
    'SL': 'Breaking',
    'CU': 'Breaking',
    'KC': 'Breaking',
    'CH': 'Offspeed',
    'FS': 'Offspeed',
    'ST': 'Breaking',
}

export function mapPitchTypeAbbrToName(abbr: string): string {
    return pitchAbbrToName[abbr] || abbr;
}

function mapPitchSelection(raw: any): Record<string, number> {
    if (!raw || !raw.PitchSelection || !raw.PitchTypes) {
        return {};
    }

    const result: Record<string, number> = {};
    for (let i = 0; i < raw.PitchTypes.length; i++) {
        result[pitchAbbrToName[raw.PitchTypes[i]]] = raw.PitchSelection[i];
    }

    return result;
}

function mapAugmentHistory(raw: any): AugmentHistoryEntry | undefined {
    if (!raw) return;

    return {
        amount: raw.amount,
        attribute: raw.attribute,
        augment_name: raw.augment_name,
        timestamp: raw.timestamp,
    };
}

function mapFoodBuff(raw: any): FoodBuff | undefined {
    if (!raw) return;

    return {
        applied_at: raw.applied_at,
        attribute: raw.attribute,
        emoji: raw.emoji,
        instance_id: raw.instance_id,
        name: raw.name,
    };
}



function mapAttributeBonusesToTalk(raw: BaseAttributeBonus[]): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};
    for (const bonus of raw) {
        const category = attrTypes[bonus.attribute];
        if (!category) continue;
        if (!result[category]) result[category] = {};
        result[category][bonus.attribute] = (result[category][bonus.attribute] ?? 0) + bonus.amount;
    }
    return result;
}

export function MapAPIPlayerResponse(data: any): Player {
    return {
        attribute_stars: data.AttributeStars,
        augment_history: data.AugmentHistory?.map((x: any) => mapAugmentHistory(x)).filter((x: any) => x !== undefined) ?? [],
        augments: data.Augments,
        base_attribute_bonuses: data.BaseAttributeBonuses ?? [],
        bats: data.Bats,
        birthday: data.Birthday,
        birth_season: data.Birthseason,
        dislikes: data.Dislikes,
        greater_boons: Array.isArray(data.GreaterBoons) ? data.GreaterBoons.map((x: any) => mapBoon(x)).filter(Boolean) : [],
        greater_boon: Array.isArray(data.GreaterBoons) && data.GreaterBoons.length > 0 ? mapBoon(data.GreaterBoons[0]) : undefined,
        greater_durability: data.GreaterDurability,
        equipment: {
            accessory: mapEquipment(data.Equipment?.Accessory),
            body: mapEquipment(data.Equipment?.Body),
            feet: mapEquipment(data.Equipment?.Feet),
            hands: mapEquipment(data.Equipment?.Hands),
            head: mapEquipment(data.Equipment?.Head),
        },
        feed: data.Feed,
        first_name: data.FirstName,
        food_buffs: data.FoodBuffs?.map((x: any) => mapFoodBuff(x)).filter((x: any) => x !== undefined) ?? [],
        home: data.Home,
        last_name: data.LastName,
        lesser_boon: Array.isArray(data.LesserBoons) && data.LesserBoons.length > 0 ? mapBoon(data.LesserBoons[0]) : undefined,
        lesser_boons: Array.isArray(data.LesserBoons) ? data.LesserBoons.map((x: any) => mapBoon(x)).filter(Boolean) : [],
        lesser_durability: data.LesserDurability,
        level: data.Level,
        likes: data.Likes,
        modifications: data.Modifications?.map((x: any) => mapBoon(x)) ?? [],
        number: data.Number,
        pending_level_ups: data.PendingLevelUps,
        pitch_category_bonuses: data.PitchCategoryBonuses,
        pitch_selection: mapPitchSelection(data),
        pitch_type_bonuses: data.PitchTypeBonuses,
        position: data.Position,
        position_type: data.PositionType,
        scheduled_level_ups: data.ScheduledLevelUps,
        season_stats: data.SeasonStats,
        stats: Object.fromEntries(Object.entries(data.Stats ?? {}).map(([season, stats]) => [season, MapAPIPlayerStats(stats as Partial<PlayerStats>)])),
        suffix: data.Suffix,
        talk2: mapAttributeBonusesToTalk(data.BaseAttributeBonuses ?? []),
        talk: data.Talk ? {
            batting: data.Talk.Batting ?? null,
            pitching: data.Talk.Pitching ?? null,
            defense: data.Talk.Defense ?? null,
            base_running: data.Talk.Baserunning ?? null,
        } : undefined,
        team_id: data.TeamID,
        throws: data.Throws,
        xp: data.XP,
        id: data._id,
    };
}
