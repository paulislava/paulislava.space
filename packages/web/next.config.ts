import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.paulislava.space',
      },
      {
        protocol: 'https',
        hostname: 'cdn.beznomera.net',
      },
    ],
  },
};

export default nextConfig;
