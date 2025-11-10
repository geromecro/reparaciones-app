/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Minimalista design system v2.0 - Cache busting
  generateEtags: false,
  headers: async () => {
    return [
      {
        source: '/reparaciones/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
