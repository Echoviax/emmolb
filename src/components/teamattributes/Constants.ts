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

export type OpenDropboxes = {
    [name: string]: {
        [category: string]: boolean;
    };
};

export const trunc = (num: number) => (Math.floor((num) * 100)/100).toString();