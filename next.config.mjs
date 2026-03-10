/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gabon-culture-urbaine-1.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;