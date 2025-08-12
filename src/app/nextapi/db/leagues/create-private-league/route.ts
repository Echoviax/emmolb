import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';
import userdbPromise from '@/sqlite/userdb';

export async function POST(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        if (!cookie) return NextResponse.json({ error: 'Unauthorized (Not logged in)' }, { status: 401 });

        const userdb = await userdbPromise;
        const session = await userdb.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
        if (!session) return NextResponse.json({ error: 'Unauthorized (Mismatch in cookies)' }, { status: 401 });

        const body = await req.json();
        const { league_name, league_emoji, league_color } = body;

        const db = await dbPromise;
        await db.run(
            `INSERT INTO leagues (league_name, league_emoji, league_color, league_teams) VALUES (?, ?, ?, ?)`,
            league_name,
            league_emoji,
            league_color,
            ''
        );
        const leagueID = await db.get(
            `SELECT league_id FROM leagues WHERE league_name = ?`, league_name
        );
        await db.run(
            `INSERT INTO league_owners (league_id, owner_id) VALUES (?, ?)`,
            leagueID.league_id,
            session.user_id
        );

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to insert' }, { status: 500 });
    }
}
