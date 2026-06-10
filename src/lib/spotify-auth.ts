import type { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import type { JWT } from 'next-auth/jwt';

type SpotifyToken = JWT & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
};

async function refreshSpotifyAccessToken(token: SpotifyToken): Promise<SpotifyToken> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || !token.refreshToken) {
    return { ...token, error: 'RefreshSpotifyTokenError' };
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    }).toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    return { ...token, error: 'RefreshSpotifyTokenError' };
  }

  return {
    ...token,
    accessToken: data.access_token as string,
    accessTokenExpires: Date.now() + ((data.expires_in ?? 3600) as number) * 1000,
    refreshToken: (data.refresh_token as string | undefined) ?? token.refreshToken,
    error: undefined,
  };
}

export const spotifyAuthOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
      authorization: { params: { scope: 'user-read-email user-read-private' } },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || process.env.IDENTITY_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      const current = token as SpotifyToken;

      if (account?.provider === 'spotify') {
        return {
          ...current,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          error: undefined,
        };
      }

      if (current.accessTokenExpires && Date.now() < current.accessTokenExpires - 60_000) {
        return current;
      }

      if (current.refreshToken) {
        return refreshSpotifyAccessToken(current);
      }

      return current;
    },
    async session({ session, token }) {
      const current = token as SpotifyToken;
      session.accessToken = current.accessToken;
      session.error = current.error;
      return session;
    },
  },
};
