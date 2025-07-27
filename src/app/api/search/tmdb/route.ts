import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;

  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    query
  )}&api_key=${apiKey}&include_adult=false`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const results = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      subtitle: movie.release_date?.split('-')[0] || '',
      year: movie.release_date?.split('-')[0] || '',
      imageUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error('TMDB search error:', err);
    return NextResponse.json({ error: 'Failed to fetch TMDB data' }, { status: 500 });
  }
}
