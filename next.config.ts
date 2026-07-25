import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable image optimization in development to prevent SSRF block on localhost
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'malik-backend-orht.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.caribee.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.trycloudflare.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
