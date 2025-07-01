'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Camera, Barcode, Plus, Minus } from 'lucide-react'

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

export default function AddFoodPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(1)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data.products || [])
        console.log('Search results:', data.products?.length || 0, 'products found')
      } else {
        console.error('Search error:', data.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food)
  }

  const handleAddFood = async () => {
    if (!selectedFood) return
    
    // Here you would add the food to the diary
    console.log('Adding food:', selectedFood, 'Quantity:', quantity)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Lebensmittel hinzufügen</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Suchen</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Foto</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-2">
              <Barcode className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Scannen</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lebensmittel suchen..."
              className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-2 p-2 bg-emerald-500 text-white rounded-xl transition-colors active:scale-95"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suchergebnisse</h3>
            <div className="space-y-3">
              {searchResults.slice(0, 5).map((food: FoodItem, index) => (
                <button
                  key={food.code || index}
                  onClick={() => handleFoodSelect(food)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl transition-colors text-left active:scale-95"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{food.product_name || 'Unbekanntes Produkt'}</h4>
                    <p className="text-sm text-gray-600">
                      {food.nutriments['energy-kcal_100g'] || 0} kcal pro 100g
                    </p>
                  </div>
                  <div className="text-emerald-600">
                    <Plus className="h-5 w-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Food */}
        {selectedFood && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ausgewähltes Lebensmittel</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{selectedFood.product_name || 'Unbekanntes Produkt'}</h4>
              <p className="text-sm text-gray-600">
                {selectedFood.nutriments['energy-kcal_100g'] || 0} kcal pro 100g
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Menge (g)</label>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 10))}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="flex-1 text-center p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="1"
                />
                
                <button 
                  onClick={() => setQuantity(quantity + 10)}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-6">
              <h5 className="font-medium text-gray-900 mb-2">Nährwerte für {quantity}g</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>Kalorien: <span className="font-medium">
                  {Math.round(((selectedFood.nutriments['energy-kcal_100g'] || 0) * quantity) / 100)}
                </span></div>
                <div>Protein: <span className="font-medium">
                  {Math.round(((selectedFood.nutriments['proteins_100g'] || 0) * quantity) / 100)}g
                </span></div>
                <div>Kohlenhydrate: <span className="font-medium">
                  {Math.round(((selectedFood.nutriments['carbohydrates_100g'] || 0) * quantity) / 100)}g
                </span></div>
                <div>Fett: <span className="font-medium">
                  {Math.round(((selectedFood.nutriments['fat_100g'] || 0) * quantity) / 100)}g
                </span></div>
              </div>
            </div>

            {/* Add Button */}
            <button 
              onClick={handleAddFood}
              className="w-full p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-lg active:scale-95 transition-transform"
            >
              Zum Tagebuch hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
