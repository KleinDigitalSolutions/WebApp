'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore, useDiaryStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, Input, Select, LoadingSpinner } from '@/components/ui'
import { OpenFoodFactsAPI, FoodProduct } from '@/lib/openfoodfacts-api'

export default function DiaryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { entries, selectedDate, setEntries, setSelectedDate } = useDiaryStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodProduct | null>(null)
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('g')
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)

  const openFoodFactsAPI = new OpenFoodFactsAPI()

  const loadDiaryEntries = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', selectedDate)
        .order('created_at', { ascending: false })

      if (error) throw error

      setEntries(data || [])
    } catch (error) {
      console.error('Error loading diary entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user, selectedDate, setEntries])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      await loadDiaryEntries()
    }

    loadData()
  }, [user, loadDiaryEntries, router])

  const searchFood = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.products || [])
    } catch (error) {
      console.error('Error searching food:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchFood(searchQuery)
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, searchFood])

  const selectFood = (food: FoodProduct) => {
    setSelectedFood(food)
    setSearchQuery(food.product_name || '')
    setSearchResults([])
    setShowAddForm(true)
  }

  const addFoodEntry = async () => {
    if (!selectedFood || !quantity || !user) return

    setAdding(true)
    try {
      const quantityNum = parseFloat(quantity)
      const nutrition = openFoodFactsAPI.calculateNutritionPerServing(selectedFood, quantityNum)

      const entry: Omit<DiaryEntry, 'id' | 'created_at'> = {
        user_id: user.id,
        food_name: selectedFood.product_name || 'Unknown Food',
        quantity: quantityNum,
        unit,
        meal_type: mealType,
        calories: nutrition.calories,
        protein_g: nutrition.protein,
        carb_g: nutrition.carbs,
        fat_g: nutrition.fat,
        entry_date: selectedDate,
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .insert([entry])
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setEntries([data, ...entries])
      
      // Reset form
      setSelectedFood(null)
      setSearchQuery('')
      setQuantity('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding food entry:', error)
    } finally {
      setAdding(false)
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error

      setEntries(entries.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  // Calculate daily totals
  const dailyTotals = entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein_g,
      carbs: totals.carbs + entry.carb_g,
      fat: totals.fat + entry.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Group entries by meal type
  const mealGroups = {
    breakfast: entries.filter(e => e.meal_type === 'breakfast'),
    lunch: entries.filter(e => e.meal_type === 'lunch'),
    dinner: entries.filter(e => e.meal_type === 'dinner'),
    snack: entries.filter(e => e.meal_type === 'snack'),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Food Diary</h1>
            <p className="text-gray-600">Track your daily nutrition intake</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Daily Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(dailyTotals.calories)}</div>
              <div className="text-sm text-gray-500">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(dailyTotals.protein)}g</div>
              <div className="text-sm text-gray-500">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(dailyTotals.carbs)}g</div>
              <div className="text-sm text-gray-500">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(dailyTotals.fat)}g</div>
              <div className="text-sm text-gray-500">Fat</div>
            </div>
          </div>
        </div>

        {/* Add Food Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Food</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Search for food"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search food products..."
              />
              
              {searching && (
                <div className="absolute right-3 top-8">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              
              {searchResults.length > 0 && !showAddForm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => selectFood(food)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{food.product_name}</div>
                      <div className="text-sm text-gray-500">
                        {food.nutriments['energy-kcal_100g'] && (
                          <span>{Math.round(food.nutriments['energy-kcal_100g'])} cal per 100g</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {showAddForm && selectedFood && (
              <div className="border-t pt-4 space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-medium text-gray-900">{selectedFood.product_name}</h3>
                  {selectedFood.nutriments['energy-kcal_100g'] && (
                    <p className="text-sm text-gray-600">
                      {Math.round(selectedFood.nutriments['energy-kcal_100g'])} calories per 100g
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Amount"
                    min="0"
                    step="0.1"
                  />

                  <Select
                    label="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    options={[
                      { value: 'g', label: 'grams (g)' },
                      { value: 'ml', label: 'milliliters (ml)' },
                      { value: 'piece', label: 'piece(s)' },
                      { value: 'cup', label: 'cup(s)' },
                      { value: 'tbsp', label: 'tablespoon(s)' },
                      { value: 'tsp', label: 'teaspoon(s)' },
                    ]}
                  />

                  <Select
                    label="Meal"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as typeof mealType)}
                    options={[
                      { value: 'breakfast', label: 'Breakfast' },
                      { value: 'lunch', label: 'Lunch' },
                      { value: 'dinner', label: 'Dinner' },
                      { value: 'snack', label: 'Snack' },
                    ]}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={addFoodEntry}
                    loading={adding}
                    disabled={!quantity}
                  >
                    Add to Diary
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setSelectedFood(null)
                      setSearchQuery('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meals by Type */}
        {Object.entries(mealGroups).map(([mealName, mealEntries]) => (
          <div key={mealName} className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 capitalize">
              {mealName} {mealEntries.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({mealEntries.reduce((sum, entry) => sum + entry.calories, 0).toFixed(0)} cal)
                </span>
              )}
            </h2>
            
            {mealEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No {mealName} entries for this day
              </p>
            ) : (
              <div className="space-y-3">
                {mealEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{entry.food_name}</h3>
                      <p className="text-sm text-gray-600">
                        {entry.quantity}{entry.unit} • {Math.round(entry.calories)} cal
                      </p>
                      <p className="text-xs text-gray-500">
                        P: {Math.round(entry.protein_g)}g • C: {Math.round(entry.carb_g)}g • F: {Math.round(entry.fat_g)}g
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
