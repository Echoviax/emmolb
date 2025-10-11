import { FeedMessage } from "./FeedMessage";
import { DerivedPlayerStats, MapAPIPlayerStats, PlayerStats } from "./PlayerStats";

export type EquipmentEffect = {
    attribute: string;
    type: string;
    value: number;
}

export type Boon = {
    description: string,
    emoji: string,
    name: string,
}

export type Equipment = {
    effects: EquipmentEffect[];
    emoji: string;
    name: string;
    rareName?: string;
    prefix?: string[];
    rarity: string;
    slot?: string;
    suffix?: string[];
}

export type TalkEntry = {
    day: number,
    quote: string,
    season: number,
    stars: {
        [key: string]: {
            display: string,
            regular: number,
            shiny: number,
            stars: number,
            total: number,
        }
    }
}

export type Player = {
    augments: number;
    bats: string;
    birthday: string;
    birth_season: number;
    dislikes: string;
    durability: number;
    equipment: {
        accessory?: Equipment;
        body?: Equipment;
        feet?: Equipment;
        hands?: Equipment;
        head?: Equipment;
    }
    feed: FeedMessage[];
    first_name: string;
    greater_boon?: Boon;
    home: string;
    last_name: string;
    lesser_boon?: Boon;
    likes: string;
    modifications: Boon[];
    number: number;
    position: string;
    position_type: string;
    season_stats: Record<string, Record<string, string>>;
    stats: Record<string, DerivedPlayerStats>;
    talk?: {
        [category: string]: TalkEntry | null;
    } 
    team_id: string;
    throws: string;
    id: string;
}

function mapEffect(effect: any): EquipmentEffect {
    return {
        attribute: effect.Attribute,
        type: effect.Type,
        value: effect.Value,
    };
}

function mapEquipment(raw: any): Equipment | undefined {
    if (!raw) return;

    return {
        effects: Array.isArray(raw.Effects) ? raw.Effects.map(mapEffect) : [],
        emoji: raw.Emoji,
        name: raw.Name,
        rareName: raw.RareName,
        prefix: raw.Prefixes,
        rarity: raw.Rarity,
        slot: raw.Slot,
        suffix: raw.Suffixes,
    };
}

function mapBoon(raw: any): Boon | undefined {
    if (!raw) return;

    return {
        description: raw.Description,
        emoji: raw.Emoji,
        name: raw.Name,
    }
}

export function MapAPIPlayerResponse(data: any): Player {
    return {
        augments: data.Augments,
        bats: data.Bats,
        birthday: data.Birthday,
        birth_season: data.Birthseason,
        dislikes: data.Dislikes,
        durability: data.Durability,
        equipment: {
            accessory: mapEquipment(data.Equipment.Accessory),
            body: mapEquipment(data.Equipment.Body),
            feet: mapEquipment(data.Equipment.Feet),
            hands: mapEquipment(data.Equipment.Hands),
            head: mapEquipment(data.Equipment.Head),
        },
        feed: data.Feed,
        first_name: data.FirstName,
        greater_boon: mapBoon(data.GreaterBoon),
        home: data.Home,
        last_name: data.LastName,
        lesser_boon: mapBoon(data.LesserBoon),
        likes: data.Likes,
        modifications: data.Modifications.map((x: any) => mapBoon(x)),
        number: data.Number,
        position: data.Position,
        position_type: data.PositionType,
        season_stats: data.SeasonStats,
        stats: Object.fromEntries(Object.entries(data.Stats ?? {}).map(([season, stats]) => [season, MapAPIPlayerStats(stats as Partial<PlayerStats>)])),
        talk: {
            batting: data.Talk?.Batting ?? null,
            pitching: data.Talk?.Pitching ?? null,
            defense: data.Talk?.Defense ?? null,
            base_running: data.Talk?.Baserunning ?? null,
        },
        team_id: data.TeamID,
        throws: data.Throws,
        id: data._id,
    };
}