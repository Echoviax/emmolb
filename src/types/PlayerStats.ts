// This is a list Luna made in Season 0, may be OOD
export type PlayerStatKey =
    | 'allowed_stolen_bases'
    | 'allowed_stolen_bases_risp'
    | 'appearances'
    | 'assists'
    | 'assists_risp'
    | 'at_bats'
    | 'at_bats_risp'
    | 'batters_faced'
    | 'batters_faced_risp'
    | 'blown_saves'
    | 'caught_double_play'
    | 'caught_double_play_risp'
    | 'caught_stealing'
    | 'caught_stealing_risp'
    | 'complete_games'
    | 'double_plays'
    | 'double_plays_risp'
    | 'doubles'
    | 'doubles_risp'
    | 'earned_runs'
    | 'earned_runs_risp'
    | 'errors'
    | 'errors_risp'
    | 'field_out'
    | 'field_out_risp'
    | 'fielders_choice'
    | 'fielders_choice_risp'
    | 'flyouts'
    | 'flyouts_risp'
    | 'force_outs'
    | 'force_outs_risp'
    | 'games_finished'
    | 'grounded_into_double_play'
    | 'grounded_into_double_play_risp'
    | 'groundout'
    | 'groundout_risp'
    | 'hit_batters'
    | 'hit_batters_risp'
    | 'hit_by_pitch'
    | 'hit_by_pitch_risp'
    | 'hits_allowed'
    | 'hits_allowed_risp'
    | 'home_runs'
    | 'home_runs_allowed'
    | 'home_runs_allowed_risp'
    | 'home_runs_risp'
    | 'inherited_runners'
    | 'inherited_runners_risp'
    | 'inherited_runs_allowed'
    | 'inherited_runs_allowed_risp'
    | 'left_on_base'
    | 'left_on_base_risp'
    | 'lineouts'
    | 'lineouts_risp'
    | 'losses'
    | 'mound_visits'
    | 'no_hitters'
    | 'outs'
    | 'perfect_games'
    | 'pitches_thrown'
    | 'pitches_thrown_risp'
    | 'plate_appearances'
    | 'plate_appearances_risp'
    | 'popouts'
    | 'popouts_risp'
    | 'putouts'
    | 'putouts_risp'
    | 'quality_starts'
    | 'reached_on_error'
    | 'reached_on_error_risp'
    | 'runners_caught_stealing'
    | 'runners_caught_stealing_risp'
    | 'runs'
    | 'runs_batted_in'
    | 'runs_batted_in_risp'
    | 'runs_risp'
    | 'sac_flies'
    | 'sac_flies_risp'
    | 'sacrifice_double_plays'
    | 'sacrifice_double_plays_risp'
    | 'saves'
    | 'shutouts'
    | 'singles'
    | 'singles_risp'
    | 'starts'
    | 'stolen_bases'
    | 'stolen_bases_risp'
    | 'strikeouts'
    | 'strikeouts_risp'
    | 'struck_out'
    | 'struck_out_risp'
    | 'triples'
    | 'triples_risp'
    | 'unearned_runs'
    | 'unearned_runs_risp'
    | 'walked'
    | 'walked_risp'
    | 'walks'
    | 'walks_risp'
    | 'wins';

export type PlayerStats = {
    [key in PlayerStatKey]: number;
};

