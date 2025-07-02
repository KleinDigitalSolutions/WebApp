import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.lecker.de',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.lecker.de',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.lecker.de',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.lecker.de',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
