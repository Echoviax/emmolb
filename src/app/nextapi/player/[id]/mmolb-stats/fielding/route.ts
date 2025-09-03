import sql from '@/lib/mmoldb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const fieldingStats = await sql`
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
            WHERE games.home_team_mmolb_id = player_teams.mmolb_team_id
                OR games.away_team_mmolb_id = player_teams.mmolb_team_id
        ), events_filtered AS (
            SELECT events.*
            FROM data.events
            JOIN taxa.event_type ON events.event_type = event_type.id
            WHERE events.game_id IN (SELECT id FROM games_filtered)
                AND is_in_play = true
        )
        SELECT
            season,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'GroundBall')::integer AS ground_balls,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'GroundBall'
                AND event_type.name IN ('GroundedOut', 'ForceOut', 'FieldersChoice', 'DoublePlay'))::integer AS ground_ball_outs,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'LineDrive')::integer AS line_drives,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'LineDrive'
                AND event_type.name IN ('CaughtOut', 'DoublePlay'))::integer AS line_drive_outs,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'FlyBall')::integer AS fly_balls,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'FlyBall'
                AND event_type.name IN ('CaughtOut', 'DoublePlay'))::integer AS fly_ball_outs,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'Popup')::integer AS popups,
            COUNT(*) FILTER (WHERE fair_ball_type.name = 'Popup'
                AND event_type.name IN ('CaughtOut', 'DoublePlay'))::integer AS popup_outs
        FROM player, player_teams, events_filtered AS events
        JOIN taxa.event_type ON events.event_type = event_type.id
        JOIN taxa.fair_ball_type ON events.fair_ball_type = fair_ball_type.id
        JOIN data.event_fielders ON events.id = event_fielders.event_id AND play_order = 0
        JOIN data.games ON events.game_id = games.id
        WHERE event_fielders.fielder_name = player.name
            AND (games.home_team_mmolb_id = player_teams.mmolb_team_id AND events.top_of_inning = true
                OR games.away_team_mmolb_id = player_teams.mmolb_team_id AND events.top_of_inning = false)
        GROUP BY games.season
    `;

    return NextResponse.json(fieldingStats, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
