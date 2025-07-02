import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const LIVE_URL = "https://trackfood.app";

export default function DesktopNotice() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Zeige Overlay nur auf Desktop (ab 1024px)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setShow(true);
      // Für sanften Effekt: erst nach Mount sichtbar machen
      setTimeout(() => setVisible(true), 30);
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center text-center relative transform transition-all duration-400 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={() => setShow(false)}
          aria-label="Overlay schließen"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2 text-emerald-600">TrackFood ist eine mobile Web-App</h2>
        <p className="mb-4 text-gray-700">
          Für das beste Erlebnis öffne TrackFood auf deinem Smartphone.<br />
          <span className="text-sm text-gray-500">Scanne den QR-Code, um direkt zur App zu gelangen:</span>
        </p>
        <div className="bg-white p-2 rounded-lg border mb-4">
          <QRCodeSVG value={LIVE_URL} size={128} fgColor="#10b981" />
        </div>
        <span className="text-xs text-gray-400">Oder besuche: <br /><span className="break-all">{LIVE_URL}</span></span>
      </div>
    </div>
  );
}
