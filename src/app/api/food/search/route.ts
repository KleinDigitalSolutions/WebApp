import { NextRequest, NextResponse } from 'next/server'
import { GermanProductDatabase } from '@/lib/german-product-database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    console.log(`Food search request for: "${query}"`)

    // 1. Suche in unserer lokalen deutschen Produktdatenbank
    const localResults = GermanProductDatabase.searchProducts(query)

    // 2. Suche in Supabase für community-hinzugefügte Produkte
    const { data: supabaseProducts, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,keywords.cs.{${query}}`)
      .eq('verification_status', 'approved')
      .limit(10)

    if (error) {
      console.error('Supabase search error:', error)
    }

    // Konvertiere lokale Ergebnisse zu einheitlichem Format
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
      price_range: product.price_range,
      category: product.category,
      allergens: product.allergens || [],
      source: 'local'
    }))

    // Konvertiere Supabase-Ergebnisse zu einheitlichem Format
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

    // Kombiniere beide Ergebnissets (lokale zuerst, dann community)
    const allResults = [...formattedLocalResults, ...formattedSupabaseResults]

    // Begrenze Ergebnisse auf maximal 20
    const limitedResults = allResults.slice(0, 20)

    return NextResponse.json({ 
      products: limitedResults,
      total: limitedResults.length,
      sources: {
        local: formattedLocalResults.length,
        community: formattedSupabaseResults.length
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
