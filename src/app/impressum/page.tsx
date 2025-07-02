import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum - TrackFood',
  description: 'Impressum und rechtliche Hinweise für TrackFood (Klein Digital Solutions).',
};

const ImpressumPage = () => {
  return (
    <main className="flex-grow py-12 md:py-16 px-4 bg-black text-gray-300">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-10">
          {/* Hinweis auf Hauptseite */}
          <div className="mb-6 text-center text-sm text-gray-400">
            Diese Seite ist ein Angebot von{' '}
            <a
              href="https://www.kleindigitalsolutions.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
            >
              www.kleindigitalsolutions.de
            </a>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Impressum
          </h1>

          <div className="prose prose-lg prose-invert max-w-none">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
              Angaben gemäß § 5 TMG
            </h2>
            <div className="space-y-1 mb-8">
              <p>Özgür Azap</p>
              <p>Klein Digital Solutions (Einzelunternehmen)</p>
              <p>Wittbräuckerstraße 109</p>
              <p>44287 Dortmund</p>
              <p>Deutschland</p>
            </div>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
              Kontakt
            </h2>
            <p className="mb-8">
              E-Mail:{' '}
              <a
                href="mailto:info@kleindigitalsolutions.de"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                info@kleindigitalsolutions.de
              </a>
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <div className="space-y-1 mb-8">
              <p>Özgür Azap</p>
              <p>Adresse wie oben</p>
            </div>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
              Online-Streitbeilegung
            </h2>
            <p className="mb-8">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              . Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
              Haftungsausschluss (Disclaimer)
            </h2>

            <h3 className="text-xl md:text-2xl font-semibold text-white mt-6 mb-3">
              Haftung für Inhalte
            </h3>
            <p className="mb-6">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h3 className="text-xl md:text-2xl font-semibold text-white mt-6 mb-3">
              Haftung für Links
            </h3>
            <p className="mb-6">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 className="text-xl md:text-2xl font-semibold text-white mt-6 mb-3">
              Urheberrecht
            </h3>
            <p className="mb-6">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ImpressumPage;
