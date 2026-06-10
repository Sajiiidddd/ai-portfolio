// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional integrations — kept external so the build never fails when they aren't
  // installed. They're lazy-loaded at runtime only when their env keys are set.
  serverExternalPackages: ['nodemailer', 'resend', '@upstash/ratelimit', '@upstash/redis'],
  typescript: {
    ignoreBuildErrors: true, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/image/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Add this to skip ESLint during build
  },
};

module.exports = nextConfig;
