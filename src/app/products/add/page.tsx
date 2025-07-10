'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

const CATEGORIES = [
  { value: 'dairy', label: 'Milchprodukte' },
  { value: 'meat', label: 'Fleisch & Wurst' },
  { value: 'bakery', label: 'Bäckerei' },
  { value: 'frozen', label: 'Tiefkühlprodukte' },
  { value: 'beverages', label: 'Getränke' },
  { value: 'fruits', label: 'Obst' },
  { value: 'vegetables', label: 'Gemüse' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'pantry', label: 'Vorratsschrank' }
]

const COMMON_ALLERGENS = [
  'Gluten', 'Milch', 'Eier', 'Nüsse', 'Erdnüsse', 
  'Soja', 'Sellerie', 'Senf', 'Sesam', 'Schwefeldioxid'
]

const SUPERMARKETS = [
  'REWE', 'EDEKA', 'ALDI', 'Lidl', 'Kaufland', 
  'Penny', 'Netto', 'Real', 'Famila', 'Norma'
]

export default function AddProductPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    supermarkets: [] as string[],
    price_min: '',
    price_max: '',
    image_url: '',
    
    // Nährwerte pro 100g
    calories_per_100g: '',
    protein_per_100g: '',
    carbs_per_100g: '',
    fat_per_100g: '',
    fiber_per_100g: '',
    sugar_per_100g: '',
    salt_per_100g: '',
    
    allergens: [] as string[],
    keywords: [] as string[]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (value: string, field: 'allergens' | 'supermarkets') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    setFormData(prev => ({
      ...prev,
      keywords
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Hole aktuellen User und Session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Sie müssen eingeloggt sein, um Produkte hinzuzufügen')
        return
      }

      // Validiere erforderliche Felder
      if (!formData.name || !formData.brand || !formData.category) {
        setError('Name, Marke und Kategorie sind erforderlich')
        return
      }

      if (!formData.calories_per_100g || !formData.protein_per_100g || 
          !formData.carbs_per_100g || !formData.fat_per_100g) {
        setError('Alle Grundnährwerte (Kalorien, Protein, Kohlenhydrate, Fett) sind erforderlich')
        return
      }

      // Sende Daten an API
      const response = await fetch(`${API_BASE_URL}/api/products/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError(`${result.error}. Ähnliche Produkte: ${result.existing_products?.map((p: { name: string; brand: string }) => `${p.name} (${p.brand})`).join(', ')}`)
        } else {
          setError(result.error || 'Fehler beim Hinzufügen des Produkts')
        }
        return
      }

      setSuccess('Produkt erfolgreich hinzugefügt! Es wartet nun auf Überprüfung durch unser Team.')
      
      // Formular zurücksetzen
      setFormData({
        name: '', brand: '', category: '', supermarkets: [], price_min: '', price_max: '', image_url: '',
        calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '',
        fiber_per_100g: '', sugar_per_100g: '', salt_per_100g: '', allergens: [], keywords: []
      })

    } catch (error) {
      console.error('Error adding product:', error)
      setError('Unbekannter Fehler beim Hinzufügen des Produkts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Neues Produkt hinzufügen</h1>
            <p className="text-gray-600 mt-2">
              Hilf der Community, indem du ein fehlendes Produkt hinzufügst. 
              Alle Angaben werden vor der Veröffentlichung überprüft.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grundinformationen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Grundinformationen</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produktname *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="z.B. Vollmilch 3,5%"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marke *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="z.B. Müller"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  required
                >
                  <option value="">Kategorie wählen</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bild-URL (optional)
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="https://example.com/product-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suchbegriffe (optional)
                </label>
                <input
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Zusätzliche Suchbegriffe, getrennt durch Kommas"
                />
              </div>
            </div>

            {/* Nährwerte */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Nährwerte pro 100g *</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kalorien (kcal) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="calories_per_100g"
                    value={formData.calories_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="250"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="protein_per_100g"
                    value={formData.protein_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="3.4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kohlenhydrate (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="carbs_per_100g"
                    value={formData.carbs_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="4.8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fett (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="fat_per_100g"
                    value={formData.fat_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="3.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ballaststoffe (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="fiber_per_100g"
                    value={formData.fiber_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zucker (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="sugar_per_100g"
                    value={formData.sugar_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="4.8"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salz (g)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="salt_per_100g"
                    value={formData.salt_per_100g}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Preisinformationen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Preisinformationen (optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mindestpreis (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_min"
                    value={formData.price_min}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="1.20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Höchstpreis (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_max"
                    value={formData.price_max}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="1.50"
                  />
                </div>
              </div>
            </div>

            {/* Supermärkte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verfügbar in Supermärkten
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUPERMARKETS.map(market => (
                  <label key={market} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.supermarkets.includes(market)}
                      onChange={() => handleCheckboxChange(market, 'supermarkets')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{market}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergene */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergene
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_ALLERGENS.map(allergen => (
                  <label key={allergen} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allergens.includes(allergen)}
                      onChange={() => handleCheckboxChange(allergen, 'allergens')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird hinzugefügt...' : 'Produkt hinzufügen'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
