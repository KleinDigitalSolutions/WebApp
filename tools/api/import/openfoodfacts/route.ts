import { NextRequest, NextResponse } from 'next/server'
import OpenFoodFactsBulkImporter from '@/lib/openfoodfacts-bulk-importer'
import { createClient } from '@supabase/supabase-js'

// Supabase Client mit Service Role für API-Zugriff
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const maxProducts = parseInt(searchParams.get('max') || '100')
    const mode = searchParams.get('mode') || 'essentials' // 'essentials' | 'full'
    const dryRun = searchParams.get('dry_run') === 'true'
    
    console.log(`🚀 Starting OpenFoodFacts bulk import (mode: ${mode}, max: ${maxProducts})`)
    
    const importer = new OpenFoodFactsBulkImporter()
    
    let products: any[]
    if (mode === 'essentials') {
      products = await importer.importSupermarketEssentials(maxProducts)
    } else {
      products = await importer.importGermanProducts(maxProducts)
    }
    
    if (dryRun) {
      // Nur Preview, nicht speichern
      return NextResponse.json({
        success: true,
        message: `Dry run completed - would import ${products.length} products`,
        products: products.slice(0, 10), // Nur erste 10 zur Vorschau
        stats: {
          totalProducts: products.length,
          categories: [...new Set(products.map(p => p.category))],
          brands: [...new Set(products.map(p => p.brand).filter(Boolean))].slice(0, 10),
          avgNutrition: {
            calories: Math.round(products.reduce((sum, p) => sum + p.nutritionPer100g.calories, 0) / products.length),
            protein: Math.round(products.reduce((sum, p) => sum + p.nutritionPer100g.protein, 0) / products.length * 10) / 10
          }
        }
      })
    }
    
    // Produkte in Supabase speichern
    console.log(`💾 Saving ${products.length} products to database...`)
    
    // In Batches speichern (Supabase hat Limits)
    const batchSize = 100
    let savedCount = 0
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      // Konvertiere zu Supabase-Format
      const supabaseProducts = batch.map(product => ({
        name: product.name,
        brand: product.brand || 'Unknown',
        code: product.barcode, // Barcode als code speichern
        category: 'pantry', // Standard-Kategorie für Import
        image_url: product.imageUrl,
        calories_per_100g: product.nutritionPer100g.calories,
        protein_per_100g: product.nutritionPer100g.protein,
        carbs_per_100g: product.nutritionPer100g.carbs,
        fat_per_100g: product.nutritionPer100g.fat,
        sugar_per_100g: product.nutritionPer100g.sugar,
        fiber_per_100g: product.nutritionPer100g.fiber,
        salt_per_100g: product.nutritionPer100g.sodium / 1000, // mg zu g
        sodium_mg: product.nutritionPer100g.sodium * 1000, // g zu mg (falls in OpenFoodFacts als g)
        is_community_product: true,
        is_verified: true, // OpenFoodFacts Daten als verified markieren
        verification_status: 'approved',
        created_at: new Date().toISOString()
      }))
      
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert(supabaseProducts, { 
            onConflict: 'code', // code ist das Barcode-Feld
            ignoreDuplicates: false 
          })
        
        if (error) {
          console.error(`❌ Batch ${i}-${i + batchSize} failed:`, error)
        } else {
          savedCount += batch.length
          console.log(`✅ Saved batch ${i}-${i + batchSize} (${savedCount}/${products.length})`)
        }
        
      } catch (err) {
        console.error(`❌ Database error for batch ${i}:`, err)
      }
      
      // Kurze Pause zwischen Batches
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${savedCount} products from OpenFoodFacts`,
      imported: savedCount,
      total: products.length,
      stats: {
        categories: [...new Set(products.map(p => p.category))],
        topBrands: [...new Set(products.map(p => p.brand).filter(Boolean))].slice(0, 10),
        nutritionRange: {
          calories: {
            min: Math.min(...products.map(p => p.nutritionPer100g.calories)),
            max: Math.max(...products.map(p => p.nutritionPer100g.calories)),
            avg: Math.round(products.reduce((sum, p) => sum + p.nutritionPer100g.calories, 0) / products.length)
          }
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Bulk import error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Bulk import failed'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Alle OpenFoodFacts-Produkte löschen (für Testing)
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('is_community_product', true)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      message: 'All OpenFoodFacts products deleted'
    })
    
  } catch (error) {
    console.error('❌ Delete error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
