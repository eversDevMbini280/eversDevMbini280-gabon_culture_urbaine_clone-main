import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Avoid image optimizer hitting localhost in dev (private IP block).
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gabon-culture-urbaine.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gabon-culture-urbaine-1.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gaboncultureurbaine.up.railway.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gabon-culture-urbaine-api-production.up.railway.app',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
