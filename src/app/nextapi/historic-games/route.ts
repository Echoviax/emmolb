import sql from '@/lib/mmoldb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json({ error: 'Missing "ids" query parameter' }, { status: 400 });
  }

  const teamIDs = idsParam.split(",");

    const res = await sql`
        WITH Games AS (
            SELECT home_team_mmolb_id, away_team_mmolb_id, home_team_final_score, away_team_final_score, season, day
            FROM DATA.games
            WHERE home_team_mmolb_id IN ${sql(teamIDs)} OR away_team_mmolb_id IN ${sql(teamIDs)}
        ),
        GameResults (winner_id, loser_id, winner_score, loser_score) AS (
            SELECT
                home_team_mmolb_id, away_team_mmolb_id, home_team_final_score, away_team_final_score, season, day
            FROM Games WHERE home_team_final_score > away_team_final_score
            UNION
            SELECT
                away_team_mmolb_id, home_team_mmolb_id, away_team_final_score, home_team_final_score, season, day
            FROM Games WHERE home_team_final_score < away_team_final_score
        ),
        SeasonRecords AS (
            WITH _Records AS (
                SELECT
                    mmolb_team_id,
                    mmolb_league_id,
                    season,
                    COUNT(CASE WHEN winner_id = mmolb_team_id THEN 1 else NULL END) AS wins,
                    COUNT(CASE WHEN loser_id = mmolb_team_id THEN 1 else NULL END) AS losses,
                    SUM(CASE WHEN winner_id = mmolb_team_id THEN winner_score ELSE loser_score END) AS runs,
                    SUM(CASE WHEN loser_id = mmolb_team_id THEN winner_score ELSE loser_score END) AS runs_against
                FROM DATA.team_versions JOIN GameResults ON (winner_id = mmolb_team_id or loser_id = mmolb_team_id)
                WHERE day IS NOT null AND valid_until IS NULL AND ((season = 0 AND day <= 120) OR (season > 0 AND day <= 240))
                GROUP BY mmolb_team_id, mmolb_league_id, season
            )
            SELECT
                mmolb_team_id,
                mmolb_league_id,
                season,
                wins,
                losses,
                wins - losses AS win_diff,
                runs,
                runs_against,
                runs - runs_against AS run_diff
            FROM _Records
        )
        SELECT mmolb_team_id, season, wins, losses, run_diff from SeasonRecords
        WHERE mmolb_team_id IN ${sql(teamIDs)}
        ORDER BY season, run_diff, mmolb_team_id DESC`

  return NextResponse.json(res, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}