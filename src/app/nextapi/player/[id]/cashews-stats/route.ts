import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const url = `https://freecashe.ws/api/stats?group=player,season&format=json&player=${id}&fields=allowed_stolen_bases,appearances,assists,at_bats,batters_faced,blown_saves,caught_stealing,complete_games,double_plays,doubles,earned_runs,errors,grounded_into_double_play,hit_batters,hit_by_pitch,hits_allowed,home_runs,home_runs_allowed,losses,no_hitters,outs,pitches_thrown,plate_appearances,putouts,quality_starts,runners_caught_stealing,runs,runs_batted_in,sac_flies,sacrifice_double_plays,saves,shutouts,singles,stolen_bases,strikeouts,struck_out,triples,walked,walks,wins`;
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
