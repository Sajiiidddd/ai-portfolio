import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { spotifyAuthOptions } from '@/lib/spotify-auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });

  const session = await getServerSession(spotifyAuthOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Spotify login required', detail: 'Connect Spotify to search songs.' }, { status: 401 });
  }
  if (session.error) {
    return NextResponse.json({ error: 'Spotify session expired', detail: 'Please reconnect Spotify.' }, { status: 401 });
  }

  try {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=6`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[spotify search]', res.status, data?.error);
      return NextResponse.json({ error: `Spotify search failed (${res.status})`, detail: data?.error?.message || data?.error || null }, { status: res.status });
    }
    const results = (data.tracks?.items || []).map((t: any) => ({
      id: t.id,
      title: t.name,
      subtitle: t.artists?.map((a: any) => a.name).join(', ') || '',
      imageUrl: t.album?.images?.[0]?.url || null,
      year: t.album?.release_date?.split('-')[0] || '',
    }));
    return NextResponse.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch Spotify data';
    console.error('[spotify search]', msg);
    return NextResponse.json({ error: 'Spotify search unavailable', detail: msg }, { status: 500 });
  }
}
