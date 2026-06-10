import NextAuth from 'next-auth';
import { spotifyAuthOptions } from '@/lib/spotify-auth';

const handler = NextAuth(spotifyAuthOptions);

export { handler as GET, handler as POST };
