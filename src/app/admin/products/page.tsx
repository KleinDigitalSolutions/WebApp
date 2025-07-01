'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  code: string
  name: string
  brand: string
  category: string
  verification_status: 'pending' | 'approved' | 'rejected'
  is_verified: boolean
  moderator_notes?: string
  created_at: string
  created_by: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

interface Statistics {
  total: number
  pending: number
  approved: number
  rejected: number
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0, pending: 0, approved: 0, rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [selectedStatus])

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Sie müssen als Admin eingeloggt sein')
        return
      }

      const response = await fetch(`/api/admin/products?status=${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Laden der Produkte')
      }

      const data = await response.json()
      setProducts(data.products)
      setStatistics(data.statistics)

    } catch (error: unknown) {
      console.error('Error loading products:', error)
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Produkte')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  const handleStatusChange = async (productId: string, newStatus: 'approved' | 'rejected', moderatorNotes?: string, isVerified = false) => {
    try {
      setProcessingId(productId)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Session abgelaufen')
        return
      }

      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          productId,
          status: newStatus,
          moderatorNotes,
          isVerified
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Aktualisieren')
      }

      // Lade Produkte neu
      await loadProducts()

    } catch (error: unknown) {
      console.error('Error updating product:', error)
      setError(error instanceof Error ? error.message : 'Fehler beim Aktualisieren')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Produkte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Produktmoderation</h1>
          <p className="text-gray-600 mt-2">
            Verwaltung und Überprüfung von Community-hinzugefügten Produkten
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-4 underline"
            >
              Schließen
            </button>
          </div>
        )}

        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            <div className="text-gray-600">Produkte gesamt</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <div className="text-gray-600">Warten auf Prüfung</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
            <div className="text-gray-600">Genehmigt</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
            <div className="text-gray-600">Abgelehnt</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <span className="text-gray-700 mr-2">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="pending">Ausstehend</option>
                <option value="approved">Genehmigt</option>
                <option value="rejected">Abgelehnt</option>
                <option value="all">Alle</option>
              </select>
            </label>
            <button 
              onClick={loadProducts}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Aktualisieren
            </button>
          </div>
        </div>

        {/* Produktliste */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Keine Produkte gefunden
              </h3>
              <p className="text-gray-600">
                Es gibt aktuell keine Produkte mit dem Status &quot;{selectedStatus}&quot;.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produkt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kategorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nährwerte (pro 100g)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Eingereicht
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand} ({product.code})
                          </div>
                          {product.moderator_notes && (
                            <div className="text-xs text-red-600 mt-1">
                              Note: {product.moderator_notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          <div>{product.calories_per_100g} kcal</div>
                          <div>P: {product.protein_per_100g}g</div>
                          <div>K: {product.carbs_per_100g}g</div>
                          <div>F: {product.fat_per_100g}g</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4">
                        {product.verification_status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(product.id, 'approved', '', true)}
                              disabled={processingId === product.id}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                            >
                              {processingId === product.id ? '...' : 'Genehmigen'}
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt('Grund für Ablehnung (optional):')
                                handleStatusChange(product.id, 'rejected', notes || '')
                              }}
                              disabled={processingId === product.id}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                            >
                              Ablehnen
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.verification_status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.verification_status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
