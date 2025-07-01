'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAdminSession } from '@/lib/admin-auth'

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

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      const adminSession = getAdminSession()
      if (!adminSession.isAuthenticated) {
        setError('Nicht authentifiziert')
        return
      }

      const response = await fetch(`/api/admin/products?status=${selectedStatus}`, {
        headers: {
          'x-admin-session': JSON.stringify(adminSession)
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || [])
      setStatistics(data.statistics || { total: 0, pending: 0, approved: 0, rejected: 0 })
      setError('')
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Fehler beim Laden der Produkte')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Produkte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Produktmoderation</h1>
        <p className="text-gray-600 mt-1">Verwalte und moderiere Community-Produkte</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p>Admin Products Page - Simplified Version</p>
        <p>Products: {products.length}</p>
        <p>Status: {selectedStatus}</p>
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>
    </div>
  )
}
