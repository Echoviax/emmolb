import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';
import userdbPromise from '@/sqlite/userdb'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { league_name, team_id } = body;

        const db = await dbPromise;
        const league_id = await db.get(`SELECT league_id FROM leagues WHERE league_name = ?`, league_name);
        const owner = await db.get('SELECT owner_id FROM league_owners WHERE league_id = ?', league_id.league_id);
        if (owner) {
            const cookie = req.cookies.get('session')?.value;
            if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

            const userdb = await userdbPromise;
            const session = await userdb.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
            if (!session) return NextResponse.json({ error: 'Unauthorized (Mismatch in cookies)' }, { status: 401 });
            if (session.user_id != owner.owner_id) return NextResponse.json({ error: 'Unauthorized (Not the leagues owner)' }, { status: 401 });
        }
        const result = await db.get(`SELECT league_teams FROM leagues WHERE league_name = ?`, league_name);
        const teams: string = result?.league_teams || '';

        const updatedTeams = teams ? `${teams},${team_id}` : team_id;

        await db.run(`UPDATE leagues SET league_teams = ? WHERE league_name = ?`, updatedTeams, league_name);

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
