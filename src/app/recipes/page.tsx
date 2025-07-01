'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, Input, Select, LoadingSpinner } from '@/components/ui'
import { SpoonacularRecipe } from '@/lib/spoonacular-api'

export default function RecipesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDiet, setSelectedDiet] = useState('')
  const [selectedIntolerances, setSelectedIntolerances] = useState('')

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
      }
    } catch (error) {
      console.error('Error loading random recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchRecipes = useCallback(async (query: string, diet?: string, intolerances?: string) => {
    if (!query.trim()) {
      loadRandomRecipes()
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        ...(diet && { diet }),
        ...(intolerances && { intolerances }),
      })

      const response = await fetch(`/api/recipes/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      }
    } catch (error) {
      console.error('Error searching recipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = () => {
    searchRecipes(searchQuery, selectedDiet, selectedIntolerances)
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchRecipes(searchQuery, selectedDiet, selectedIntolerances)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedDiet, selectedIntolerances, searchRecipes])

  const viewRecipe = (recipe: SpoonacularRecipe) => {
    // For now, open the source URL in a new tab
    // In a full implementation, we'd create a detailed recipe page
    if (recipe.sourceUrl) {
      window.open(recipe.sourceUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recipe Discovery</h1>
          <p className="text-gray-600">Find healthy recipes that match your dietary preferences</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Search recipes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter ingredients, dish name, or cuisine..."
              />
            </div>

            <Select
              label="Diet"
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              options={[
                { value: '', label: 'Any diet' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'vegan', label: 'Vegan' },
                { value: 'ketogenic', label: 'Ketogenic' },
                { value: 'paleo', label: 'Paleo' },
                { value: 'gluten free', label: 'Gluten Free' },
                { value: 'dairy free', label: 'Dairy Free' },
                { value: 'mediterranean', label: 'Mediterranean' },
                { value: 'low carb', label: 'Low Carb' },
              ]}
            />

            <Select
              label="Intolerances"
              value={selectedIntolerances}
              onChange={(e) => setSelectedIntolerances(e.target.value)}
              options={[
                { value: '', label: 'No restrictions' },
                { value: 'dairy', label: 'Dairy' },
                { value: 'egg', label: 'Egg' },
                { value: 'gluten', label: 'Gluten' },
                { value: 'grain', label: 'Grain' },
                { value: 'peanut', label: 'Peanut' },
                { value: 'seafood', label: 'Seafood' },
                { value: 'sesame', label: 'Sesame' },
                { value: 'shellfish', label: 'Shellfish' },
                { value: 'soy', label: 'Soy' },
                { value: 'sulfite', label: 'Sulfite' },
                { value: 'tree nut', label: 'Tree Nut' },
                { value: 'wheat', label: 'Wheat' },
              ]}
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Button onClick={handleSearch} disabled={loading}>
              Search Recipes
            </Button>
            <Button variant="outline" onClick={loadRandomRecipes} disabled={loading}>
              Show Random Recipes
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
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
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {recipe.readyInMinutes} min
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>🍽️ {recipe.servings} servings</span>
                    <span>⏱️ {recipe.readyInMinutes} min</span>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => viewRecipe(recipe)}
                  >
                    View Recipe
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Recipe Integration</h3>
          <p className="text-blue-800 mb-4">
            Soon you&apos;ll be able to add recipe ingredients directly to your food diary with one click! 
            We&apos;re working on detailed nutrition analysis and portion control features.
          </p>
          <div className="text-sm text-blue-700">
            <p><strong>Coming soon:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>One-click recipe logging to diary</li>
              <li>Detailed nutrition breakdown per serving</li>
              <li>Portion size adjustments</li>
              <li>Save favorite recipes</li>
              <li>AI-powered recipe recommendations based on your goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
