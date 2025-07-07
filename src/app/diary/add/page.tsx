'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, Camera, Barcode, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import BarcodeScanner from '@/components/BarcodeScanner'
import InfiniteScrollFoodList from '@/components/InfiniteScrollFoodList'

interface FoodItem {
  code: string
  product_name: string
  image_url?: string
  nutriments: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    'fiber_100g'?: number
    'sugars_100g'?: number
    'salt_100g'?: number
  }
  serving_size?: string
  serving_quantity?: number
}

const getMealLabel = (meal: string): string => {
  const mealLabels = {
    breakfast: 'Frühstück',
    lunch: 'Mittagessen',
    dinner: 'Abendessen',
    snacks: 'Snacks'
  }
  return mealLabels[meal as keyof typeof mealLabels] || 'Unbekannt'
}

function AddFoodContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [adding, setAdding] = useState(false)
  const [mealType, setMealType] = useState<string>('breakfast')
  const [showScanner, setShowScanner] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showPhotoHint, setShowPhotoHint] = useState(false)
  const PAGE_SIZE = 20

  useEffect(() => {
    const meal = searchParams.get('meal')
    if (meal) {
      setMealType(meal)
    }
  }, [searchParams])

  const handleSearch = async (reset = true) => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const response = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}&limit=${PAGE_SIZE}&offset=${reset ? 0 : offset}`)
      const data = await response.json()
      if (response.ok) {
        if (reset) {
          setSearchResults(data.products || [])
        } else {
          setSearchResults(prev => [...prev, ...(data.products || [])])
        }
        setHasMore((data.products?.length || 0) === PAGE_SIZE)
        setOffset(reset ? PAGE_SIZE : offset + PAGE_SIZE)
      } else {
        setSearchResults([])
        setHasMore(false)
      }
    } catch {
      setSearchResults([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // Sofort-Suche: Bei jeder Eingabe ab 2 Zeichen automatisch suchen
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setOffset(0)
      setHasMore(true)
      handleSearch(true)
    } else {
      setSearchResults([])
      setHasMore(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleBarcodeScanned = async (barcode: string) => {
    console.log('🔍 Barcode gescannt:', barcode)
    setShowScanner(false)
    setLoading(true)

    try {
      const response = await fetch(`/api/food/barcode?barcode=${encodeURIComponent(barcode)}`)
      const data = await response.json()

      if (data.success && data.product) {
        // Konvertiere API-Antwort zu unserem FoodItem Format
        const foodItem: FoodItem = {
          code: data.product.code,
          product_name: data.product.name,
          image_url: data.product.image_url,
          nutriments: {
            'energy-kcal_100g': data.product.nutrition.calories_per_100g,
            'proteins_100g': data.product.nutrition.protein_per_100g,
            'carbohydrates_100g': data.product.nutrition.carbs_per_100g,
            'fat_100g': data.product.nutrition.fat_per_100g,
            'fiber_100g': data.product.nutrition.fiber_per_100g,
            'sugars_100g': data.product.nutrition.sugar_per_100g,
            'salt_100g': data.product.nutrition.salt_per_100g
          }
        }

        setSelectedFood(foodItem)
        setSearchResults([foodItem]) // Zeige das gescannte Produkt in den Ergebnissen
        
        // UI-Feedback
        alert(`✅ Produkt gefunden: ${data.product.name}`)
      } else {
        alert(`❌ Produkt mit Barcode ${barcode} nicht gefunden. ${data.message || 'Versuche es mit der Textsuche.'}`)
      }
    } catch (error) {
      console.error('Fehler beim Barcode-Lookup:', error)
      alert('❌ Fehler beim Scannen. Versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food)
  }

  const handleAddFood = async (type: string) => {
    if (!selectedFood || !user) {
      if (!user) {
        alert('❌ Bitte melden Sie sich an, um Lebensmittel hinzuzufügen.')
        router.push('/login')
        return
      }
      return
    }
    
    setAdding(true)
    try {
      // Berechne Nährwerte basierend auf Menge
      const calories = Math.round(((selectedFood.nutriments['energy-kcal_100g'] || 0) * quantity) / 100)
      const protein = ((selectedFood.nutriments['proteins_100g'] || 0) * quantity) / 100
      const carbs = ((selectedFood.nutriments['carbohydrates_100g'] || 0) * quantity) / 100
      const fat = ((selectedFood.nutriments['fat_100g'] || 0) * quantity) / 100
      const fiber = ((selectedFood.nutriments['fiber_100g'] || 0) * quantity) / 100
      const sugar = ((selectedFood.nutriments['sugars_100g'] || 0) * quantity) / 100
      const salt = ((selectedFood.nutriments['salt_100g'] || 0) * quantity) / 100

      // Füge Eintrag zur Datenbank hinzu
      const insertResult = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            food_name: selectedFood.product_name,
            quantity: quantity,
            unit: 'g',
            meal_type: type, // Aus URL-Parameter oder Standard
            calories: calories,
            protein_g: Math.round(protein * 10) / 10,
            carb_g: Math.round(carbs * 10) / 10,
            fat_g: Math.round(fat * 10) / 10,
            fiber_g: Math.round(fiber * 10) / 10,
            sugar_g: Math.round(sugar * 10) / 10,
            sodium_mg: Math.round(salt * 1000) // Salt to sodium in mg
          }
        ])

      if (insertResult.error) {
        console.error('Error adding food:', insertResult.error)
        alert('Fehler beim Hinzufügen des Lebensmittels')
        return
      }

      console.log('Food added successfully!')
      
      // UI-Feedback für erfolgreiche Hinzufügung
      alert('✅ Lebensmittel erfolgreich zum Tagebuch hinzugefügt!')
      
      router.push('/diary')
    } catch (error) {
      console.error('Error adding food:', error)
      alert('Fehler beim Hinzufügen des Lebensmittels')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#A9E142] flex flex-col">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Lebensmittel hinzufügen {mealType && `- ${getMealLabel(mealType)}`}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <button 
            className="flex flex-col items-center p-2 bg-transparent shadow-none border-none active:scale-95 transition-transform"
            onClick={() => setShowPhotoHint(true)}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Foto</span>
          </button>
          <button 
            onClick={() => setShowScanner(true)}
            className="flex flex-col items-center p-2 bg-transparent shadow-none border-none active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-2">
              <Barcode className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Scannen</span>
          </button>
        </div>

        {/* Search Input */}
        <div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lebensmittel suchen..."
              className="w-full p-4 pr-12 bg-white/90 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={() => handleSearch(true)}
              className="absolute right-2 top-2 p-2 bg-white text-gray-700 rounded-xl transition-colors active:scale-95 border border-gray-200"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-white/80 mt-2 text-center">Scrollen für mehr Ergebnisse</p>
        </div>

        {/* Search Results */}
        {searchQuery.trim().length >= 2 && (
          <InfiniteScrollFoodList
            items={searchResults}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={() => handleSearch(false)}
            onSelect={handleFoodSelect}
          />
        )}

        {/* No Results - Show Add Product Option */}
        {!loading && searchQuery && searchResults.length === 0 && (
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Keine Ergebnisse für &quot;{searchQuery}&quot;
            </h3>
            <p className="text-white/80 mb-4">
              Das gesuchte Produkt ist noch nicht in unserer Datenbank verfügbar.
            </p>
            <button 
              onClick={() => router.push('/products/add')}
              className="w-full p-3 bg-blue-500 text-white rounded-2xl font-medium active:scale-95 transition-transform"
            >
              Produkt zur Datenbank hinzufügen
            </button>
          </div>
        )}

        {/* Selected Food */}
        {selectedFood && (
          <div className="bg-[#7CB518] backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Ausgewähltes Lebensmittel</h3>
            <div className="mb-4">
              <h4 className="font-medium text-white">{selectedFood.product_name || 'Unbekanntes Produkt'}</h4>
              <p className="text-sm text-white/80">
                {selectedFood.nutriments['energy-kcal_100g'] || 0} kcal pro 100g
              </p>
            </div>
            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">Menge (g)</label>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setQuantity(Math.max(10, quantity - 10))}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                >
                  <Minus className="h-4 w-4 text-white" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
                  className="flex-1 text-center p-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  min="10"
                />
                <button 
                  onClick={() => setQuantity(quantity + 10)}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            {/* Nutrition Info */}
            <div className="bg-white/10 rounded-2xl p-4 mb-6">
              <h5 className="font-medium text-white mb-2">Nährwerte für {quantity}g</h5>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/90">
                <div>Kalorien: <span className="font-bold text-emerald-200">
                  {Math.round(((selectedFood.nutriments['energy-kcal_100g'] || 0) * quantity) / 100)}
                </span></div>
                <div>Protein: <span className="font-bold text-blue-200">
                  {((selectedFood.nutriments['proteins_100g'] || 0) * quantity / 100).toFixed(1)}g
                </span></div>
                <div>Kohlenhydrate: <span className="font-bold text-orange-200">
                  {((selectedFood.nutriments['carbohydrates_100g'] || 0) * quantity / 100).toFixed(1)}g
                </span></div>
                <div>Fett: <span className="font-bold text-yellow-200">
                  {((selectedFood.nutriments['fat_100g'] || 0) * quantity / 100).toFixed(1)}g
                </span></div>
              </div>
            </div>
            {/* Add Buttons for Meals */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddFood('breakfast')}
                disabled={adding}
                className="w-full p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Wird hinzugefügt...' : 'Frühstück'}
              </button>
              <button
                onClick={() => handleAddFood('lunch')}
                disabled={adding}
                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Wird hinzugefügt...' : 'Mittagessen'}
              </button>
              <button
                onClick={() => handleAddFood('dinner')}
                disabled={adding}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Wird hinzugefügt...' : 'Abendessen'}
              </button>
              <button
                onClick={() => handleAddFood('snack')}
                disabled={adding}
                className="w-full p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Wird hinzugefügt...' : 'Snack'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isActive={showScanner}
        onScan={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />

      {/* Foto-Hinweis Modal */}
      {showPhotoHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPhotoHint(false)}>
          <div 
            className="relative bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center border border-white/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Foto-Tracking kommt bald!</h2>
            <p className="text-gray-700 text-center mb-4">Mit der nächsten Version kannst du Mahlzeiten per Foto erfassen und automatisch analysieren lassen. Stay tuned! 🚀</p>
            <button 
              onClick={() => setShowPhotoHint(false)}
              className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-xl font-medium shadow active:scale-95 transition-transform"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AddFoodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <AddFoodContent />
    </Suspense>
  )
}
