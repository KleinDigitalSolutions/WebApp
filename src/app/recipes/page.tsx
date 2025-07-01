'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, Input, Select, LoadingSpinner } from '@/components/ui'
import { Recipe } from '@/lib/themealdb-api'

export default function RecipesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedArea, setSelectedArea] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Load some random recipes on initial load
    loadRandomRecipes()
  }, [user, router])

  const loadRandomRecipes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recipes/random?number=12')
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      } else {
        console.error('Failed to load random recipes:', response.status)
        setRecipes([])
      }
    } catch (error) {
      console.error('Error loading random recipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const searchRecipes = useCallback(async (query: string, category?: string, area?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query && query.trim()) params.append('q', query)
      if (category && category.trim()) params.append('category', category)
      if (area && area.trim()) params.append('area', area)

      const response = await fetch(`/api/recipes/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      } else {
        console.error('Failed to search recipes:', response.status)
        setRecipes([])
      }
    } catch (error) {
      console.error('Error searching recipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = () => {
    searchRecipes(searchQuery, selectedCategory, selectedArea)
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim() || selectedCategory || selectedArea) {
        searchRecipes(searchQuery, selectedCategory, selectedArea)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedCategory, selectedArea, searchRecipes])

  const viewRecipe = (recipe: Recipe) => {
    // For now, open the source URL in a new tab
    // In a full implementation, we'd create a detailed recipe page
    if (recipe.sourceUrl) {
      window.open(recipe.sourceUrl, '_blank')
    } else if (recipe.youtubeUrl) {
      window.open(recipe.youtubeUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rezepte entdecken</h1>
          <p className="text-gray-600 text-sm">Finde gesunde Rezepte, die zu deinen Ernährungszielen passen</p>
        </div>

        {/* Search and Filters */}
        <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <Input
              label="Rezepte suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zutaten, Gericht oder Küche eingeben..."
              className="rounded-xl border-green-100 focus:border-green-500 focus:ring-green-500"
            />

            <Select
              label="Kategorie"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: '', label: 'Alle Kategorien' },
                { value: 'Beef', label: 'Rindfleisch' },
                { value: 'Chicken', label: 'Hähnchen' },
                { value: 'Dessert', label: 'Dessert' },
                { value: 'Lamb', label: 'Lamm' },
                { value: 'Pasta', label: 'Pasta' },
                { value: 'Pork', label: 'Schweinefleisch' },
                { value: 'Seafood', label: 'Meeresfrüchte' },
                { value: 'Side', label: 'Beilage' },
                { value: 'Starter', label: 'Vorspeise' },
                { value: 'Vegan', label: 'Vegan' },
                { value: 'Vegetarian', label: 'Vegetarisch' },
              ]}
            />

            <Select
              label="Küche"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              options={[
                { value: '', label: 'Alle Küchen' },
                { value: 'American', label: 'Amerikanisch' },
                { value: 'British', label: 'Britisch' },
                { value: 'Canadian', label: 'Kanadisch' },
                { value: 'Chinese', label: 'Chinesisch' },
                { value: 'Croatian', label: 'Kroatisch' },
                { value: 'Dutch', label: 'Niederländisch' },
                { value: 'Egyptian', label: 'Ägyptisch' },
                { value: 'French', label: 'Französisch' },
                { value: 'Greek', label: 'Griechisch' },
                { value: 'Indian', label: 'Indisch' },
                { value: 'Irish', label: 'Irisch' },
                { value: 'Italian', label: 'Italienisch' },
                { value: 'Jamaican', label: 'Jamaikanisch' },
                { value: 'Japanese', label: 'Japanisch' },
                { value: 'Kenyan', label: 'Kenianisch' },
                { value: 'Malaysian', label: 'Malaysisch' },
                { value: 'Mexican', label: 'Mexikanisch' },
                { value: 'Moroccan', label: 'Marokkanisch' },
                { value: 'Polish', label: 'Polnisch' },
                { value: 'Portuguese', label: 'Portugiesisch' },
                { value: 'Russian', label: 'Russisch' },
                { value: 'Spanish', label: 'Spanisch' },
                { value: 'Thai', label: 'Thailändisch' },
                { value: 'Tunisian', label: 'Tunesisch' },
                { value: 'Turkish', label: 'Türkisch' },
                { value: 'Vietnamese', label: 'Vietnamesisch' },
              ]}
            />
          </div>

          <div className="mt-6 flex space-x-3">
            <Button onClick={handleSearch} disabled={loading} className="flex-1">
              Rezepte suchen
            </Button>
            <Button variant="outline" onClick={loadRandomRecipes} disabled={loading} className="flex-1">
              Zufällige Rezepte
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🍳</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Rezepte gefunden</h3>
            <p className="text-gray-600">Versuche deine Suchbegriffe oder Filter anzupassen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg overflow-hidden">
                <div className="relative h-48">
                  {recipe.image ? (
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-recipe.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-green-50 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                      {recipe.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3 text-lg leading-tight">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center space-x-1">
                      <span>�</span>
                      <span>{recipe.area}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>📖</span>
                      <span>{recipe.category}</span>
                    </span>
                  </div>

                  <Button
                    className="w-full py-3 text-sm"
                    onClick={() => viewRecipe(recipe)}
                  >
                    Rezept ansehen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rezept-Integration</h3>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            Bald kannst du Rezept-Zutaten mit einem Klick direkt in dein Ernährungstagebuch übertragen! 
            Wir arbeiten an detaillierten Nährwertanalysen und Portionskontrollen.
          </p>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-2">Demnächst:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ein-Klick Rezept-Logging ins Tagebuch</li>
              <li>Detaillierte Nährwerte pro Portion</li>
              <li>Portionsgrößen anpassen</li>
              <li>Lieblingsrezepte speichern</li>
              <li>KI-basierte Rezeptempfehlungen für deine Ziele</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
