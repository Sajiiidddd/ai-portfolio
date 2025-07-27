// app/recommendations/interfaces.ts

// Represents a movie/song item as returned by an external API search
export interface ExternalContentSearchResult {
  externalId: string; // The ID from TMDB or Spotify
  type: 'movie' | 'song';
  title: string;
  subtitle: string; // Director for movies, Artist for songs
  imageUrl: string; // URL to the poster/album art
  year?: string; // Optional: Release year for movies, album year for songs
}

// Represents a recommendation stored in our database
export interface Recommendation {
  id: string; // Our internal unique ID for the recommendation
  externalId: string; // The ID from TMDB or Spotify
  type: 'movie' | 'song';
  title: string;
  subtitle: string; // Director for movies, Artist for songs
  imageUrl: string; // URL to the poster/album art
  year?: string; // Optional: Release year for movies, album year for songs
  recommendedBy: string;
  review: string;
  upvotes: number;
  downvotes: number;
  timestamp: number; // Unix timestamp for creation date
}