// PWA-Konfiguration und Plugin entfernt für Static Export Test
const config = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.lecker.de', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'img.lecker.de', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'media.lecker.de', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.lecker.de', port: '', pathname: '/**' },
    ],
  },
  output: 'export',
};

export default config;
