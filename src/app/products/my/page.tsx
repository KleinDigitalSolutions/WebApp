'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface UserProduct {
  id: string
  code: string
  name: string
  brand: string
  category: string
  verification_status: 'pending' | 'approved' | 'rejected'
  is_verified: boolean
  created_at: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

const CATEGORY_LABELS: Record<string, string> = {
  'dairy': 'Milchprodukte',
  'meat': 'Fleisch & Wurst',
  'bakery': 'Bäckerei',
  'frozen': 'Tiefkühlprodukte',
  'beverages': 'Getränke',
  'fruits': 'Obst',
  'vegetables': 'Gemüse',
  'snacks': 'Snacks',
  'pantry': 'Vorratsschrank'
}

const STATUS_LABELS: Record<string, string> = {
  'pending': 'Wird geprüft',
  'approved': 'Genehmigt',
  'rejected': 'Abgelehnt'
}

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800'
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<UserProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserProducts()
  }, [])

  const loadUserProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Sie müssen eingeloggt sein, um Ihre Produkte anzuzeigen')
        return
      }

      const response = await fetch('/api/products/add', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Produkte')
      }

      const data = await response.json()
      setProducts(data.products)

    } catch (error) {
      console.error('Error loading products:', error)
      setError('Fehler beim Laden Ihrer Produkte')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Ihre Produkte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meine Produkte</h1>
              <p className="text-gray-600 mt-2">
                Alle von Ihnen hinzugefügten Produkte und deren Status
              </p>
            </div>
            <Link
              href="/products/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Neues Produkt hinzufügen
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {products.length === 0 && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Produkte hinzugefügt
            </h3>
            <p className="text-gray-600 mb-6">
              Sie haben noch keine Produkte zur Datenbank hinzugefügt. 
              Helfen Sie der Community, indem Sie fehlende Produkte ergänzen.
            </p>
            <Link
              href="/products/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Erstes Produkt hinzufügen
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {products.length}
                </div>
                <div className="text-gray-600">Produkte gesamt</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.verification_status === 'approved').length}
                </div>
                <div className="text-gray-600">Genehmigt</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.verification_status === 'pending').length}
                </div>
                <div className="text-gray-600">Wird geprüft</div>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Produktliste</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produkt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nährwerte (pro 100g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hinzugefügt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {CATEGORY_LABELS[product.category] || product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-600">
                            <div>{product.calories_per_100g} kcal</div>
                            <div>P: {product.protein_per_100g}g</div>
                            <div>K: {product.carbs_per_100g}g</div>
                            <div>F: {product.fat_per_100g}g</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[product.verification_status]}`}>
                            {STATUS_LABELS[product.verification_status]}
                          </span>
                          {product.is_verified && (
                            <div className="mt-1">
                              <span className="inline-flex items-center text-xs text-green-600">
                                ✓ Verifiziert
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString('de-DE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ Hinweise zur Produktmoderation
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>Wird geprüft:</strong> Ihr Produkt wurde eingereicht und wartet auf Überprüfung durch unser Team</p>
            <p>• <strong>Genehmigt:</strong> Das Produkt ist in der öffentlichen Datenbank verfügbar</p>
            <p>• <strong>Abgelehnt:</strong> Das Produkt wurde aufgrund unvollständiger oder falscher Informationen abgelehnt</p>
            <p>• <strong>Verifiziert:</strong> Die Nährwerte wurden durch externe Quellen bestätigt</p>
          </div>
        </div>
      </div>
    </div>
  )
}
