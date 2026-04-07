import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;

  const upstreamParams = new URLSearchParams({ team: id, limit: '100' });
  const cursor = searchParams.get('cursor');
  if (cursor) upstreamParams.set('cursor', cursor);

  const response = await fetch(`https://mmolb.com/api/feed?${upstreamParams}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 0 }, // Make sure it's not cached
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
