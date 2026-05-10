/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lexaureon.com' }],
        destination: 'https://www.lexaureon.com/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
