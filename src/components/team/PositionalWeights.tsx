/*
    Acrobatics – Fielder's ability to field Line Drives.
    Agility – Fielder's ability to field Fly Balls.
    Arm – Fielder's ability to throw the ball, reducing Doubles and Triples.
    Awareness – Fielder's ability to turn a Double Play, and Catcher's ability to catch a runner attempting to steal a base.
    Composure – Fielder's ability to play without making Errors.
    Dexterity – Fielder's ability to make quick dextrous moves, preventing runners from getting extra bases.
    Patience – Fielder's ability to field Popups.
    Reaction – Fielder's ability to field Ground Balls.
*/

// These are just made up, feel free to tinker with them
// I did it all based off vibes (you can trust me, i know ball)
export const PositionalWeights: Record<string, Record<string, number>> = {
    'C': {
      'Acrobatics': 0.5,
      'Agility': 0.5,
      'Arm': 1.0,
      'Awareness': 1.5,
      'Composure': 1.3,
      'Dexterity': 1.1,
      'Patience': 1.0,
      'Reaction': 1.2,
    },
    '1B': {
      'Acrobatics': 0.9,
      'Agility': 0.5,
      'Arm': 0.6,
      'Awareness': 0.8,
      'Composure': 1.0,
      'Dexterity': 1.2,
      'Patience': 1.0,
      'Reaction': 1.1,
    },
    '2B': {
      'Acrobatics': 1.2,
      'Agility': 0.5,
      'Arm': 1.0,
      'Awareness': 1.5,
      'Composure': 1.2,
      'Dexterity': 1.3,
      'Patience': 1.0,
      'Reaction': 1.5,
    },
    '3B': {
      'Acrobatics': 1.3,
      'Agility': 0.5,
      'Arm': 1.4,
      'Awareness': 1.0,
      'Composure': 1.3,
      'Dexterity': 1.2,
      'Patience': 1.0,
      'Reaction': 1.4,
    },
    'SS': {
      'Acrobatics': 1.4,
      'Agility': 0.5,
      'Arm': 1.3,
      'Awareness': 1.5,
      'Composure': 1.3,
      'Dexterity': 1.4,
      'Patience': 1.1,
      'Reaction': 1.4,
    },
    'LF': {
      'Acrobatics': 1.1,
      'Agility': 1.3,
      'Arm': 1.1,
      'Awareness': 0.5,
      'Composure': 1.1,
      'Dexterity': 1.0,
      'Patience': 0.5,
      'Reaction': 1.0,
    },
    'CF': {
      'Acrobatics': 1.2,
      'Agility': 1.5,
      'Arm': 1.2,
      'Awareness': 0.7,
      'Composure': 1.2,
      'Dexterity': 1.1,
      'Patience': 0.5,
      'Reaction': 1.1,
    },
    'RF': {
      'Acrobatics': 1.1,
      'Agility': 1.3,
      'Arm': 1.4,
      'Awareness': 0.5,
      'Composure': 1.1,
      'Dexterity': 1.0,
      'Patience': 0.5,
      'Reaction': 1.0,
    },
    'DH': {
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 0.0,
    },
    'SP': {
      'Acrobatics': 0.8,
      'Agility': 0.0,
      'Arm': 0.8,
      'Awareness': 0.8,
      'Composure': 0.8,
      'Dexterity': 0.8,
      'Patience': 0.8,
      'Reaction': 0.8,
    },
    'RP': {
      'Acrobatics': 0.7,
      'Agility': 0.0,
      'Arm': 0.7,
      'Awareness': 0.7,
      'Composure': 0.7,
      'Dexterity': 0.7,
      'Patience': 0.7,
      'Reaction': 0.7,
    },
    'CL': {
      'Acrobatics': 0.7,
      'Agility': 0.0,
      'Arm': 0.7,
      'Awareness': 0.7,
      'Composure': 0.7,
      'Dexterity': 0.7,
      'Patience': 0.7,
      'Reaction': 0.7,
    },
}
