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

    const initializeScanner = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Prüfe Kamera-Permission
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })

        if (permission.state === 'denied') {
          setError('Kamera-Zugriff verweigert. Bitte erlaube den Kamera-Zugriff in den Browser-Einstellungen.')
          setIsLoading(false)
          return
        }

        // Sicherheitsprüfung für Scanner-Element
        if (!scannerRef.current) {
          setError('Scanner-Element konnte nicht gefunden werden.')
          setIsLoading(false)
          return
        }

        // Quagga2 Konfiguration für deutsche EAN-13 Barcodes
        const config = {
          inputStream: {
            name: 'Live',
            type: 'LiveStream' as const,
            target: scannerRef.current,
            constraints: {
              width: { min: 640, ideal: 1280 },
              height: { min: 480, ideal: 720 },
              facingMode: 'environment', // Rückkamera bevorzugen
              aspectRatio: { min: 1, max: 2 }
            },
            area: { // Scan-Bereich einschränken für bessere Performance
              top: '20%',
              right: '10%', 
              left: '10%',
              bottom: '20%'
            }
          },
          decoder: {
            readers: [
              'ean_reader' as const,    // EAN-13, EAN-8 (deutsche Barcodes)
              'ean_8_reader' as const,  // Explizit EAN-8
              'code_128_reader' as const, // Code 128 (häufig bei deutschen Produkten)
              'upc_reader' as const,    // UPC-A (internationale Produkte)
              'upc_e_reader' as const   // UPC-E
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
          numOfWorkers: 2,
          frequency: 10,
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
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2">Kamera-Fehler</h3>
              <p className="text-white/80 mb-6">{error}</p>
              <button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Zurück
              </button>
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
