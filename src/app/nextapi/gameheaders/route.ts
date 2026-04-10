import type { NextRequest } from 'next/server';

// Handle CORS preflight OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Or restrict to your frontend origin
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { teamIds } = await req.json() as { teamIds: string[] };

    if (!Array.isArray(teamIds)) {
      return new Response(JSON.stringify({ error: 'teamIds must be an array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const gameIds = new Set<any>();
    const gamesPromises = teamIds.map(async (teamId) => {
      let gameId = null;
      const gameRes = await fetch(`https://mmolb.com/api/game-by-team/${teamId}`);

      if (!gameRes.ok) {
        const teamRes = await fetch(`https://mmolb.com/api/team/${teamId}`);
        if (!teamRes.ok) return null;
        const teamData = await teamRes.json();
        if (!Array.isArray(teamData.Feed) || teamData.Feed.length === 0) {
          return null;
        }
        gameId = teamData.Feed[teamData.Feed.length - 1].links[2].id;
      } else {
        const gameData = await gameRes.json();
        gameId = gameData.game_id;
      }

      if (gameIds.has(gameId))
        return null;
      gameIds.add(gameId);

      const gameHeaderRes = await fetch(`https://emmolb.com/nextapi/gameheader/${gameId}`);
      if (!gameHeaderRes.ok) return null;

      const gameHeader = await gameHeaderRes.json();

      return { teamId, gameHeader };
    });

    const results = await Promise.all(gamesPromises);
    const filtered = results.filter(r => r !== null);

    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // This is crucial!
      },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
