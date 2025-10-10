import sql from '@/lib/mmoldb';
import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const getCachedData = unstable_cache(
    async () => await sql`
        SELECT
            player_versions.mmolb_team_id,
            COUNT(*) AS count
        FROM data.player_modification_versions
        JOIN data.modifications ON player_modification_versions.modification_id = modifications.id AND modifications.name = 'Corrupted'
        JOIN data.player_versions ON player_versions.mmolb_player_id = player_modification_versions.mmolb_player_id AND player_versions.valid_until IS NULL
        WHERE player_modification_versions.valid_until IS NULL
        GROUP BY player_versions.mmolb_team_id
    `,
    ['teams-corrupted-players'],
    {
        revalidate: 300,
    }
)

export async function GET(req: NextRequest) {
    const corruptedPlayers = await getCachedData();
    const result = Object.fromEntries(corruptedPlayers.map(x => [x['mmolb_team_id'], Number(x['count'])]))
    return NextResponse.json(result, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
