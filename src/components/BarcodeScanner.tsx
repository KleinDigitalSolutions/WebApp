'use client'

import { useEffect, useRef, useState } from 'react'
import Quagga from '@ericblade/quagga2'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  isActive: boolean
}

export default function BarcodeScanner({ onScan, onClose, isActive }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Browser-Kompatibilitätsprüfung
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('🚫 Dein Browser unterstützt keine Kamera-API. Bitte verwende Chrome, Firefox oder Safari.')
      setIsLoading(false)
      return
    }

    // iOS-spezifische Warnungen
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = (window.navigator as any)?.standalone === true
    
    if (isIOS && isStandalone) {
      setError('📱 Barcode-Scanner funktioniert auf iOS nicht in PWA-Modus. Bitte öffne die App direkt in Safari.')
      setIsLoading(false)
      return
    }

    const initializeScanner = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Explizit um Kamera-Zugriff bitten (wichtig für mobile Browser!)
        let stream: MediaStream
        try {
          // Mobile-optimierte Constraints für bessere Kompatibilität
          const constraints = {
            video: {
              facingMode: { ideal: 'environment' }, // Rückkamera bevorzugen
              width: { min: 320, ideal: 640, max: 1280 },
              height: { min: 240, ideal: 480, max: 720 },
              aspectRatio: { ideal: 1.333 }, // 4:3 für bessere Barcode-Erkennung
              frameRate: { ideal: 15, max: 30 } // Batterie schonen
            }
          }
          
          stream = await navigator.mediaDevices.getUserMedia(constraints)
          console.log('✅ Kamera-Zugriff erteilt')
          
          // Stream wieder stoppen, Quagga übernimmt das Management
          stream.getTracks().forEach(track => track.stop())
        } catch (err: unknown) {
          console.error('❌ Kamera-Zugriff Fehler:', err)
          
          // Spezifische Fehlermeldungen basierend auf getUserMedia() Errors
          let errorMessage = 'Kamera-Zugriff erforderlich.'
          
          if (err instanceof Error) {
            switch (err.name) {
              case 'NotAllowedError':
                errorMessage = '📷 Kamera-Berechtigung verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen und lade die Seite neu.'
                break
              case 'NotFoundError':
                errorMessage = '📷 Keine Kamera gefunden. Stelle sicher, dass eine Kamera angeschlossen ist.'
                break
              case 'NotReadableError':
                errorMessage = '📷 Kamera wird bereits von einer anderen App verwendet. Schließe andere Apps und versuche es erneut.'
                break
              case 'OverconstrainedError':
                errorMessage = '📷 Kamera unterstützt nicht die erforderlichen Einstellungen. Versuche es mit einer anderen Kamera.'
                break
              case 'SecurityError':
                errorMessage = '🔒 Sicherheitsfehler: Barcode-Scanner funktioniert nur über HTTPS oder localhost.'
                break
              case 'TypeError':
                errorMessage = '⚠️ Browser unterstützt keine Kamera-API. Bitte verwende einen modernen Browser (Chrome, Firefox, Safari).'
                break
              default:
                errorMessage = `📷 Kamera-Fehler: ${err.message || 'Unbekannter Fehler'}. Bitte lade die Seite neu.`
            }
          }
          
          setError(errorMessage)
          setIsLoading(false)
          return
        }

        // Sicherheitsprüfung für Scanner-Element
        if (!scannerRef.current) {
          setError('Scanner-Element konnte nicht gefunden werden.')
          setIsLoading(false)
          return
        }

        // Quagga2 Konfiguration für mobile Browser optimiert
        const config = {
          inputStream: {
            name: 'Live',
            type: 'LiveStream' as const,
            target: scannerRef.current,
            constraints: {
              width: { min: 320, ideal: 640, max: 1280 },
              height: { min: 240, ideal: 480, max: 720 },
              facingMode: 'environment', // Rückkamera für Barcode-Scanning
              aspectRatio: { min: 1, max: 2 }
            },
            area: { // Scan-Bereich optimiert für mobile
              top: '25%',
              right: '15%', 
              left: '15%',
              bottom: '25%'
            }
          },
          decoder: {
            readers: [
              'ean_reader' as const,      // EAN-13 (Standard deutsche Barcodes)
              'ean_8_reader' as const,    // EAN-8 (kurze Barcodes)
              'code_128_reader' as const  // Code 128 (deutsche Supermärkte)
            ],
            debug: {
              drawBoundingBox: true,
              showFrequency: false,
              drawScanline: true,
              showPattern: false
            }
          },
          locator: {
            patchSize: 'medium',
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency > 2 ? 2 : 1, // CPU-optimiert
          frequency: 10, // Scan-Frequenz für mobile
          locate: true
        }

        await new Promise<void>((resolve, reject) => {
          Quagga.init(config, (err) => {
            if (err) {
              console.error('Quagga initialization error:', err)
              reject(err)
              return
            }
            resolve()
          })
        })

        // Barcode Detection Handler
        Quagga.onDetected((data) => {
          const code = data.codeResult.code
          console.log('📱 Barcode erkannt:', code)
          
          // Validiere EAN-13 Format (13 Ziffern)
          if (code && /^\d{13}$/.test(code)) {
            onScan(code)
            stopScanner()
          } else if (code && /^\d{8}$/.test(code)) {
            // EAN-8 zu EAN-13 konvertieren (mit führenden Nullen)
            const ean13 = '00000' + code
            onScan(ean13)
            stopScanner()
          }
        })

        Quagga.start()
        setIsLoading(false)

      } catch (err) {
        console.error('Scanner initialization failed:', err)
        setError('Kamera konnte nicht initialisiert werden. Stelle sicher, dass dein Browser Kamera-Zugriff unterstützt.')
        setIsLoading(false)
      }
    }

    const stopScanner = () => {
      try {
        Quagga.stop()
        Quagga.offDetected()
        Quagga.offProcessed()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }

    initializeScanner()

    // Cleanup beim Unmount
    return () => {
      stopScanner()
    }
  }, [isActive, onScan])

  const handleClose = () => {
    try {
      Quagga.stop()
      Quagga.offDetected()
      Quagga.offProcessed()
    } catch (err) {
      console.error('Error closing scanner:', err)
    }
    onClose()
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Schließen
          </button>
          <h2 className="text-lg font-semibold">Barcode scannen</h2>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Kamera wird initialisiert...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center text-white max-w-md mx-4">
              <div className="text-red-400 text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Kamera-Zugriff erforderlich</h3>
              <p className="text-white/80 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  🔄 Erneut versuchen
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  ❌ Schließen
                </button>
              </div>
              <div className="mt-4 text-xs text-white/60">
                <p>📱 <strong>Mobile Browser:</strong> Erlaube Kamera-Zugriff in den Browser-Einstellungen</p>
                <p>💡 <strong>Tipp:</strong> Teste mit verschiedenen Browsern (Chrome, Safari, Firefox)</p>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center text-white max-w-md mx-4">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold mb-2">Barcode Scanner</h3>
              <p className="text-white/80 mb-4">Halte den Barcode in den weißen Rahmen</p>
              <div className="text-xs text-white/60">
                <p>✅ EAN-13, EAN-8, Code-128 werden unterstützt</p>
                <p>🇩🇪 Optimiert für deutsche Supermarkt-Produkte</p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Target */}
        <div ref={scannerRef} className="w-full h-full" />

        {/* Scan Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-black/50" />
          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/50" />
          {/* Left overlay */}
          <div className="absolute top-1/4 bottom-1/4 left-0 w-1/6 bg-black/50" />
          {/* Right overlay */}
          <div className="absolute top-1/4 bottom-1/4 right-0 w-1/6 bg-black/50" />
          
          {/* Scan frame */}
          <div className="absolute top-1/4 bottom-1/4 left-1/6 right-1/6 border-2 border-white/80 rounded-lg">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="text-center text-white">
            <p className="text-lg mb-2">🎯 Halte den Barcode in den Rahmen</p>
            <p className="text-white/70 text-sm">
              Der Scanner erkennt automatisch EAN-13 und EAN-8 Barcodes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
