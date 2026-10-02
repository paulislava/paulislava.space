import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [{
      source: '/zakazat-sait-avtomatizaciyu',
      destination: '/',
      permanent: false,
    }];
  },
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
