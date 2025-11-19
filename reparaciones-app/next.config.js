/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cache busting configuration - prevents browser/CDN caching issues
  generateEtags: false,
  // Force full rebuild on every deploy
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
