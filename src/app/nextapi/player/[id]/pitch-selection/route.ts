import sql from '@/lib/mmoldb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const pitchCounts = await sql`
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
            WHERE events.game_id IN (SELECT id FROM games_filtered)
        )
        SELECT
            pitch_type.display_name AS pitch_type,
            COUNT(*) AS count
        FROM player, player_teams, events_filtered AS events
        JOIN data.games ON events.game_id = games.id
        JOIN taxa.pitch_type ON events.pitch_type = pitch_type.id
        WHERE events.pitcher_name = player.name
            AND (games.home_team_mmolb_id = player_teams.mmolb_team_id AND events.top_of_inning = true
                OR games.away_team_mmolb_id = player_teams.mmolb_team_id AND events.top_of_inning = false)
        GROUP BY pitch_type.display_name
    `;

    return NextResponse.json(pitchCounts, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
