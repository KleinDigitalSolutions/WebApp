'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Input, LoadingSpinner } from '@/components/ui'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

interface Recipe {
  id: string
  title: string
  image_url?: string
  link: string
  ingredients?: string[]
  category?: string
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function RecipesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [favLoading, setFavLoading] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<{ [cat: string]: number }>({})
  const [filterKeyword, setFilterKeyword] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadRecipes()
  }, [user, router])

  // Favoriten für User laden
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_id', user.id)
      if (!error && data) {
        setFavoriteIds(data.map((f: { recipe_id: string }) => f.recipe_id))
      }
    }
    fetchFavorites()
  }, [user])

  // Lade alle vorhandenen Kategorien aus Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      let all: string[] = []
      let from = 0
      const batch = 1000
      while (true) {
        const { data, error } = await supabase
          .from('recipes')
          .select('category')
          .neq('category', null)
          .range(from, from + batch - 1)
        if (error) throw error
        if (!data || data.length === 0) break
        all = all.concat(data.map((r: { category: string }) => r.category?.trim()).filter(Boolean))
        if (data.length < batch) break
        from += batch
      }
      const unique = Array.from(new Set(all)).filter(Boolean)
      // Zähle die Anzahl der Rezepte pro Kategorie
      const counts: { [cat: string]: number } = {}
      for (const cat of all) {
        if (!cat) continue
        counts[cat] = (counts[cat] || 0) + 1
      }
      setCategories(unique.sort())
      setCategoryCounts(counts)
    }
    fetchCategories()
  }, [])

  // Hinweis: Kategorie "Schnell & einfach" nach oben sortieren, falls vorhanden
  useEffect(() => {
    setCategories((prev) => {
      if (!prev.includes('Schnell & einfach')) return prev
      const filtered = prev.filter((c) => c !== 'Schnell & einfach')
      return ['Schnell & einfach', ...filtered]
    })
  }, [categories.length])

  // Die Filter-Buttons werden jetzt direkt aus categories generiert (siehe oben)
  // Hilfsfunktion: Sortiere Filter nach Trefferhäufigkeit (absteigend)

  // Rezepte aus Supabase laden (mit optionalem Suchbegriff/Keyword)
  const loadRecipes = async (query?: string, _category?: string, keyword?: string) => {
    setLoading(true)
    let supa = supabase.from('recipes').select('*').order('created_at', { ascending: false })
    if (query && query.trim()) {
      supa = supa.ilike('title', `%${query.trim()}%`)
    }
    if (keyword && keyword.trim()) {
      supa = supa.ilike('title', `%${keyword.trim()}%`)
    }
    const { data, error } = await supa
    if (!error && data) {
      setRecipes(data as Recipe[])
    } else {
      setRecipes([])
    }
    setLoading(false)
  }

  // Favoriten-Ansicht laden
  const loadFavorites = async () => {
    setLoading(true)
    if (!user) return
    // Hole alle Favoriten-IDs
    const { data: favs, error: favError } = await supabase
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('user_id', user.id)
    if (favError || !favs) {
      setRecipes([])
      setLoading(false)
      return
    }
    const favIds = favs.map((f: { recipe_id: string }) => f.recipe_id)
    if (favIds.length === 0) {
      setRecipes([])
      setLoading(false)
      return
    }
    // Hole alle Rezepte mit diesen IDs
    const { data: favRecipes, error: recError } = await supabase
      .from('recipes')
      .select('*')
      .in('id', favIds)
      .order('created_at', { ascending: false })
    if (!recError && favRecipes) {
      setRecipes(favRecipes as Recipe[])
    } else {
      setRecipes([])
    }
    setLoading(false)
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (filterKeyword) {
        loadRecipes(searchQuery, '', filterKeyword)
      } else {
        loadRecipes(searchQuery, selectedCategory)
      }
    }, 500)
    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedCategory, filterKeyword])

  // Favorit toggeln
  const toggleFavorite = async (recipeId: string) => {
    if (!user) return
    setFavLoading(recipeId)
    if (favoriteIds.includes(recipeId)) {
      // Entfernen
      await supabase
        .from('recipe_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
      setFavoriteIds(favoriteIds.filter((id) => id !== recipeId))
    } else {
      // Hinzufügen
      await supabase
        .from('recipe_favorites')
        .insert({ user_id: user.id, recipe_id: recipeId })
      setFavoriteIds([...favoriteIds, recipeId])
    }
    setFavLoading(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur px-4 pt-4 pb-2 border-b border-green-100">
        <Input
          label={undefined}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rezepte, Zutaten oder Kategorie suchen..."
          className="rounded-xl border-green-100 focus:border-green-500 focus:ring-green-500"
        />
        {/* Filter-Buttons für Kategorien */}
        <div className="mt-3 flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={cn(
                "px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors",
                selectedCategory === cat
                  ? "bg-green-600 text-white border-green-600 shadow"
                  : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              )}
              onClick={() => {
                if (selectedCategory !== cat) {
                  setSelectedCategory(cat)
                  setFilterKeyword('')
                  if (cat === 'Favoriten') {
                    loadFavorites()
                  } else {
                    loadRecipes(searchQuery, cat, filterKeyword)
                  }
                } else {
                  setSelectedCategory('')
                  setFilterKeyword('')
                  loadRecipes(searchQuery, '', filterKeyword)
                }
              }}
              type="button"
            >
              {cat} <span className="ml-1 text-xs text-green-700/70">({categoryCounts[cat] || 0})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end px-4 pt-2">
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium shadow-sm",
            selectedCategory === 'Favoriten' && "bg-green-600 text-white border-green-600"
          )}
          onClick={() => {
            if (selectedCategory !== 'Favoriten') {
              setSelectedCategory('Favoriten')
              setFilterKeyword('')
              loadFavorites()
            } else {
              setSelectedCategory('')
              setFilterKeyword('')
              loadRecipes(searchQuery, '', filterKeyword)
            }
          }}
          type="button"
        >
          <Heart size={18} className={selectedCategory === 'Favoriten' ? 'fill-white' : 'fill-green-500'} />
          Favoriten
        </button>
      </div>
      <div className="px-4 pt-4 pb-20">
        {/* Rezepte Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-base">Keine Rezepte gefunden</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recipes.map((recipe, index) => (
              <div key={`${recipe.id}-${index}`} className="relative bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden group">
                <a
                  href={recipe.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full aspect-[4/3] bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  tabIndex={0}
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      width={320}
                      height={240}
                      className="w-full h-full object-cover rounded-2xl"
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-recipe.jpg'
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-50 flex items-center justify-center">
                      {/* Dezentes Icon statt Emoji */}
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 bg-green-600/80 text-white text-xs px-3 py-1 rounded-full">
                    {recipe.category}
                  </span>
                </a>
                <div className="p-2">
                  <a
                    href={recipe.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 text-base leading-tight truncate hover:underline focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {recipe.title}
                  </a>
                  <div className="text-xs text-gray-500 mt-1 truncate">{recipe.ingredients && recipe.ingredients.join(', ')}</div>
                </div>
                <button
                  className={cn(
                    "absolute top-2 right-2 rounded-full p-1 shadow-sm transition",
                    favoriteIds.includes(recipe.id) ? "bg-green-500/90" : "bg-white/80"
                  )}
                  onClick={() => toggleFavorite(recipe.id)}
                  disabled={favLoading === recipe.id}
                  aria-label={favoriteIds.includes(recipe.id) ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                >
                  <Heart
                    size={20}
                    className={cn(
                      favoriteIds.includes(recipe.id) ? "text-white fill-white" : "text-green-500",
                      favLoading === recipe.id && "animate-pulse"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  )
}
