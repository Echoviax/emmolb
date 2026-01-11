import { Boon } from "@/types/Player";

// All lesser boon values are currently type "add-mult"
export const lesserBoonTable: Record<string, Record<string, number>> = {
    "Accountant": {
        "Accuracy": 0.5,
        "Persuasion": -0.5,
    },
    "Afterburner": {
        "Velocity": 0.5,
        "Stuff": -0.5,
    },
    "Air Elemental": {
        "Aiming": 0.5,
        "Contact": -0.5,
    },
    "Ambassador": {
        "Persuasion": 0.5,
        "Guts": -0.5,
    },
    "Amphibian": {
        "Performance": 0.5,
        "Aiming": -0.5,
    },
    "Analyst": {
        "Wisdom": 0.5,
        "Selflessness": -0.5,
    },
    "Anchor": {
        "Defiance": 0.5,
        "Accuracy": -0.5,
    },
    "Angelic": {
        "Control": 0.5,
        "Presence": -0.5,
    },
    "Arachnid": {
        "Intimidation": 0.5,
        "Vision": -0.5,
    },
    "Archer's Mark": {
        "Aiming": 0.5,
        "Discipline": -0.5,
    },
    "Battery": {
        "Stamina": 0.5,
        "Rotation": -0.5,
    },
    "Beacon": {
        "Presence": 0.5,
        "Control": -0.5,
    },
    "Bulwark": {
        "Determination": 0.5,
        "Selflessness": -0.5,
    },
    "Calculated": {
        "Discipline": 0.5,
        "Cunning": -0.5,
    },
    "Caped": {
        "Lift": 0.5,
        "Vision": -0.5,
    },
    "Charger": {
        "Speed": 0.5,
        "Insight": -0.5,
    },
    "Clean": {
        "Discipline": 0.5,
        "Determination": -0.5,
    },
    "Clockwork": {
        "Control": 0.5,
        "Stamina": -0.5,
    },
    "Confused": {
        "Deception": 0.5,
        "Accuracy": -0.5,
    },
    "Courier": {
        "Persuasion": 0.5,
        "Stuff": -0.5,
    },
    "Cyclist": {
        "Velocity": 0.5,
        "Deception": -0.5,
    },
    "Cyclone": {
        "Rotation": 0.5,
        "Presence": -0.5,
    },
    "Deadeye": {
        "Aiming": 0.5,
        "Determination": -0.5,
    },
    "Demonic": {
        "Defiance": 0.5,
        "Control": -0.5,
    },
    "Director": {
        "Control": 0.5,
        "Accuracy": -0.5,
    },
    "Disguised": {
        "Deception": 0.5,
        "Velocity": -0.5,
    },
    "Draconic": {
        "Muscle": 0.5,
        "Aiming": -0.5,
    },
    "Eagle-eye": {
        "Aiming": 0.5,
        "Cunning": -0.5,
    },
    "Earth Elemental": {
        "Determination": 0.5,
        "Stealth": -0.5,
    },
    "Elvish": {
        "Intuition": 0.5,
        "Persuasion": -0.5,
    },
    "Excavator": {
        "Greed": 0.5,
        "Muscle": -0.5,
    },
    "Fae": {
        "Cunning": 0.5,
        "Discipline": -0.5,
    },
    "Feral Sense": {
        "Intuition": 0.5,
        "Stamina": -0.5,
    },
    "Fire Elemental": {
        "Lift": 0.5,
        "Selflessness": -0.5,
    },
    "Gambit": {
        "Deception": 0.5,
        "Rotation": -0.5,
    },
    "Geometry Expert": {
        "Rotation": 0.5,
        "Stamina": -0.5,
    },
    "Giant": {
        "Intimidation": 0.5,
        "Insight": -0.5,
    },
    "Gorilla": {
        "Muscle": 0.5,
        "Cunning": -0.5,
    },
    "Granite": {
        "Muscle": 0.5,
        "Determination": -0.5,
    },
    "Grounded": {
        "Contact": 0.5,
        "Lift": -0.5,
    },
    "Guardian": {
        "Selflessness": 0.5,
        "Intimidation": -0.5,
    },
    "Hardy": {
        "Stamina": 0.5,
        "Velocity": -0.5,
    },
    "Headliner": {
        "Presence": 0.5,
        "Velocity": -0.5,
    },
    "Hextouch": {
        "Stuff": 0.5,
        "Stamina": -0.5,
    },
    "Holey": {
        "Stealth": 0.5,
        "Greed": -0.5,
    },
    "Horizon": {
        "Vision": 0.5,
        "Wisdom": -0.5,
    },
    "Ill": {
        "Guts": 0.5,
        "Deception": -0.5,
    },
    "Insectoid": {
        "Cunning": 0.5,
        "Determination": -0.5,
    },
    "Ironclad": {
        "Determination": 0.5,
        "Greed": -0.5,
    },
    "Kind": {
        "Selflessness": 0.5,
        "Discipline": -0.5,
    },
    "Kite": {
        "Lift": 0.5,
        "Stealth": -0.5,
    },
    "Leaf": {
        "Speed": 0.5,
        "Intimidation": -0.5,
    },
    "Lionheart": {
        "Guts": 0.5,
        "Accuracy": -0.5,
    },
    "Loyal": {
        "Selflessness": 0.5,
        "Insight": -0.5,
    },
    "Magnetic": {
        "Greed": 0.5,
        "Performance": -0.5,
    },
    "Majestic": {
        "Presence": 0.5,
        "Accuracy": -0.5,
    },
    "Marathoner": {
        "Speed": 0.5,
        "Lift": -0.5,
    },
    "Mer": {
        "Wisdom": 0.5,
        "Stealth": -0.5,
    },
    "Meteor": {
        "Velocity": 0.5,
        "Accuracy": -0.5,
    },
    "Metronome": {
        "Discipline": 0.5,
        "Contact": -0.5,
    },
    "Miasma": {
        "Stuff": 0.5,
        "Presence": -0.5,
    },
    "Mischievous": {
        "Performance": 0.5,
        "Stealth": -0.5,
    },
    "Navigator": {
        "Control": 0.5,
        "Rotation": -0.5,
    },
    "Needle": {
        "Stealth": 0.5,
        "Aiming": -0.5,
    },
    "Night Owl": {
        "Stealth": 0.5,
        "Speed": -0.5,
    },
    "Observer": {
        "Insight": 0.5,
        "Muscle": -0.5,
    },
    "Ogre": {
        "Intimidation": 0.5,
        "Wisdom": -0.5,
    },
    "One With All": {
        "Contact": 0.5,
        "Muscle": -0.5,
    },
    "Orator": {
        "Persuasion": 0.5,
        "Velocity": -0.5,
    },
    "Peacebroker": {
        "Persuasion": 0.5,
        "Defiance": -0.5,
    },
    "Pinpoint": {
        "Accuracy": 0.5,
        "Velocity": -0.5,
    },
    "Playful": {
        "Performance": 0.5,
        "Muscle": -0.5,
    },
    "Psychic": {
        "Intuition": 0.5,
        "Rotation": -0.5,
    },
    "Quarterback": {
        "Accuracy": 0.5,
        "Control": -0.5,
    },
    "Sage": {
        "Wisdom": 0.5,
        "Vision": -0.5,
    },
    "Satellite": {
        "Vision": 0.5,
        "Muscle": -0.5,
    },
    "Scooter": {
        "Speed": 0.5,
        "Discipline": -0.5,
    },
    "Second Wind": {
        "Stamina": 0.5,
        "Accuracy": -0.5,
    },
    "Seer": {
        "Intuition": 0.5,
        "Presence": -0.5,
    },
    "Shiny": {
        "Vision": 0.5,
        "Performance": -0.5,
    },
    "Shopper": {
        "Rotation": 0.5,
        "Persuasion": -0.5,
    },
    "Sneaky": {
        "Cunning": 0.5,
        "Intimidation": -0.5,
    },
    "Snowperson": {
        "Discipline": 0.5,
        "Aiming": -0.5,
    },
    "Softballer": {
        "Stuff": 0.5,
        "Rotation": -0.5,
    },
    "Soul in the Machine": {
        "Accuracy": 0.5,
        "Deception": -0.5,
    },
    "Spectral": {
        "Stealth": 0.5,
        "Contact": -0.5,
    },
    "Spotlight": {
        "Presence": 0.5,
        "Intuition": -0.5,
    },
    "Stargazer": {
        "Insight": 0.5,
        "Discipline": -0.5,
    },
    "Stoneskin": {
        "Guts": 0.5,
        "Control": -0.5,
    },
    "Stonewall": {
        "Defiance": 0.5,
        "Intuition": -0.5,
    },
    "Stormrider": {
        "Velocity": 0.5,
        "Control": -0.5,
    },
    "Striker": {
        "Insight": 0.5,
        "Lift": -0.5,
    },
    "Sweet Tooth": {
        "Contact": 0.5,
        "Aiming": -0.5,
    },
    "Techie": {
        "Insight": 0.5,
        "Intimidation": -0.5,
    },
    "Tenacious Badger": {
        "Guts": 0.5,
        "Intuition": -0.5,
    },
    "The Light": {
        "Vision": 0.5,
        "Speed": -0.5,
    },
    "Thief": {
        "Greed": 0.5,
        "Wisdom": -0.5,
    },
    "Thoroughbred": {
        "Performance": 0.5,
        "Cunning": -0.5,
    },
    "Tireless": {
        "Stamina": 0.5,
        "Guts": -0.5,
    },
    "Titan": {
        "Muscle": 0.5,
        "Contact": -0.5,
    },
    "Treasure Map": {
        "Greed": 0.5,
        "Vision": -0.5,
    },
    "Tusked": {
        "Intimidation": 0.5,
        "Performance": -0.5,
    },
    "UFO": {
        "Lift": 0.5,
        "Greed": -0.5,
    },
    "Undead": {
        "Determination": 0.5,
        "Speed": -0.5,
    },
    "Vampiric": {
        "Cunning": 0.5,
        "Vision": -0.5,
    },
    "Venomous": {
        "Stuff": 0.5,
        "Persuasion": -0.5,
    },
    "Water Elemental": {
        "Contact": 0.5,
        "Intimidation": -0.5,
    },
    "Weaver": {
        "Deception": 0.5,
        "Stuff": -0.5,
    },
    "Wheel": {
        "Rotation": 0.5,
        "Stuff": -0.5,
    },
    "Wildcard": {
        "Defiance": 0.5,
        "Deception": -0.5,
    },
    "Wingmate": {
        "Selflessness": 0.5,
        "Lift": -0.5,
    },
    "Wise": {
        "Wisdom": 0.5,
        "Greed": -0.5,
    },
};

