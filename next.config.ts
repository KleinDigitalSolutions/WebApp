import withPWA from 'next-pwa';
const pwaConfig = require('./pwa.config.js');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // explizit als Literal
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
    ] satisfies {
      protocol: 'https';
      hostname: string;
      port: string;
      pathname: string;
    }[],
  },
};

export default withPWA(pwaConfig)(nextConfig);
