import { NextRequest, NextResponse } from 'next/server'
import EnhancedOpenFoodFactsImporter from '@/lib/enhanced-openfoodfacts-importer'
import { createClient } from '@supabase/supabase-js'

// Supabase Client mit Service Role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const maxProducts = parseInt(searchParams.get('max') || '2000')
    const dryRun = searchParams.get('dry_run') === 'true'
    const mode = searchParams.get('mode') || 'brands' // 'brands' | 'duplicates_check'
    
    console.log(`🚀 Enhanced import starting (mode: ${mode}, max: ${maxProducts})`)
    
    const importer = new EnhancedOpenFoodFactsImporter()
    
    if (mode === 'duplicates_check') {
      // Nur Duplikat-Check ohne Import
      await importer.checkExistingProducts(supabase)
      return NextResponse.json({
        success: true,
        message: 'Duplicate check completed',
        action: 'Use mode=brands to start import'
      })
    }
    
    // Bestehende Produkte laden um Duplikate zu vermeiden
    await importer.checkExistingProducts(supabase)
    
    // Top deutsche Marken importieren
    const products = await importer.importTopGermanBrands(maxProducts)
    
    if (dryRun) {
      // Nur Preview
      return NextResponse.json({
        success: true,
        message: `Dry run completed - would import ${products.length} new products`,
        preview: products.slice(0, 10),
        stats: {
          totalProducts: products.length,
          topBrands: getTopBrands(products),
          avgNutrition: calculateAvgNutrition(products),
          categories: [...new Set(products.map(p => p.category))]
        }
      })
    }
    
    // Produkte in Supabase speichern (ohne Duplikate)
    console.log(`💾 Saving ${products.length} NEW products to database...`)
    
    const batchSize = 100
    let savedCount = 0
    let skippedCount = 0
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      // In Supabase-Format konvertieren
      const supabaseProducts = batch.map(product => ({
        name: product.name,
        brand: product.brand,
        code: product.barcode,
        category: 'pantry',
        image_url: product.imageUrl,
        calories_per_100g: product.nutritionPer100g.calories,
        protein_per_100g: product.nutritionPer100g.protein,
        carbs_per_100g: product.nutritionPer100g.carbs,
        fat_per_100g: product.nutritionPer100g.fat,
        sugar_per_100g: product.nutritionPer100g.sugar,
        fiber_per_100g: product.nutritionPer100g.fiber,
        salt_per_100g: product.nutritionPer100g.sodium / 1000, // mg zu g
        is_community_product: true,
        is_verified: true,
        verification_status: 'approved',
        created_at: new Date().toISOString()
      }))
      
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert(supabaseProducts, { 
            onConflict: 'code',
            ignoreDuplicates: true // Duplikate ignorieren statt Fehler
          })
        
        if (error) {
          console.error(`❌ Batch ${i}-${i + batchSize} failed:`, error)
          skippedCount += batch.length
        } else {
          savedCount += batch.length
          console.log(`✅ Batch ${i}-${i + batchSize} saved (${savedCount}/${products.length})`)
        }
        
      } catch (err) {
        console.error(`❌ Database error for batch ${i}:`, err)
        skippedCount += batch.length
      }
      
      // Pause zwischen Batches
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    return NextResponse.json({
      success: true,
      message: `Enhanced import completed! Saved ${savedCount} new products`,
      imported: savedCount,
      skipped: skippedCount,
      total: products.length,
      stats: {
        topBrands: getTopBrands(products),
        nutritionQuality: {
          highProtein: products.filter(p => p.nutritionPer100g.protein > 15).length,
          lowSugar: products.filter(p => p.nutritionPer100g.sugar < 5).length,
          highFiber: products.filter(p => p.nutritionPer100g.fiber > 5).length,
        },
        brandCoverage: {
          tier1Brands: products.filter(p => ['ferrero', 'nutella', 'milka', 'haribo', 'coca-cola'].includes(p.brand)).length,
          tier2Brands: products.filter(p => ['nestle', 'kelloggs', 'bahlsen', 'ritter-sport', 'knorr'].includes(p.brand)).length,
          supermarketBrands: products.filter(p => ['ja', 'edeka', 'rewe', 'aldi'].includes(p.brand)).length
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Enhanced import error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Enhanced import failed'
    }, { status: 500 })
  }
}

function getTopBrands(products: any[]): Record<string, number> {
  const brandCount = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const sorted = Object.entries(brandCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
  
  const result: Record<string, number> = {}
  sorted.forEach(([brand, count]) => {
    result[brand] = count as number
  })
  
  return result
}

function calculateAvgNutrition(products: any[]): any {
  if (products.length === 0) return {}
  
  const sum = products.reduce((acc, p) => ({
    calories: acc.calories + p.nutritionPer100g.calories,
    protein: acc.protein + p.nutritionPer100g.protein,
    carbs: acc.carbs + p.nutritionPer100g.carbs,
    fat: acc.fat + p.nutritionPer100g.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  
  return {
    calories: Math.round(sum.calories / products.length),
    protein: Math.round(sum.protein / products.length * 10) / 10,
    carbs: Math.round(sum.carbs / products.length * 10) / 10,
    fat: Math.round(sum.fat / products.length * 10) / 10
  }
}
