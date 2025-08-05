type PhaseTimes = {
    electionStart: Date;
    holidayStart: Date;
    homeRunChallenge: Date;
    openingDay: Date;
    postseasonPreview: Date;
    postseasonRound1: Date;
    postseasonRound2: Date;
    postseasonRound3: Date;
    preseason: Date;
    regularSeasonResume: Date;
    superstarBreakStart: Date;
    superstarGame: Date;
}

export type Time = {
    phaseTimes: PhaseTimes;
    seasonDay: number | string;
    seasonNumber: number;
    seasonStatus: string;
}

