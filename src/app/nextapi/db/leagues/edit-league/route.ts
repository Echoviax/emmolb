import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';
import userdbPromise from '@/sqlite/userdb'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { league_name, league_emoji, league_color, league_id } = body;

        const db = await dbPromise;
        const owner = await db.get('SELECT owner_id FROM league_owners WHERE league_id = ?', league_id)
        if (owner) {
            const cookie = req.cookies.get('session')?.value;
            if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

            const userdb = await userdbPromise;
            const session = await userdb.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
            if (!session) return NextResponse.json({ error: 'Unauthorized (Mismatch in cookies)' }, { status: 401 });
            if (session.user_id != owner.owner_id) return NextResponse.json({ error: 'Unauthorized (Not the leagues owner)' }, { status: 401 });
        }
        await db.run(
            `UPDATE leagues SET league_name = ?, league_emoji = ?, league_color = ? WHERE league_id = ?`,
            league_name,
            league_emoji,
            league_color,
            league_id
        );

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
