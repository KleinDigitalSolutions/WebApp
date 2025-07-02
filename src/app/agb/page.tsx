import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AGB - TrackFood',
  description: 'Allgemeine Geschäftsbedingungen für die Nutzung von TrackFood (Klein Digital Solutions).',
};

const AGBPage = () => {
  return (
    <main className="flex-grow py-12 md:py-16 px-4 bg-black text-gray-300">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="mb-6">
              Diese AGB regeln die Nutzung der Web-App TrackFood, bereitgestellt von Klein Digital Solutions, Wittbräuckerstraße 109, 44287 Dortmund. Mit der Nutzung der App erkennen Sie diese Bedingungen an.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">1. Leistungsumfang</h2>
            <p className="mb-6">
              TrackFood bietet Ernährungs-Tracking, KI-gestützte Empfehlungen, Barcode-Scanner, Produktdatenbank, Wasser- und Stimmungs-Tracking sowie weitere Funktionen zur Gesundheitsförderung. Die Nutzung ist für Endnutzer kostenlos.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">2. Registrierung & Account</h2>
            <p className="mb-6">
              Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Die angegebenen Daten müssen korrekt sein. Accounts dürfen nicht an Dritte weitergegeben werden.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">3. Datenschutz</h2>
            <p className="mb-6">
              Es gilt die <a href="/datenschutz" className="text-blue-400 hover:text-blue-300">Datenschutzerklärung</a>. Personenbezogene Daten werden nur zur Bereitstellung der App verarbeitet.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">4. Haftung</h2>
            <p className="mb-6">
              Die App dient ausschließlich der Information und ersetzt keine medizinische Beratung. Für Schäden, die aus der Nutzung entstehen, wird – außer bei Vorsatz oder grober Fahrlässigkeit – keine Haftung übernommen.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">5. Verfügbarkeit</h2>
            <p className="mb-6">
              TrackFood wird mit hoher Sorgfalt betrieben, es besteht jedoch kein Anspruch auf permanente Verfügbarkeit oder fehlerfreie Funktion.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">6. Urheberrecht</h2>
            <p className="mb-6">
              Alle Inhalte, Designs und Quellcodes sind urheberrechtlich geschützt. Die Nutzung ist nur im Rahmen der App gestattet.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">7. Änderungen</h2>
            <p className="mb-6">
              TrackFood behält sich vor, die AGB jederzeit zu ändern. Es gilt die jeweils aktuelle Fassung.
            </p>
            <hr className="border-gray-700 my-8" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">8. Schlussbestimmungen</h2>
            <p className="mb-6">
              Es gilt deutsches Recht. Gerichtsstand ist Dortmund.
            </p>
            <p className="text-sm text-gray-500">Stand: Juli 2025</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AGBPage;
