#!/usr/bin/env node

// Test-Script für OpenFoodFacts Bulk-Import
// Usage: node test-openfoodfacts-import.js

const API_BASE = 'http://localhost:3000'

async function testDryRun(maxProducts = 20) {
  console.log(`🧪 Testing OpenFoodFacts import (dry run, max ${maxProducts} products)...`)
  
  try {
    const response = await fetch(`${API_BASE}/api/import/openfoodfacts?mode=essentials&max=${maxProducts}&dry_run=true`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Dry run successful!')
      console.log(`📦 Would import ${data.stats.totalProducts} products`)
      console.log(`📂 Categories: ${data.stats.categories.join(', ')}`)
      console.log(`🏷️ Sample brands: ${data.stats.brands.slice(0, 5).join(', ')}`)
      console.log(`🧪 Avg nutrition: ${data.stats.avgNutrition.calories} kcal, ${data.stats.avgNutrition.protein}g protein`)
      
      console.log('\n📋 Sample products:')
      data.products.slice(0, 5).forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`)
        console.log(`   Brand: ${product.brand || 'N/A'}`)
        console.log(`   Barcode: ${product.barcode}`)
        console.log(`   Category: ${product.category}`)
        console.log(`   Nutrition: ${product.nutritionPer100g.calories} kcal, ${product.nutritionPer100g.protein}g protein`)
      })
      
      return data.stats.totalProducts
    } else {
      console.log('❌ Dry run failed:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return 0
  }
}

async function testRealImport(maxProducts = 50) {
  console.log(`🚀 Testing real import (${maxProducts} products)...`)
  
  try {
    const response = await fetch(`${API_BASE}/api/import/openfoodfacts?mode=essentials&max=${maxProducts}`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Import successful!')
      console.log(`💾 Imported ${data.imported}/${data.total} products`)
      console.log(`📂 Categories: ${data.stats.categories.join(', ')}`)
      console.log(`🏷️ Top brands: ${data.stats.topBrands.join(', ')}`)
      console.log(`📊 Nutrition range:`)
      console.log(`   Calories: ${data.stats.nutritionRange.calories.min}-${data.stats.nutritionRange.calories.max} (avg: ${data.stats.nutritionRange.calories.avg})`)
      
      return data.imported
    } else {
      console.log('❌ Import failed:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return 0
  }
}

async function testFullImport(maxProducts = 1000) {
  console.log(`🔥 Testing FULL import (${maxProducts} products) - This will take a while...`)
  
  try {
    const startTime = Date.now()
    const response = await fetch(`${API_BASE}/api/import/openfoodfacts?mode=full&max=${maxProducts}`)
    const data = await response.json()
    const duration = Math.round((Date.now() - startTime) / 1000)
    
    if (data.success) {
      console.log('🎉 FULL IMPORT SUCCESSFUL!')
      console.log(`💾 Imported ${data.imported}/${data.total} products in ${duration}s`)
      console.log(`📂 Categories: ${data.stats.categories.length} (${data.stats.categories.slice(0, 10).join(', ')}...)`)
      console.log(`🏷️ Brands: ${data.stats.topBrands.slice(0, 10).join(', ')}`)
      console.log(`📊 Average calories: ${data.stats.nutritionRange.calories.avg} kcal/100g`)
      
      return data.imported
    } else {
      console.log('❌ Full import failed:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return 0
  }
}

async function main() {
  console.log('🥕 OpenFoodFacts Bulk Import Test\n')
  
  // Phase 1: Dry Run Test
  console.log('='.repeat(50))
  console.log('PHASE 1: DRY RUN TEST')
  console.log('='.repeat(50))
  
  const dryRunCount = await testDryRun(20)
  
  if (dryRunCount === 0) {
    console.log('\n❌ Dry run failed - cannot proceed')
    process.exit(1)
  }
  
  // Phase 2: Small Real Import
  console.log('\n' + '='.repeat(50))
  console.log('PHASE 2: SMALL REAL IMPORT')
  console.log('='.repeat(50))
  
  const smallImportCount = await testRealImport(50)
  
  if (smallImportCount === 0) {
    console.log('\n❌ Small import failed - check database connection')
    process.exit(1)
  }
  
  // Phase 3: Ask for full import
  console.log('\n' + '='.repeat(50))
  console.log('PHASE 3: FULL IMPORT (OPTIONAL)')
  console.log('='.repeat(50))
  
  console.log('🤔 Ready for full import of 1000+ products?')
  console.log('This will take several minutes and significantly expand your database.')
  console.log('\nTo proceed with full import, run:')
  console.log('node test-openfoodfacts-import.js --full')
  
  // Check if --full flag is provided
  if (process.argv.includes('--full')) {
    console.log('\n🚀 Starting full import...')
    const fullImportCount = await testFullImport(1000)
    
    if (fullImportCount > 0) {
      console.log(`\n🎉 SUCCESS! Your NutriWise database now has ${fullImportCount} German products!`)
      console.log('💡 Users can now scan barcodes and find thousands of products!')
    }
  }
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
  main().catch(console.error)
}
