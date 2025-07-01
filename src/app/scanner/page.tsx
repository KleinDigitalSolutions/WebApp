'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Plus } from 'lucide-react'
import BarcodeScanner from '@/components/BarcodeScanner'

interface ScannedProduct {
  code: string
  name: string
  brand: string
  image_url?: string
  nutrition: {
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    fiber_per_100g: number
    sugar_per_100g: number
    salt_per_100g: number
  }
  category?: string
  stores?: string[]
  source: string
  country: string
}

export default function ScannerPage() {
  const router = useRouter()
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleBarcodeScanned = async (barcode: string) => {
    console.log('🔍 Barcode gescannt:', barcode)
    setIsScanning(false)
    setLoading(true)

    try {
      const response = await fetch(`/api/food/barcode?barcode=${encodeURIComponent(barcode)}`)
      const data = await response.json()

      if (data.success && data.product) {
        setScannedProduct(data.product)
      } else {
        alert(`❌ Produkt mit Barcode ${barcode} nicht gefunden.\n\n${data.message || 'Das Produkt ist möglicherweise nicht in unserer Datenbank.'}\n\nMöchtest du es manuell hinzufügen?`)
        setIsScanning(true) // Zurück zum Scanner
      }
    } catch (error) {
      console.error('Fehler beim Barcode-Lookup:', error)
      alert('❌ Fehler beim Scannen. Versuche es erneut.')
      setIsScanning(true) // Zurück zum Scanner
    } finally {
      setLoading(false)
    }
  }

  const handleAddToDiary = (mealType: string) => {
    if (!scannedProduct) return
    
    // Navigiere zur Add Food Seite mit dem gescannten Produkt
    const params = new URLSearchParams({
      meal: mealType,
      barcode: scannedProduct.code,
      name: scannedProduct.name,
      brand: scannedProduct.brand
    })
    
    router.push(`/diary/add?${params.toString()}`)
  }

  const handleScanAnother = () => {
    setScannedProduct(null)
    setIsScanning(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Produkt wird gesucht...</p>
        </div>
      </div>
    )
  }

  if (scannedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Produkt gescannt</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Produkt Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-start gap-4">
              {scannedProduct.image_url ? (
                <Image 
                  src={scannedProduct.image_url} 
                  alt={scannedProduct.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-2xl border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-400 text-xs text-center">Kein Bild</span>
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{scannedProduct.name}</h2>
                <p className="text-gray-600 mb-2">{scannedProduct.brand}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {scannedProduct.source === 'local_german_db' ? '🇩🇪 Lokal' : 
                     scannedProduct.source === 'openfoodfacts' ? '🌍 OpenFoodFacts' : 
                     '👥 Community'}
                  </span>
                  {scannedProduct.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {scannedProduct.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Nährwerte */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nährwerte pro 100g</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-3 rounded-xl">
                  <div className="text-orange-600 text-2xl font-bold">{scannedProduct.nutrition.calories_per_100g}</div>
                  <div className="text-orange-700 text-sm">Kalorien</div>
                </div>
                <div className="bg-red-50 p-3 rounded-xl">
                  <div className="text-red-600 text-2xl font-bold">{scannedProduct.nutrition.protein_per_100g}g</div>
                  <div className="text-red-700 text-sm">Protein</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="text-blue-600 text-2xl font-bold">{scannedProduct.nutrition.carbs_per_100g}g</div>
                  <div className="text-blue-700 text-sm">Kohlenhydrate</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <div className="text-yellow-600 text-2xl font-bold">{scannedProduct.nutrition.fat_per_100g}g</div>
                  <div className="text-yellow-700 text-sm">Fett</div>
                </div>
              </div>
            </div>
          </div>

          {/* Zu Mahlzeit hinzufügen */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zu Mahlzeit hinzufügen</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddToDiary('breakfast')}
                className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="h-5 w-5 mx-auto mb-1" />
                Frühstück
              </button>
              <button
                onClick={() => handleAddToDiary('lunch')}
                className="p-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="h-5 w-5 mx-auto mb-1" />
                Mittagessen
              </button>
              <button
                onClick={() => handleAddToDiary('dinner')}
                className="p-4 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="h-5 w-5 mx-auto mb-1" />
                Abendessen
              </button>
              <button
                onClick={() => handleAddToDiary('snacks')}
                className="p-4 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="h-5 w-5 mx-auto mb-1" />
                Snacks
              </button>
            </div>
          </div>

          {/* Weiteres Produkt scannen */}
          <button
            onClick={handleScanAnother}
            className="w-full p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium shadow-sm active:scale-95 transition-transform"
          >
            Weiteres Produkt scannen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <BarcodeScanner
        isActive={isScanning}
        onScan={handleBarcodeScanned}
        onClose={() => router.back()}
      />
    </div>
  )
}
