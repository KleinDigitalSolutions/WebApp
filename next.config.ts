import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst' as any,
      options: {
        cacheName: 'http-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 Woche
        },
      },
    },
  ],
};

const images = {
  remotePatterns: [
    { protocol: 'https', hostname: 'www.lecker.de', port: '', pathname: '/**' },
    { protocol: 'https', hostname: 'img.lecker.de', port: '', pathname: '/**' },
    { protocol: 'https', hostname: 'media.lecker.de', port: '', pathname: '/**' },
    { protocol: 'https', hostname: 'images.lecker.de', port: '', pathname: '/**' },
  ],
};

const config = withPWA(pwaConfig);
(config as any).images = images;
(config as any).output = 'export';

export default config;