type GreaterBoon = {
    attributes?: Record<string, number>,
    categories?: Record<string, number>,
    isConditional?: boolean,
}

// All greater boon values are currently type "add-mult"
export const greaterBoonTable: Record<string, GreaterBoon> = {
    'Insider': {
        categories: { 'Batting': 0.1 },
        isConditional: true,
    },
    'Outsider': {
        categories: { 'Batting': 0.1 },
        isConditional: true,
    },
    'Clutch': {
        attributes: { 'Contact': 0.25 },
        isConditional: true,
    },
    'Cowardly': {
        attributes: { 'Contact': -0.5 },
    },
    'Criminal': {},
    'Prolific': {},
    'Underdog': {
        categories: { 'Batting': 0.1 },
        isConditional: true,
    },
    'Strong Starter': {
        categories: { 'Pitching': 0.1 },
        isConditional: true,
    },
    'Iron Will': {
        categories: { 'Pitching': 0.1 },
        isConditional: true,
    },
    'Introverted': {
        categories: { 'Batting': 0.1 },
        isConditional: true,
    },
    'All Knowing': {
        attributes: { 'Wisdom': 1.0 },
        isConditional: true,
    },
    'Lucky': {},
    'Unwavering': {},
    'Unrelenting': {
        attributes: {
            'Guts': 1.0,
            'Defiance': 1.0,
        },
    },
    'First Strike': {
        attributes: { 'Velocity': 0.25 },
        isConditional: true,
    },
    'Logical': {
        categories: { 'Pitching': 0.1 },
        isConditional: true,
    },
    'Creative': {
        categories: { 'Pitching': 0.1 },
        isConditional: true,
    },
    'Analytical': {
        categories: { 'Batting': 0.1 },
        isConditional: true,
    },
    'Intuitive': {
        categories: { 'Batting': 0.1 },
        isConditional: true,
    },
    'Partier': {
        categories: {
            'Other': 3.0,
        },
        isConditional: true,
    },
};

