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

// Based on OLS regression analysis of fielding value by position
// All coefficients normalized to 1.0-5.0 scale where max (CF acrobatics: 7.24) = 5.0, min (1B composure: 0.73) = 1.0
export const PositionalWeights: Record<string, Record<string, number>> = {
    'C': {
      // R² = 0.472, awareness (5.77)
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 4.10,  // 1.0 + (5.77 - 0.73) * 4.0/6.51
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 0.0,
    },
    '1B': {
      // R² = 0.174, composure (0.73) + reaction (2.15)
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 1.00,  // 1.0 + (0.73 - 0.73) * 4.0/6.51 (min value)
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 1.87,   // 1.0 + (2.15 - 0.73) * 4.0/6.51
    },
    '2B': {
      // R² = 0.156, reaction (3.17)
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 2.50,   // 1.0 + (3.17 - 0.73) * 4.0/6.51
    },
    '3B': {
      // R² = 0.409, composure (0.85) + dexterity (-0.88) + reaction (6.01)
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 1.07,  // 1.0 + (0.85 - 0.73) * 4.0/6.51
      'Dexterity': 0.0,   // negative coefficient, set to 0
      'Patience': 0.0,
      'Reaction': 4.25,   // 1.0 + (6.01 - 0.73) * 4.0/6.51
    },
    'SS': {
      // R² = 0.347, arm (0.88) + composure (1.64) + reaction (5.29)
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 1.09,        // 1.0 + (0.88 - 0.73) * 4.0/6.51
      'Awareness': 0.0,
      'Composure': 1.56,  // 1.0 + (1.64 - 0.73) * 4.0/6.51
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 3.80,   // 1.0 + (5.29 - 0.73) * 4.0/6.51
    },
    'LF': {
      // R² = 0.374, acrobatics (6.68) + agility (3.41) + arm (3.83) + dexterity (2.28)
      'Acrobatics': 4.66, // 1.0 + (6.68 - 0.73) * 4.0/6.51
      'Agility': 2.65,    // 1.0 + (3.41 - 0.73) * 4.0/6.51
      'Arm': 2.91,        // 1.0 + (3.83 - 0.73) * 4.0/6.51
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 1.95,  // 1.0 + (2.28 - 0.73) * 4.0/6.51
      'Patience': 0.0,
      'Reaction': 0.0,
    },
    'CF': {
      // R² = 0.397, acrobatics (7.24) + agility (4.57) + arm (4.06)
      'Acrobatics': 5.00, // 1.0 + (7.24 - 0.73) * 4.0/6.51 (max value)
      'Agility': 3.36,    // 1.0 + (4.57 - 0.73) * 4.0/6.51
      'Arm': 3.05,        // 1.0 + (4.06 - 0.73) * 4.0/6.51
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 0.0,
    },
    'RF': {
      // R² = 0.382, acrobatics (6.93) + agility (2.85) + arm (4.43) + dexterity (2.04) + patience (-1.72)
      'Acrobatics': 4.81, // 1.0 + (6.93 - 0.73) * 4.0/6.51
      'Agility': 2.30,    // 1.0 + (2.85 - 0.73) * 4.0/6.51
      'Arm': 3.27,        // 1.0 + (4.43 - 0.73) * 4.0/6.51
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 1.80,  // 1.0 + (2.04 - 0.73) * 4.0/6.51
      'Patience': 0.0,    // negative coefficient, set to 0
      'Reaction': 0.0,
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
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 0.0,
      // pitcher to 1.2 because I think theyre more important than RP
      'Accuracy': 1.2,
      'Control': 1.2,
      'Defiance': 1.2,
      'Guts': 1.2,
      'Persuasion': 1.2,
      'Presence': 1.2,
      'Rotation': 1.2,
      'Stamina': 1.2,
      'Stuff': 1.2,
      'Velocity': 1.2,

    },
    'RP': {
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 0.0,
    },
    'CL': {
      'Acrobatics': 0.0,
      'Agility': 0.0,
      'Arm': 0.0,
      'Awareness': 0.0,
      'Composure': 0.0,
      'Dexterity': 0.0,
      'Patience': 0.0,
      'Reaction': 0.0,
    },
}
