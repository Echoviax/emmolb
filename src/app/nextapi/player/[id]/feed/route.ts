import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const response = await fetch(`https://mmolb.com/api/feed?player=${id}`, {
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
