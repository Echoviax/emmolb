import sql from '@/lib/mmoldb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let start = '';

    try {
        const recompResults = await sql`
            SELECT
                player_recompositions.season,
                player_recompositions.day,
                day_type.name AS day_type
            FROM data.player_recompositions
            JOIN taxa.day_type ON day_type.id = player_recompositions.day_type
            WHERE player_recompositions.mmolb_player_id = ${id}
            ORDER BY player_recompositions.time DESC
            LIMIT 1
        `;

        if (recompResults.length > 0) {
            const recomp = recompResults[0];
            switch (recomp.day_type) {
                case 'RegularDay':
                    start = `${recomp.season},${recomp.day + 1}`;
                    break;
                case 'Preseason':
                    start = `${recomp.season},0`;
                    break;
                case 'SuperstarBreak':
                case 'SuperstarDay':
                case 'SuperstarGame':
                    start = `${recomp.season},121`;
                    break;
                case 'PostseasonPreview':
                    start = `${recomp.season},241`;
                    break;
                default:
                    start = `${recomp.season + 1},0`;
                    break;
            }
            start = `start=${start}&`
        }
    } catch (error) {
        console.error("Failed to connect to MMOLDB:", error);
    }

    const url = `https://freecashe.ws/api/stats?group=player,season&format=json&player=${id}&${start}fields=allowed_stolen_bases,appearances,assists,at_bats,batters_faced,blown_saves,caught_stealing,complete_games,double_plays,doubles,earned_runs,errors,grounded_into_double_play,hit_batters,hit_by_pitch,hits_allowed,home_runs,home_runs_allowed,losses,no_hitters,outs,pitches_thrown,plate_appearances,putouts,quality_starts,runners_caught_stealing,runs,runs_batted_in,sac_flies,sacrifice_double_plays,saves,shutouts,singles,stolen_bases,strikeouts,struck_out,triples,walked,walks,wins`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
        },
        next: { revalidate: 0 }, // no caching
    });

    const data = await response.json();

    return NextResponse.json(data, {
        status: response.status,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}
