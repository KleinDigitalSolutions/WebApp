import withPWA from 'next-pwa';

const nextConfig = {
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

export default withPWA(nextConfig);