type Modification = {
    attributes?: Record<string, number>,
    categories?: Record<string, number>,
    bonusType: 'flat' | 'add-mult' | 'mult-mult',
    stackCount?: number,
}

export const modificationTable: Record<string, Modification> = {
    'Celestial Infusion': {
        attributes: {
            'Muscle': 25,
            'Presence': 25,
        },
        bonusType: 'flat',
    },
    'Celestial Infusion II': {
        attributes: {
            'Muscle': 50,
            'Presence': 50,
        },
        bonusType: 'flat',
        stackCount: 2,
    },
    'Celestial Infusion III': {
        attributes: {
            'Muscle': 100,
            'Presence': 100,
        },
        bonusType: 'flat',
        stackCount: 3,
    },
    'Corrupted': {
        categories: {
            'Batting': 0.2,
            'Pitching': 0.2,
            'Defense': 0.2,
            'Running': 0.2,
            'Other': 0.2,
        },
        bonusType: 'add-mult',
    }
}

export const lesserBoonEmojiMap: Record<string, string> = {
    "Accountant": "📒",
    "Afterburner": "🚀",
    "Air Elemental": "💨",
    "Ambassador": "🎖️",
    "Amphibian": "🐸",
    "Analyst": "📊",
    "Anchor": "⚓",
    "Angelic": "👼",
    "Arachnid": "🕷️",
    "Archer's Mark": "🏹",
    "Battery": "🔋",
    "Beacon": "🕯️",
    "Bulwark": "🛡️",
    "Calculated": "🧮",
    "Caped": "🪶",
    "Charger": "🦏",
    "Clean": "🧹",
    "Clockwork": "🕰️",
    "Confused": "🤷",
    "Courier": "🕊️",
    "Cyclist": "🚲",
    "Cyclone": "🌪️",
    "Deadeye": "🔭",
    "Demonic": "😈",
    "Director": "🎥",
    "Disguised": "🌳",
    "Draconic": "🐲",
    "Eagle-eye": "🦅",
    "Earth Elemental": "⛰️",
    "Elvish": "🧝",
    "Excavator": "⛏️",
    "Fae": "🧚",
    "Feral Sense": "🐺",
    "Fire Elemental": "🔥",
    "Gambit": "♟️",
    "Geometry Expert": "📐",
    "Giant": "🗿",
    "Gorilla": "🦍",
    "Granite": "🏔️",
    "Grounded": "🌱",
    "Guardian": "🐑",
    "Hardy": "🐪",
    "Headliner": "🎤",
    "Hextouch": "🪄",
    "Holey": "🕳️",
    "Horizon": "🌅",
    "Ill": "🤢",
    "Insectoid": "🐞",
    "Ironclad": "⚙️",
    "Kind": "💖",
    "Kite": "🪁",
    "Leaf": "🍃",
    "Lionheart": "🦁",
    "Loyal": "🐕",
    "Magnetic": "🧲",
    "Majestic": "🦬",
    "Marathoner": "🏃",
    "Mer": "🧜",
    "Meteor": "☄️",
    "Metronome": "🎼",
    "Miasma": "☠️",
    "Mischievous": "🐒",
    "Navigator": "⛵",
    "Needle": "🪡",
    "Night Owl": "🌙",
    "Observer": "🦉",
    "Ogre": "👹",
    "One With All": "⚾",
    "Orator": "💬",
    "Peacebroker": "🤝",
    "Pinpoint": "📌",
    "Playful": "🐠",
    "Psychic": "🔮",
    "Quarterback": "🏈",
    "Sage": "🧙",
    "Satellite": "🛰️",
    "Scooter": "🛴",
    "Second Wind": "🌬️",
    "Seer": "👁️",
    "Shiny": "🌟",
    "Shopper": "🛒",
    "Sneaky": "🦊",
    "Snowperson": "☃️",
    "Softballer": "🥎",
    "Soul in the Machine": "🤖",
    "Spectral": "👻",
    "Spotlight": "✨",
    "Stargazer": "🌠",
    "Stoneskin": "🪨",
    "Stonewall": "🧱",
    "Stormrider": "⛈️",
    "Striker": "⚽",
    "Sweet Tooth": "🍬",
    "Techie": "🖥️",
    "Tenacious Badger": "🦡",
    "The Light": "🚦",
    "Thief": "🦝",
    "Thoroughbred": "🐎",
    "Tireless": "🐜",
    "Titan": "🐘",
    "Treasure Map": "🗺️",
    "Tusked": "🐗",
    "UFO": "🛸",
    "Undead": "🧟",
    "Vampiric": "🧛",
    "Venomous": "🐍",
    "Water Elemental": "💧",
    "Weaver": "🧵",
    "Wheel": "🎡",
    "Wildcard": "🃏",
    "Wingmate": "🛩️",
    "Wise": "🐢",
};

export function getLesserBoonEmoji(boonName: string): string {
    return lesserBoonEmojiMap[boonName] || "";
}


export function formatBoonDescription(boon: Boon): string {
    if (!boon) return '';
    // split the description into 3 lines for easier reading in a tooltip
    const description = boon.description.replace('.', '.\n').replace('-', '\n-');
    return `${boon.emoji}${boon.name}\n${description}`;
}
