// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**', // This allows any path under /t/p/
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/image/**', // This allows any path under /image/
      },
      // Add other hostnames here if you use other image sources later
    ],
  },
};

module.exports = nextConfig;