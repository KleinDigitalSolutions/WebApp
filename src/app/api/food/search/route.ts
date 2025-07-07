import { NextRequest, NextResponse } from 'next/server'
import { GermanProductDatabase } from '@/lib/german-product-database'
import { createClient } from '@supabase/supabase-js'
import { searchFatSecretFoods } from '@/lib/fatsecret-api'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [], total: 0 })
    }

    // 1. FatSecret Suche
    try {
      const fatsecretResults = await searchFatSecretFoods(query)
      if (fatsecretResults && fatsecretResults.length > 0) {
        // FatSecret Ergebnis auf das gleiche Format mappen
        const formattedFatSecret = fatsecretResults.map((food: FatSecretFood) => ({
          code: food.food_id?.toString() || '',
          product_name: food.food_name,
          brands: food.brand_name || '',
          image_url: '',
          nutriments: {},
          source: 'fatsecret',
        }))
        return NextResponse.json({ products: formattedFatSecret, total: formattedFatSecret.length, sources: { fatsecret: formattedFatSecret.length } })
      }
    } catch {
      // FatSecret Fehler ignorieren, Fallback
    }

    // 2. Lokale Produktdatenbank
    const localResults = GermanProductDatabase.searchProducts(query)
    // 3. Supabase
    const { data: supabaseProducts, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,keywords.cs.{${query}}`)
      .eq('verification_status', 'approved')
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase search error:', error)
      return NextResponse.json({ error: 'Fehler bei der Produktsuche' }, { status: 500 })
    }

    // Formatierung wie gehabt
    const formattedLocalResults = localResults.map((product) => ({
      code: product.code,
      product_name: product.name,
      brands: product.brand,
      image_url: product.image_url || '',
      nutriments: {
        'energy-kcal_100g': product.nutrition.calories_per_100g,
        'proteins_100g': product.nutrition.protein_per_100g,
        'carbohydrates_100g': product.nutrition.carbs_per_100g,
        'fat_100g': product.nutrition.fat_per_100g,
        'fiber_100g': product.nutrition.fiber_per_100g || 0,
        'sugars_100g': product.nutrition.sugar_per_100g || 0,
        'salt_100g': product.nutrition.salt_per_100g || 0
      },
      supermarkets: product.supermarkets,
      price_range: typeof product.price_range === 'string' ? product.price_range : (product.price_range && product.price_range.min && product.price_range.max ? `${product.price_range.min}-${product.price_range.max}€` : undefined),
      category: product.category,
      allergens: product.allergens || [],
      source: 'local'
    }))

    const formattedSupabaseResults = (supabaseProducts || []).map((product) => ({
      code: product.code,
      product_name: product.name,
      brands: product.brand,
      image_url: product.image_url || '',
      nutriments: {
        'energy-kcal_100g': product.calories_per_100g,
        'proteins_100g': product.protein_per_100g,
        'carbohydrates_100g': product.carbs_per_100g,
        'fat_100g': product.fat_per_100g,
        'fiber_100g': product.fiber_per_100g || 0,
        'sugars_100g': product.sugar_per_100g || 0,
        'salt_100g': product.salt_per_100g || 0
      },
      supermarkets: product.supermarkets || [],
      price_range: product.price_min && product.price_max 
        ? `${product.price_min}-${product.price_max}€` 
        : undefined,
      category: product.category,
      allergens: product.allergens || [],
      source: 'community',
      is_verified: product.is_verified,
      created_by: product.created_by
    }))

    // Infinite Scroll: lokale Ergebnisse nur beim ersten Offset (offset === 0) anzeigen
    let allResults: ProductResult[] = []
    if (offset === 0) {
      allResults = [...formattedLocalResults, ...formattedSupabaseResults]
    } else {
      allResults = formattedSupabaseResults
    }

    return NextResponse.json({ 
      products: allResults,
      total: (count || 0) + (offset === 0 ? formattedLocalResults.length : 0),
      sources: {
        local: offset === 0 ? formattedLocalResults.length : 0,
        community: count || 0
      }
    })
  } catch (error) {
    console.error('Fehler bei Produktsuche:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Produktsuche' },
      { status: 500 }
    )
  }
}

// Typdefinition ergänzen (am Anfang der Datei oder nach Imports):
type ProductResult = {
  code: string;
  product_name: string;
  brands: string;
  image_url: string;
  nutriments: Record<string, number>;
  supermarkets?: string[];
  price_range?: string;
  category?: string;
  allergens?: string[];
  source: string;
  is_verified?: boolean;
  created_by?: string;
};

// Am Ende der Datei ergänzen:
interface FatSecretFood {
  food_id: string | number;
  food_name: string;
  brand_name?: string;
}
