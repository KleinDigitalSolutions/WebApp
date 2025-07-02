// GoogleTagManagerClient.tsx
'use client';
import { useEffect } from 'react';
import { useAnalyticsConsent } from './CookieConsent';

const GTM_ID = 'GTM-M3HLRQP8';

const GoogleTagManagerClient = () => {
  const analyticsConsent = useAnalyticsConsent();

  useEffect(() => {
    if (!analyticsConsent) return;
    if (!GTM_ID) return;
    if (document.getElementById('gtm-script')) return;
    // GTM Script
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `;
    script.type = 'text/javascript';
    document.head.appendChild(script);
    // noscript fallback
    const noscript = document.createElement('noscript');
    noscript.id = 'gtm-noscript';
    noscript.innerHTML = `<iframe src=\"https://www.googletagmanager.com/ns.html?id=${GTM_ID}\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>`;
    document.body.prepend(noscript);
    return () => {
      script.remove();
      const ns = document.getElementById('gtm-noscript');
      if (ns) ns.remove();
    };
  }, [analyticsConsent]);

  return null;
};

export default GoogleTagManagerClient;
