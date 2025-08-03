import { Event } from "./Event";
import { Weather } from "./Weather";

export type Game = {
    away_lineup: string[]
    away_sp: string;
    away_team_abbreviation: string;
    away_team_color: string;
    away_team_emoji: string;
    away_team_id: string;
    away_team_name: string;
    day: number | string;
    day_id: string;
    event_log: Event[];
    home_lineup: string[]
    home_sp: string;
    home_team_abbreviation: string;
    home_team_color: string;
    home_team_emoji: string;
    home_team_id: string;
    home_team_name: string;
    hype_end_index?: any;
    league: string;
    pitcher_entry: Record<string, {bf: number, id: string}>;
    realm: string;
    season: number;
    season_id: string;
    season_status: string;
    state: string;
    stats: Record<string, Record<string, number>>;
    weather: Weather;
}

export function MapAPIGameResponse(data: any): Game {
    return {
        away_lineup: data.AwayLineup,
        away_sp: data.AwaySP,
        away_team_abbreviation: data.AwayTeamAbbreviation,
        away_team_color: data.AwayTeamColor,
        away_team_emoji: data.AwayTeamEmoji,
        away_team_id: data.AwayTeamID,
        away_team_name: data.AwayTeamName,
        day: data.Day,
        day_id: data.DayID,
        event_log: data.EventLog,
        home_lineup: data.HomeLineup,
        home_sp: data.HomeSP,
        home_team_abbreviation: data.HomeTeamAbbreviation,
        home_team_color: data.HomeTeamColor,
        home_team_emoji: data.HomeTeamEmoji,
        home_team_id: data.HomeTeamID,
        home_team_name: data.HomeTeamName,
        hype_end_index: data.HypeEndIndex,
        league: data.League,
        pitcher_entry: data.PitcherEntry,
        realm: data.Realm,
        season: data.Season,
        season_id: data.SeasonID,
        season_status: data.SeasonStatus,
        state: data.State,
        stats: data.Stats,
        weather: {emoji: data.Weather.Emoji, name: data.Weather.Name, tooltip: data.Weather.Tooltip},
    };
}