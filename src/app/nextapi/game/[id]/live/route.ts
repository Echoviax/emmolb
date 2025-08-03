import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const after = req.nextUrl.searchParams.get('after') ?? '0';
  const limit = Number(req.nextUrl.searchParams.get('limit')) ?? undefined;
  if (limit && limit < 0)
    return new Response(null, {status: 400, statusText: 'limit must be positive'});

  const response = await fetch(`https://mmolb.com/api/game/${id}/live?after=${after}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    return new Response(null, { status: response.status, statusText: response.statusText });
  }

  let data = await response.json();
  if (limit) {
    data = {
      ...data,
      entries: data.entries?.slice(-limit) ?? [],
    }
  };

  // Otherwise return the data as usual
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