export const defaultStats: PlayerStats = Object.fromEntries(
    Object.values<PlayerStatKey>([
        'allowed_stolen_bases',
        'allowed_stolen_bases_risp',
        'appearances',
        'assists',
        'assists_risp',
        'at_bats',
        'at_bats_risp',
        'batters_faced',
        'batters_faced_risp',
        'blown_saves',
        'caught_double_play',
        'caught_double_play_risp',
        'caught_stealing',
        'caught_stealing_risp',
        'complete_games',
        'double_plays',
        'double_plays_risp',
        'doubles',
        'doubles_risp',
        'earned_runs',
        'earned_runs_risp',
        'errors',
        'errors_risp',
        'field_out',
        'field_out_risp',
        'fielders_choice',
        'fielders_choice_risp',
        'flyouts',
        'flyouts_risp',
        'force_outs',
        'force_outs_risp',
        'games_finished',
        'grounded_into_double_play',
        'grounded_into_double_play_risp',
        'groundout',
        'groundout_risp',
        'hit_batters',
        'hit_batters_risp',
        'hit_by_pitch',
        'hit_by_pitch_risp',
        'hits_allowed',
        'hits_allowed_risp',
        'home_runs',
        'home_runs_allowed',
        'home_runs_allowed_risp',
        'home_runs_risp',
        'inherited_runners',
        'inherited_runners_risp',
        'inherited_runs_allowed',
        'inherited_runs_allowed_risp',
        'left_on_base',
        'left_on_base_risp',
        'lineouts',
        'lineouts_risp',
        'losses',
        'mound_visits',
        'no_hitters',
        'outs',
        'perfect_games',
        'pitches_thrown',
        'pitches_thrown_risp',
        'plate_appearances',
        'plate_appearances_risp',
        'popouts',
        'popouts_risp',
        'putouts',
        'putouts_risp',
        'quality_starts',
        'reached_on_error',
        'reached_on_error_risp',
        'runners_caught_stealing',
        'runners_caught_stealing_risp',
        'runs',
        'runs_batted_in',
        'runs_batted_in_risp',
        'runs_risp',
        'sac_flies',
        'sac_flies_risp',
        'sacrifice_double_plays',
        'sacrifice_double_plays_risp',
        'saves',
        'shutouts',
        'singles',
        'singles_risp',
        'starts',
        'stolen_bases',
        'stolen_bases_risp',
        'strikeouts',
        'strikeouts_risp',
        'struck_out',
        'struck_out_risp',
        'triples',
        'triples_risp',
        'unearned_runs',
        'unearned_runs_risp',
        'walked',
        'walked_risp',
        'walks',
        'walks_risp',
        'wins',
    ]).map((key) => [key, 0])
) as PlayerStats;

export type DerivedPlayerStats = PlayerStats & {
    hits: number;
    total_bases: number;
    ba: number;
    obp: number;
    slg: number;
    ops: number;
    era: number;
    whip: number;
    kbb: number;
    k9: number;
    h9: number;
    bb9: number;
    hr9: number;
    ip: number;
};

export type PlayerRecord = {
    FirstName: string;
    LastName: string;
    PlayerID: string;
    Season: number;
    SeasonID: string;
    SeasonStatus: string;
    Stats: Record<string, Partial<PlayerStats>>;
    _id: string;
};

export type PlayerRecordResponse = {
    records: PlayerRecord[];
};

export function MapAPIPlayerStats(rawStats: Partial<PlayerStats>): DerivedPlayerStats {
    const base: PlayerStats = { ...defaultStats, ...rawStats };

    const singles = base.singles ?? 0;
    const doubles = base.doubles ?? 0;
    const triples = base.triples ?? 0;
    const home_runs = base.home_runs ?? 0;
    const at_bats = base.at_bats ?? 0;
    const walked = base.walked ?? 0;
    const hbp = base.hit_by_pitch ?? 0;
    const sac_flies = base.sac_flies ?? 0;
    const outs = base.outs ?? 0;
    const earned_runs = base.earned_runs ?? 0;
    const walks = base.walks ?? 0;
    const hits_allowed = base.hits_allowed ?? 0;
    const hra = base.home_runs_allowed ?? 0;
    const strikeouts = base.strikeouts ?? 0;
    const total_bases = singles + 2 * doubles + 3 * triples + 4 * home_runs;

    const hits = singles + doubles + triples + home_runs;
    const ba = at_bats ? hits / at_bats : Infinity;
    const obp = (at_bats + walked + hbp + sac_flies) ? (hits + walked + hbp) / (at_bats + walked + hbp + sac_flies) : Infinity;
    const slg = at_bats ? (singles + 2 * doubles + 3 * triples + 4 * home_runs) / at_bats : Infinity;
    const ops = obp + slg;
    const ip = outs ? (Math.floor(outs / 3) + (outs % 3) / 10) : Infinity;
    const era = outs ? (earned_runs / (outs / 3)) * 9 : Infinity;
    const whip = outs ? (walks + hits_allowed) / (outs / 3) : Infinity;
    const kbb = walks ? strikeouts / walks : Infinity;
    const k9 = outs ? (strikeouts / (outs / 3)) * 9 : Infinity;
    const h9 = outs ? (hits_allowed / (outs / 3)) * 9 : Infinity;
    const bb9 = outs ? (walks / (outs / 3)) * 9 : Infinity;
    const hr9 = outs ? (hra / (outs / 3)) * 9 : Infinity;

    return {
        ...base,
        total_bases,
        hits,
        ba,
        obp,
        slg,
        ops,
        ip,
        era,
        whip,
        kbb,
        k9,
        h9,
        bb9,
        hr9,
    };
}
