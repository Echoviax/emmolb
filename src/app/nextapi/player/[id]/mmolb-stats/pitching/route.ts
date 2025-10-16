import sql from '@/lib/mmoldb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const pitchingStats = await sql`
        WITH player AS (
            SELECT
                player_versions.first_name || ' ' || player_versions.last_name AS name
            FROM data.player_versions
            WHERE player_versions.valid_until IS NULL
                AND player_versions.mmolb_player_id = ${id}
        ), player_teams AS (
            SELECT DISTINCT
                player_versions.mmolb_team_id
            FROM data.player_versions, player
            WHERE player_versions.mmolb_player_id = ${id}
                AND player_versions.first_name || ' ' || player_versions.last_name = player.name
        ), games_filtered AS (
            SELECT games.id
            FROM player_teams, data.games
            WHERE (games.home_team_mmolb_id = player_teams.mmolb_team_id
                OR games.away_team_mmolb_id = player_teams.mmolb_team_id)
                AND games.day <= 240
        ), events_filtered AS (
            SELECT events.*
            FROM data.events
            WHERE events.game_id IN (SELECT id FROM games_filtered)
        )
        SELECT
            season,
            COUNT(*) FILTER (WHERE event_type.name = 'Balk')::integer AS balks,
            COUNT(*) FILTER (WHERE batter_base.bases_achieved = 1)::integer AS singles,
            COUNT(*) FILTER (WHERE batter_base.bases_achieved = 2)::integer AS doubles,
            COUNT(*) FILTER (WHERE batter_base.bases_achieved = 3)::integer AS triples,
            COUNT(*) FILTER (WHERE event_type.name = 'CaughtOut' AND events.described_as_sacrifice = true)::integer AS sac_flies,
            COUNT(*) FILTER (WHERE event_type.name = 'DoublePlay' AND events.described_as_sacrifice = true)::integer AS sacrifice_double_plays
        FROM player, player_teams, events_filtered AS events
        JOIN taxa.event_type ON events.event_type = event_type.id
        LEFT JOIN taxa.base AS batter_base ON events.hit_base = batter_base.id
        JOIN data.games ON events.game_id = games.id
        WHERE events.pitcher_name = player.name
            AND (games.home_team_mmolb_id = player_teams.mmolb_team_id AND events.top_of_inning = true
                OR games.away_team_mmolb_id = player_teams.mmolb_team_id AND events.top_of_inning = false)
        GROUP BY games.season
    `;

    return NextResponse.json(pitchingStats, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
