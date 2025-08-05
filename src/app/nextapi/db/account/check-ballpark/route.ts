import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/userdb';

export async function POST(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    const { teamId } = await req.json();
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await dbPromise;
    const session = await db.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ballpark = await db.get(`SELECT ballpark_check FROM user_mmolb_links WHERE user_id = ?`, session.user_id);
    if (!ballpark) return NextResponse.json({ error: 'Authentication not started' }, { status: 401 });

    const response = await fetch(`https://mmolb.com/api/team/${teamId}`, {
        headers: {
            'Accept': 'application/json',
        },
        next: { revalidate: 0 }, // Make sure it's not cached
    });

    const data = await response.json();
    if (data.BallparkName !== ballpark.ballpark_check)
        return NextResponse.json({ error: `Ballpark does not match, ${data.BallparkName}` }, { status: 403 });
    
    await db.run(`UPDATE user_mmolb_links SET mmolb_team_id = ?, ballpark_check = NULL WHERE user_id = ?`, teamId, session.user_id);

    return NextResponse.json({ success: true });
}
