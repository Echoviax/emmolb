export type Event = {
    away_score: number;
    balls: number;
    batter?: string | {
        avg: number;
        bats: string;
        id: string;
        name: string;
        pa: string;
    };
    event: string;
    home_score: number;
    index: number;
    inning: number;
    inning_side: number;
    message: string;
    on_1b: boolean;
    on_2b: boolean;
    on_3b: boolean;
    on_deck?: string | {
        avg: number;
        bats: string;
        id: string;
        name: string;
        pa: string;
    };
    outs: number;
    pitch_info: string;
    pitcher?: string | {
        era: number;
        id: string;
        name: string;
        pitches: number;
        throws: string;
    };
    strikes: number;
    zone: string;
    home_run_distance?: number;
}