export const battingAttrs = ['Aiming', 'Contact', 'Cunning', 'Determination', 'Discipline', 'Insight', 'Intimidation', 'Lift', 'Muscle', 'Selflessness', 'Vision', 'Wisdom'];
export const pitchingAttrs = ['Accuracy', 'Control', 'Defiance', 'Guts', 'Persuasion', 'Presence', 'Rotation', 'Stamina', 'Stuff', 'Velocity'];
export const defenseAttrs = ['Acrobatics', 'Agility', 'Arm', 'Awareness', 'Composure', 'Dexterity', 'Patience', 'Reaction'];
export const runningAttrs = ['Greed', 'Performance', 'Speed', 'Stealth'];
export const otherAttrs = ['Luck'];
export const attrCategoryNames = ['Batting', 'Pitching', 'Defense', 'Running', 'Other'];
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

export const trunc = (num: number) => +(Math.round((num + Number.EPSILON) * 100) / 100).toString();

export const statDefinitions: Record<string, string> = {
    "Accuracy": "Pitcher's ability to pitch to their intended zone",
    "Acrobatics": "Fielder's ability to field Line Drives",
    "Agility": "Fielder's ability to field Fly Balls",
    "Aiming": "Batter's ability to hit Line Drives",
    "Arm": "Fielder's ability to throw the ball, reducing Doubles and Triples",
    "Awareness": "Fielder's ability to turn a Double Play, and Catcher's ability to catch a runner attempting to steal a base",
    "Composure": "Fielder's ability to play without making Errors",
    "Contact": "Batter's ability to make contact, putting the ball in play",
    "Control": "Pitcher's ability to have control of their pitch, reducing Balls",
    "Cunning": "Batter's ability to draw a Hit By Pitch",
    "Defiance": "Pitcher's ability to remain in the game during a Mound Visit. Also increases the amount of Energy restored on success",
    "Determination": "Batter's ability to hit a Foul on pitches in the Strike Zone",
    "Dexterity": "Fielder's ability to make quick dextrous moves, preventing runners from getting extra bases",
    "Discipline": "Batter's ability to remain disciplined at the plate, increasing Balls",
    "Greed": "Baserunner's willingness to attempt to steal a base",
    "Guts": "Pitcher's ability to play better when their Energy is reduced below one third of their total, increasing their overall effectiveness",
    "Insight": "Batter's ability to hit a Single",
    "Intimidation": "Batter's ability to intimidate the pitcher, reducing Swinging Strikes",
    "Lift": "Batter's ability to hit Fly Balls",
    "Luck": "A player's ability to affect the outcomes of weather events. Does not directly affect the performance of a player",
    "Muscle": "Batter's ability to hit Doubles, Triples, and Home Runs",
    "Patience": "Fielder's ability to field Popups",
    "Performance": "Batter's ability to distract fielders, allowing them to reach base more often when a ball is in play",
    "Persuasion": "Pitcher's ability to pitch a Foul ball",
    "Presence": "Pitcher's ability to frighten the Batter, reducing Home Runs",
    "Priority": "Determines a batter's position in the Lineup. Higher Priority players will bat ahead of lower Priority players",
    "Reaction": "Fielder's ability to field Ground Balls",
    "Rotation": "Pitcher's ability to throw pitches with a high spin rate, reducing balls in play",
    "Selflessness": "Batter's willingness to hit into a sacrifice play",
    "Speed": "Player's raw speed on the basepaths. Increases Hits when Batting and extra bases when Baserunning",
    "Stamina": "Pitcher's ability to remain in top form, reducing their penalty when Energy is lost and increasing their overall effectiveness",
    "Stealth": "Baserunner's ability to remain undetected when attempting to steal a base, increasing the success of stolen base attempts, and increasing their willingness to attempt to steal a base",
    "Stuff": "Pitcher's ability to throw dirty pitches that result in more Ground Balls or Popups",
    "Velocity": "Pitcher's ability to throw hard and fast, increasing Called Strikes and Swinging Strikes",
    "Vision": "Batter's ability to track the pitch as it's coming at them, reducing Called Strikes",
    "Wisdom": "Batter's ability to learn from each pitch, increasing their overall effectiveness as the Count of the current Plate Appearance increases"
}

export const positionsList: string[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'SP', 'RP', 'CL'];
export const slotsList: string[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'RP1', 'RP2', 'RP3', 'CL'];
