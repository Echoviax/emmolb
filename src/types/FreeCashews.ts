import { Event } from "./Event";

export type CashewsEquipment = {
    Name?: string;
    Emoji?: string;
    Prefixes?: string[];
    Rarity?: string;
    Suffixes?: string[];
    Effects: any[];
}

export type CashewsPlayer = {
    kind: string;
    entity_id: string;
    valid_from: string;
    valid_to?: string;
    data: {
        _id: string;
        Bats: string;
        Feed: any[];
        Home: string;
        Likes: string;
        Stats: Record<any, any>;
        Number: number;
        TeamID: string;
        Throws: string;
        Augments: number;
        Birthday: string;
        Dislikes: string;
        LastName: string;
        Position: string;
        Equipment: {
            Body?: CashewsEquipment;
            Feet?: CashewsEquipment;
            Head?: CashewsEquipment;
            Hands?: CashewsEquipment;
            Accessory?: CashewsEquipment; 
        }
        FirstName: string;
        Durability: number;
        LesserBoon?: string;
        Birthseason: number;
        GreaterBoon?: string;
        SeasonStats: Record<string, Record<string, string>>;
        PositionType: string;
        Modifications: any[];
    }
}

export type CashewsPlayers = {
    items: CashewsPlayer[]
}

export type CashewsGame = {
    game_id: string,
    season: number,
    day?: number,
    day_special?: string,
    home_team_id: string,
    away_team_id: string,
    state: string,
    event_count?: number,
    last_update: Event,
};