// PWA-Konfiguration für next-pwa
module.exports = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Beispiel für Caching-Strategien (kann angepasst werden)
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "http-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 Woche
        },
      },
    },
  ],
};
