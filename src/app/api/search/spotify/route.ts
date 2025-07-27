import { NextResponse } from 'next/server'

let accessToken: string | null = null;
let tokenExpiry = 0;

async function getSpotifyAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();

  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return accessToken;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const token = await getSpotifyAccessToken();

    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    const results = (data.tracks?.items || []).map((track: any) => ({
      id: track.id,
      title: track.name,
      subtitle: track.artists.map((a: any) => a.name).join(', '),
      imageUrl: track.album.images?.[0]?.url || null,
      year: track.album.release_date?.split('-')[0] || '',
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error('Spotify search error:', err);
    return NextResponse.json({ error: 'Failed to fetch Spotify data' }, { status: 500 });
  }
}
