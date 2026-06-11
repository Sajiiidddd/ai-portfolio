import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type ITunesTrack = {
  trackId?: number; collectionId?: number;
  trackName?: string; artistName?: string;
  artworkUrl100?: string; releaseDate?: string;
};

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json([]);
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=12`;
    const r = await fetch(url, { headers: { 'User-Agent': 'portfolio-recs' }, next: { revalidate: 3600 } });
    if (!r.ok) return NextResponse.json({ error: 'Search unavailable.' }, { status: 502 });
    const data = await r.json();
    const results = ((data.results as ITunesTrack[]) || []).map((t) => ({
      id: String(t.trackId ?? t.collectionId ?? `${t.trackName}-${t.artistName}`),
      title: t.trackName ?? '',
      subtitle: t.artistName ?? '',
      imageUrl: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : null,
      year: t.releaseDate ? t.releaseDate.slice(0, 4) : '',
    })).filter((x) => x.title);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'Search unavailable.' }, { status: 502 });
  }
}
