import { Boon } from "@/types/Player";

// All lesser boon values are currently type "add-mult"
export const lesserBoonTable: Record<string, Record<string, number>> = {
    "Accountant": {
        "Accuracy": 0.25,
        "Persuasion": -0.1,
    },
    "Afterburner": {
        "Velocity": 0.25,
        "Stuff": -0.1,
    },
    "Air Elemental": {
        "Aiming": 0.25,
        "Contact": -0.1,
    },
    "Ambassador": {
        "Persuasion": 0.25,
        "Guts": -0.1,
    },
    "Amphibian": {
        "Performance": 0.25,
        "Aiming": -0.1,
    },
    "Analyst": {
        "Wisdom": 0.25,
        "Selflessness": -0.1,
    },
    "Anchor": {
        "Defiance": 0.25,
        "Accuracy": -0.1,
    },
    "Angelic": {
        "Control": 0.25,
        "Presence": -0.1,
    },
    "Arachnid": {
        "Intimidation": 0.25,
        "Vision": -0.1,
    },
    "Archer's Mark": {
        "Aiming": 0.25,
        "Discipline": -0.1,
    },
    "Battery": {
        "Stamina": 0.25,
        "Rotation": -0.1,
    },
    "Beacon": {
        "Presence": 0.25,
        "Control": -0.1,
    },
    "Bulwark": {
        "Determination": 0.25,
        "Selflessness": -0.1,
    },
    "Calculated": {
        "Discipline": 0.25,
        "Cunning": -0.1,
    },
    "Caped": {
        "Lift": 0.25,
        "Vision": -0.1,
    },
    "Charger": {
        "Speed": 0.25,
        "Insight": -0.1,
    },
    "Clean": {
        "Discipline": 0.25,
        "Determination": -0.1,
    },
    "Clockwork": {
        "Control": 0.25,
        "Stamina": -0.1,
    },
    "Confused": {
        "Deception": 0.25,
        "Accuracy": -0.1,
    },
    "Courier": {
        "Persuasion": 0.25,
        "Stuff": -0.1,
    },
    "Cyclist": {
        "Velocity": 0.25,
        "Deception": -0.1,
    },
    "Cyclone": {
        "Rotation": 0.25,
        "Presence": -0.1,
    },
    "Deadeye": {
        "Aiming": 0.25,
        "Determination": -0.1,
    },
    "Demonic": {
        "Defiance": 0.25,
        "Control": -0.1,
    },
    "Director": {
        "Control": 0.25,
        "Accuracy": -0.1,
    },
    "Disguised": {
        "Deception": 0.25,
        "Velocity": -0.1,
    },
    "Draconic": {
        "Muscle": 0.25,
        "Aiming": -0.1,
    },
    "Eagle-eye": {
        "Aiming": 0.25,
        "Cunning": -0.1,
    },
    "Earth Elemental": {
        "Determination": 0.25,
        "Stealth": -0.1,
    },
    "Elvish": {
        "Intuition": 0.25,
        "Persuasion": -0.1,
    },
    "Excavator": {
        "Greed": 0.25,
        "Muscle": -0.1,
    },
    "Fae": {
        "Cunning": 0.25,
        "Discipline": -0.1,
    },
    "Feral Sense": {
        "Intuition": 0.25,
        "Stamina": -0.1,
    },
    "Fire Elemental": {
        "Lift": 0.25,
        "Selflessness": -0.1,
    },
    "Gambit": {
        "Deception": 0.25,
        "Rotation": -0.1,
    },
    "Geometry Expert": {
        "Rotation": 0.25,
        "Stamina": -0.1,
    },
    "Giant": {
        "Intimidation": 0.25,
        "Insight": -0.1,
    },
    "Gorilla": {
        "Muscle": 0.25,
        "Cunning": -0.1,
    },
    "Granite": {
        "Muscle": 0.25,
        "Determination": -0.1,
    },
    "Grounded": {
        "Contact": 0.25,
        "Lift": -0.1,
    },
    "Guardian": {
        "Selflessness": 0.25,
        "Intimidation": -0.1,
    },
    "Hardy": {
        "Stamina": 0.25,
        "Velocity": -0.1,
    },
    "Headliner": {
        "Presence": 0.25,
        "Velocity": -0.1,
    },
    "Hextouch": {
        "Stuff": 0.25,
        "Stamina": -0.1,
    },
    "Holey": {
        "Stealth": 0.25,
        "Greed": -0.1,
    },
    "Horizon": {
        "Vision": 0.25,
        "Wisdom": -0.1,
    },
    "Ill": {
        "Guts": 0.25,
        "Deception": -0.1,
    },
    "Insectoid": {
        "Cunning": 0.25,
        "Determination": -0.1,
    },
    "Ironclad": {
        "Determination": 0.25,
        "Greed": -0.1,
    },
    "Kind": {
        "Selflessness": 0.25,
        "Discipline": -0.1,
    },
    "Kite": {
        "Lift": 0.25,
        "Stealth": -0.1,
    },
    "Leaf": {
        "Speed": 0.25,
        "Intimidation": -0.1,
    },
    "Lionheart": {
        "Guts": 0.25,
        "Accuracy": -0.1,
    },
    "Loyal": {
        "Selflessness": 0.25,
        "Insight": -0.1,
    },
    "Magnetic": {
        "Greed": 0.25,
        "Performance": -0.1,
    },
    "Majestic": {
        "Presence": 0.25,
        "Accuracy": -0.1,
    },
    "Marathoner": {
        "Speed": 0.25,
        "Lift": -0.1,
    },
    "Mer": {
        "Wisdom": 0.25,
        "Stealth": -0.1,
    },
    "Meteor": {
        "Velocity": 0.25,
        "Accuracy": -0.1,
    },
    "Metronome": {
        "Discipline": 0.25,
        "Contact": -0.1,
    },
    "Miasma": {
        "Stuff": 0.25,
        "Presence": -0.1,
    },
    "Mischievous": {
        "Performance": 0.25,
        "Stealth": -0.1,
    },
    "Navigator": {
        "Control": 0.25,
        "Rotation": -0.1,
    },
    "Needle": {
        "Stealth": 0.25,
        "Aiming": -0.1,
    },
    "Night Owl": {
        "Stealth": 0.25,
        "Speed": -0.1,
    },
    "Observer": {
        "Insight": 0.25,
        "Muscle": -0.1,
    },
    "Ogre": {
        "Intimidation": 0.25,
        "Wisdom": -0.1,
    },
    "One With All": {
        "Contact": 0.25,
        "Muscle": -0.1,
    },
    "Orator": {
        "Persuasion": 0.25,
        "Velocity": -0.1,
    },
    "Peacebroker": {
        "Persuasion": 0.25,
        "Defiance": -0.1,
    },
    "Pinpoint": {
        "Accuracy": 0.25,
        "Velocity": -0.1,
    },
    "Playful": {
        "Performance": 0.25,
        "Muscle": -0.1,
    },
    "Psychic": {
        "Intuition": 0.25,
        "Rotation": -0.1,
    },
    "Quarterback": {
        "Accuracy": 0.25,
        "Control": -0.1,
    },
    "Sage": {
        "Wisdom": 0.25,
        "Vision": -0.1,
    },
    "Satellite": {
        "Vision": 0.25,
        "Muscle": -0.1,
    },
    "Scooter": {
        "Speed": 0.25,
        "Discipline": -0.1,
    },
    "Second Wind": {
        "Stamina": 0.25,
        "Accuracy": -0.1,
    },
    "Seer": {
        "Intuition": 0.25,
        "Presence": -0.1,
    },
    "Shiny": {
        "Vision": 0.25,
        "Performance": -0.1,
    },
    "Shopper": {
        "Rotation": 0.25,
        "Persuasion": -0.1,
    },
    "Sneaky": {
        "Cunning": 0.25,
        "Intimidation": -0.1,
    },
    "Snowperson": {
        "Discipline": 0.25,
        "Aiming": -0.1,
    },
    "Softballer": {
        "Stuff": 0.25,
        "Rotation": -0.1,
    },
    "Soul in the Machine": {
        "Accuracy": 0.25,
        "Deception": -0.1,
    },
    "Spectral": {
        "Stealth": 0.25,
        "Contact": -0.1,
    },
    "Spotlight": {
        "Presence": 0.25,
        "Intuition": -0.1,
    },
    "Stargazer": {
        "Insight": 0.25,
        "Discipline": -0.1,
    },
    "Stoneskin": {
        "Guts": 0.25,
        "Control": -0.1,
    },
    "Stonewall": {
        "Defiance": 0.25,
        "Intuition": -0.1,
    },
    "Stormrider": {
        "Velocity": 0.25,
        "Control": -0.1,
    },
    "Striker": {
        "Insight": 0.25,
        "Lift": -0.1,
    },
    "Sweet Tooth": {
        "Contact": 0.25,
        "Aiming": -0.1,
    },
    "Techie": {
        "Insight": 0.25,
        "Intimidation": -0.1,
    },
    "Tenacious Badger": {
        "Guts": 0.25,
        "Intuition": -0.1,
    },
    "The Light": {
        "Vision": 0.25,
        "Speed": -0.1,
    },
    "Thief": {
        "Greed": 0.25,
        "Wisdom": -0.1,
    },
    "Thoroughbred": {
        "Performance": 0.25,
        "Cunning": -0.1,
    },
    "Tireless": {
        "Stamina": 0.25,
        "Guts": -0.1,
    },
    "Titan": {
        "Muscle": 0.25,
        "Contact": -0.1,
    },
    "Treasure Map": {
        "Greed": 0.25,
        "Vision": -0.1,
    },
    "Tusked": {
        "Intimidation": 0.25,
        "Performance": -0.1,
    },
    "UFO": {
        "Lift": 0.25,
        "Greed": -0.1,
    },
    "Undead": {
        "Determination": 0.25,
        "Speed": -0.1,
    },
    "Vampiric": {
        "Cunning": 0.25,
        "Vision": -0.1,
    },
    "Venomous": {
        "Stuff": 0.25,
        "Persuasion": -0.1,
    },
    "Water Elemental": {
        "Contact": 0.25,
        "Intimidation": -0.1,
    },
    "Weaver": {
        "Deception": 0.25,
        "Stuff": -0.1,
    },
    "Wheel": {
        "Rotation": 0.25,
        "Stuff": -0.1,
    },
    "Wildcard": {
        "Defiance": 0.25,
        "Deception": -0.1,
    },
    "Wingmate": {
        "Selflessness": 0.25,
        "Lift": -0.1,
    },
    "Wise": {
        "Wisdom": 0.25,
        "Greed": -0.1,
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
