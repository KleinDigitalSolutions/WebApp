import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung - TrackFood',
  description: 'Datenschutzerklärung für TrackFood (Klein Digital Solutions): Welche Daten werden wie verarbeitet? Alles zu Cookies, Supabase, KI, Analytics und mehr.',
};

const DatenschutzPage = () => {
  return (
    <main className="flex-grow py-12 md:py-16 px-4 bg-black text-gray-300">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Datenschutzerklärung</h1>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="leading-relaxed mb-6">
              Wir freuen uns über Ihr Interesse an TrackFood. Der Schutz Ihrer Privatsphäre ist für uns sehr wichtig. Nachfolgend informieren wir Sie ausführlich über den Umgang mit Ihren Daten.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">1. Verantwortlicher im Sinne der DSGVO</h2>
            <div className="space-y-1 mb-6">
              <p>Özgür Azap / Klein Digital Solutions</p>
              <p>Wittbräuckerstraße 109, 44287 Dortmund, Deutschland</p>
              <p>
                <a href="mailto:info@kleindigitalsolutions.de" className="text-blue-400 hover:text-blue-300 transition-colors">
                  info@kleindigitalsolutions.de
                </a>
              </p>
            </div>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">2. Welche Daten werden verarbeitet?</h2>
            <ul className="list-disc list-inside space-y-1 mb-6">
              <li>Accountdaten (E-Mail, Name, ggf. Google-Login)</li>
              <li>Ernährungstagebuch, Profil, Unverträglichkeiten, Ziele</li>
              <li>Barcode-Scans (Produktdaten, Verlauf)</li>
              <li>KI-Chat-Anfragen (Ernährungsanalyse, Empfehlungen)</li>
              <li>Server-Logfiles (IP, Browser, Zeitstempel, technisch notwendig)</li>
              <li>Cookies (Session, Consent, Analytics)</li>
              <li>Analysedaten (z.B. Google Analytics, anonymisiert)</li>
            </ul>
            <p className="mb-6">
              Die Daten werden ausschließlich zur Bereitstellung, Verbesserung und Sicherheit der App verwendet. Es erfolgt keine Weitergabe an Dritte zu Werbezwecken.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">3. Hosting & Datenbank</h2>
            <p className="mb-4">
              TrackFood wird bei Vercel (Hosting) und Supabase (Datenbank, Authentifizierung) betrieben. Die Daten werden in der EU gespeichert.
            </p>
            <p className="mb-6">
              Weitere Informationen zum Datenschutz bei Vercel: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">https://vercel.com/legal/privacy-policy</a><br/>
              Supabase: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">https://supabase.com/privacy</a>
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">4. KI-Integration & Produktdaten</h2>
            <p className="mb-4">
              Für personalisierte Empfehlungen werden Tagebuchdaten an die KI (Groq API) gesendet. Produktdaten werden über OpenFoodFacts geladen. Es werden keine personenbezogenen Daten an Dritte weitergegeben.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">5. Cookies & Analyse</h2>
            <p className="mb-4">
              Wir verwenden Cookies für die Anmeldung, Session, Consent und zur anonymisierten Analyse (Google Analytics). Sie können Ihre Cookie-Einstellungen jederzeit anpassen.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">6. Ihre Rechte</h2>
            <p className="mb-4">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten sowie das Recht auf Datenübertragbarkeit und Widerspruch. Kontaktieren Sie uns dazu unter info@kleindigitalsolutions.de.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">7. Änderungen</h2>
            <p className="text-sm text-gray-500">Stand: Juli 2025</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DatenschutzPage;
