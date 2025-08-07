export const battingAttrs = ['Aiming', 'Contact', 'Cunning', 'Determination', 'Discipline', 'Insight', 'Intimidation', 'Lift', 'Muscle', 'Selflessness', 'Vision', 'Wisdom'];
export const pitchingAttrs = ['Accuracy', 'Control', 'Defiance', 'Guts', 'Persuasion', 'Presence', 'Rotation', 'Stamina', 'Stuff', 'Velocity'];
export const defenseAttrs = ['Acrobatics', 'Agility', 'Arm', 'Awareness', 'Composure', 'Dexterity', 'Patience', 'Reaction'];
export const runningAttrs = ['Greed', 'Performance', 'Speed', 'Stealth'];
export const otherAttrs = ['Luck'];
export const attrCategories: Record<string, string[]> = {
    'Batting': battingAttrs,
    'Pitching': pitchingAttrs,
    'Defense': defenseAttrs,
    'Running': runningAttrs,
    'Other': otherAttrs,
};
export const attrTypes: Record<string, string> = {};
for (const a of battingAttrs) attrTypes[a] = 'Batting';
for (const a of pitchingAttrs) attrTypes[a] = 'Pitching';
for (const a of defenseAttrs) attrTypes[a] = 'Defense';
for (const a of runningAttrs) attrTypes[a] = 'Running';
for (const a of otherAttrs) attrTypes[a] = 'Other';

export const attrAbbrevs: Record<string, string> = {
    // Batting
    'Aiming': 'AIM',
    'Contact': 'CON',
    'Cunning': 'CUN',
    'Determination': 'DET',
    'Discipline': 'DISC',
    'Insight': 'INS',
    'Intimidation': 'INT',
    'Lift': 'LIFT',
    'Muscle': 'MUSC',
    'Selflessness': 'SELF',
    'Vision': 'VIS',
    'Wisdom': 'WIS',
    // Pitching
    'Accuracy': 'ACC',
    'Control': 'CTRL',
    'Defiance': 'DEFI',
    'Guts': 'GUTS',
    'Persuasion': 'PER',
    'Presence': 'PRES',
    'Rotation': 'ROT',
    'Stamina': 'STAM',
    'Stuff': 'STU',
    'Velocity': 'VELO',
    // Defense
    'Acrobatics': 'ACRO',
    'Agility': 'AGI',
    'Arm': 'ARM',
    'Awareness': 'AWR',
    'Composure': 'COMP',
    'Dexterity': 'DEX',
    'Patience': 'PAT',
    'Reaction': 'REA',
    // Running
    'Greed': 'GRE',
    'Performance': 'PERF',
    'Speed': 'SPD',
    'Stealth': 'STL',
    // Other
    'Luck': 'LUCK',
}

export type OpenDropboxes = {
    [name: string]: {
        [category: string]: boolean;
    };
};

export const trunc = (num: number) => (Math.floor((num) * 100)/100).toString();