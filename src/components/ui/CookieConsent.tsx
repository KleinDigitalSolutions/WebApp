'use client';

import { useEffect, useState } from 'react';
import { Cookie, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Definieren, wie das Consent-Objekt für Google aussieht
interface GtagConsent {
  ad_storage?: 'granted' | 'denied';
  analytics_storage?: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
}

declare global {
  interface Window {
    gtag?: (command: 'consent', action: 'update', params: GtagConsent) => void;
  }
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cookieConsentKey = 'trackfood_cookie_consent_v1';

  useEffect(() => {
    const consentGiven = localStorage.getItem(cookieConsentKey);
    if (!consentGiven) {
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleConsent = (consent: 'granted' | 'denied') => {
    const consentState: GtagConsent = {
      analytics_storage: consent,
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      ad_storage: 'denied',
    };
    if (window.gtag) {
      window.gtag('consent', 'update', consentState);
    }
    localStorage.setItem(cookieConsentKey, JSON.stringify(consentState));
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[99] lg:hidden"
            onClick={() => setShowDetails(false)}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 lg:p-8"
          >
            <div className="liquid-glass-bg glass-glow border border-emerald-100/60 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl mx-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-200/60 to-emerald-400/80 flex items-center justify-center shadow-lg">
                    <Cookie className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-2 drop-shadow">Cookies & Datenschutz</h3>
                    <p className="text-sm sm:text-base text-emerald-900/80 leading-relaxed">
                      TrackFood verwendet Cookies, um die Anmeldung, Session und Analyse zu ermöglichen. Wir speichern keine Werbe- oder Marketingdaten. Sie können Analytics-Cookies ablehnen oder akzeptieren. Weitere Infos in unserer Datenschutzerklärung.
                    </p>
                  </div>
                  <button
                    onClick={() => handleConsent('denied')}
                    className="hidden sm:block p-2 rounded-full hover:bg-emerald-100/40 transition-colors"
                    aria-label="Banner schließen"
                  >
                    <X className="w-5 h-5 text-emerald-400" />
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-emerald-700 hover:text-emerald-900 transition-colors mb-4 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {showDetails ? 'Details ausblenden' : 'Weitere Informationen'}
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-6 p-4 bg-emerald-50/80 rounded-xl">
                        <h4 className="text-sm font-semibold text-emerald-900 mb-3">Cookie-Kategorien:</h4>
                        <ul className="space-y-2 text-sm text-emerald-900/80">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <div>
                              <strong className="text-emerald-900">Notwendig:</strong> Essentiell für Login, Session und Sicherheit (immer aktiv)
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">○</span>
                            <div>
                              <strong className="text-emerald-900">Analyse:</strong> Anonymisierte Nutzungsauswertung (Google Analytics, optional)
                            </div>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-2">
                  <div className="flex-1 text-xs sm:text-sm text-emerald-900/70">
                    Weitere Details in unserer{' '}
                    <Link href="/datenschutz" className="text-emerald-700 hover:text-emerald-900 underline transition-colors">
                      Datenschutzerklärung
                    </Link>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConsent('denied')}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-emerald-200 text-emerald-700 bg-white/80 hover:bg-emerald-50 transition-all text-sm font-medium shadow"
                    >
                      Nur Notwendige
                    </button>
                    <button
                      onClick={() => handleConsent('granted')}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-400/30 transition-all text-sm font-medium shadow"
                    >
                      Alle akzeptieren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Custom Hook: Analytics Consent
export function useAnalyticsConsent() {
  const cookieConsentKey = 'trackfood_cookie_consent_v1';
  const [analyticsGranted, setAnalyticsGranted] = useState<boolean>(false);
  useEffect(() => {
    const consent = localStorage.getItem(cookieConsentKey);
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setAnalyticsGranted(parsed.analytics_storage === 'granted');
      } catch {
        setAnalyticsGranted(false);
      }
    }
  }, []);
  return analyticsGranted;
}

export default CookieConsent;