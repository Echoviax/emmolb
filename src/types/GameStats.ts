export type BatterGameStats = {
    hits: number;
    atBats: number;
    runs: number;
    homeRuns: number;
    rbi: number;
    ejected: boolean;
};

export function BatterGameStats(): BatterGameStats {
    return {
        hits: 0,
        atBats: 0,
        runs: 0,
        homeRuns: 0,
        rbi: 0,
        ejected: false,
    }
}

export type PitcherGameStats = {
    outsRecorded: number;
    hits: number;
    earnedRuns: number;
    walks: number;
    strikeouts: number;
    strikesThrown: number;
    pitchCount: number;
    ejected: boolean;
}

export function PitcherGameStats(): PitcherGameStats {
    return {
        outsRecorded: 0,
        hits: 0,
        earnedRuns: 0,
        walks: 0,
        strikeouts: 0,
        strikesThrown: 0,
        pitchCount: 0,
        ejected: false,
    }
}

export type ExpandedScoreboard = {
    teamAbbreviation: string;
    runsByInning: number[];
    hits: number;
    errors: number;
    leftOnBase: number;
    battingOrder: string[];
    pitchingOrder: string[];
}

export type GameStats = {
    away: ExpandedScoreboard;
    home: ExpandedScoreboard;
    batters: Record<string, BatterGameStats>;
    pitchers: Record<string, PitcherGameStats>;
}

export function GameStats(): GameStats {
    return {
        away: {
            teamAbbreviation: "AWAY",
            runsByInning: [],
            hits: 0,
            errors: 0,
            leftOnBase: 0,
            battingOrder: [],
            pitchingOrder: []
        },
        home: {
            teamAbbreviation: "HOME",
            runsByInning: [],
            hits: 0,
            errors: 0,
            leftOnBase: 0,
            battingOrder: [],
            pitchingOrder: []
        },
        batters: {},
        pitchers: {}
    };
}