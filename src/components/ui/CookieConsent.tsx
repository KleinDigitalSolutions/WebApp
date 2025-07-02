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
            className="fixed inset-0 bg-black/50 z-[99] lg:hidden"
            onClick={() => setShowDetails(false)}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 lg:p-8"
          >
            <div className="bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-6xl mx-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Cookies & Datenschutz
                    </h3>
                    <p className="text-sm sm:text-base text-light/80 leading-relaxed">
                      TrackFood verwendet Cookies, um die Anmeldung, Session und Analyse zu ermöglichen. Wir speichern keine Werbe- oder Marketingdaten. Sie können Analytics-Cookies ablehnen oder akzeptieren. Weitere Infos in unserer Datenschutzerklärung.
                    </p>
                  </div>
                  <button
                    onClick={() => handleConsent('denied')}
                    className="hidden sm:block p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Banner schließen"
                  >
                    <X className="w-5 h-5 text-light/60" />
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors mb-4 flex items-center gap-2"
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
                      <div className="mb-6 p-4 bg-white/5 rounded-xl">
                        <h4 className="text-sm font-semibold text-white mb-3">Cookie-Kategorien:</h4>
                        <ul className="space-y-2 text-sm text-light/70">
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <div>
                              <strong className="text-white">Notwendig:</strong> Essentiell für Login, Session und Sicherheit (immer aktiv)
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">○</span>
                            <div>
                              <strong className="text-white">Analyse:</strong> Anonymisierte Nutzungsauswertung (Google Analytics, optional)
                            </div>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="flex-1 text-xs sm:text-sm text-light/60">
                    Weitere Details in unserer{' '}
                    <Link href="/datenschutz" className="text-primary hover:text-primary/80 underline transition-colors">
                      Datenschutzerklärung
                    </Link>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConsent('denied')}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all text-sm font-medium"
                    >
                      Nur Notwendige
                    </button>
                    <button
                      onClick={() => handleConsent('granted')}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all text-sm font-medium"
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