#!/usr/bin/env node

// Enhanced Import Test - Bekannte deutsche Marken ohne Duplikate
// Usage: node test-enhanced-import.js

const API_BASE = 'http://localhost:3000'

async function testDuplicateCheck() {
  console.log('🔍 Testing duplicate detection...')
  
  try {
    const response = await fetch(`${API_BASE}/api/import/enhanced?mode=duplicates_check`)
    const data = await response.json()
    
    console.log('✅ Duplicate check completed')
    console.log(`📋 ${data.message}`)
    
    return true
  } catch (error) {
    console.error('❌ Duplicate check failed:', error.message)
    return false
  }
}

async function testEnhancedDryRun(maxProducts = 50) {
  console.log(`🧪 Testing enhanced import (dry run, max ${maxProducts} products)...`)
  
  try {
    const response = await fetch(`${API_BASE}/api/import/enhanced?mode=brands&max=${maxProducts}&dry_run=true`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Enhanced dry run successful!')
      console.log(`📦 Would import ${data.stats.totalProducts} NEW products`)
      console.log(`🏷️ Top brands found:`)
      Object.entries(data.stats.topBrands).forEach(([brand, count]) => {
        console.log(`   ${brand}: ${count} products`)
      })
      console.log(`🧪 Average nutrition: ${data.stats.avgNutrition.calories} kcal, ${data.stats.avgNutrition.protein}g protein`)
      
      console.log('\n📋 Sample new products:')
      data.preview.slice(0, 5).forEach((product, i) => {
        console.log(`${i + 1}. ${product.name} (${product.brand})`)
        console.log(`   Barcode: ${product.barcode}`)
        console.log(`   Nutrition: ${product.nutritionPer100g.calories} kcal, ${product.nutritionPer100g.protein}g protein`)
      })
      
      return data.stats.totalProducts
    } else {
      console.log('❌ Enhanced dry run failed:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return 0
  }
}

async function runEnhancedImport(maxProducts = 2000) {
  console.log(`🚀 Running ENHANCED import (${maxProducts} products - TOP GERMAN BRANDS)...`)
  console.log('⏰ This will take 10-15 minutes...')
  
  try {
    const startTime = Date.now()
    const response = await fetch(`${API_BASE}/api/import/enhanced?mode=brands&max=${maxProducts}`)
    const data = await response.json()
    const duration = Math.round((Date.now() - startTime) / 1000)
    
    if (data.success) {
      console.log('🎉 ENHANCED IMPORT SUCCESSFUL!')
      console.log(`💾 Imported ${data.imported} NEW products in ${duration}s`)
      console.log(`⏭️ Skipped ${data.skipped} duplicates`)
      console.log(`📊 Total processed: ${data.total} products`)
      
      console.log('\n🏷️ Top imported brands:')
      Object.entries(data.stats.topBrands).forEach(([brand, count]) => {
        console.log(`   ${brand}: ${count} products`)
      })
      
      console.log('\n📈 Quality metrics:')
      console.log(`   High protein (>15g): ${data.stats.nutritionQuality.highProtein} products`)
      console.log(`   Low sugar (<5g): ${data.stats.nutritionQuality.lowSugar} products`)
      console.log(`   High fiber (>5g): ${data.stats.nutritionQuality.highFiber} products`)
      
      console.log('\n🎯 Brand coverage:')
      console.log(`   Tier 1 brands (Ferrero, Nutella, etc.): ${data.stats.brandCoverage.tier1Brands} products`)
      console.log(`   Tier 2 brands (Nestlé, Kelloggs, etc.): ${data.stats.brandCoverage.tier2Brands} products`)
      console.log(`   Supermarket brands (ja!, EDEKA, etc.): ${data.stats.brandCoverage.supermarketBrands} products`)
      
      return data.imported
    } else {
      console.log('❌ Enhanced import failed:', data.error)
      return 0
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return 0
  }
}

async function verifyResults() {
  console.log('\n🔎 Verifying import results...')
  
  // Test einige bekannte deutsche Markenprodukte
  const testProducts = [
    'nutella',
    'milka',
    'haribo',
    'ferrero',
    'kelloggs',
    'bahlsen'
  ]
  
  for (const brand of testProducts) {
    try {
      const response = await fetch(`${API_BASE}/api/food/search?q=${brand}`)
      const data = await response.json()
      
      console.log(`📦 ${brand}: ${data.total} products found`)
      
      if (data.products && data.products.length > 0) {
        const communityCount = data.products.filter(p => p.source === 'community').length
        console.log(`   Community products: ${communityCount}`)
      }
      
    } catch (error) {
      console.log(`❌ ${brand}: Error - ${error.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Enhanced OpenFoodFacts Import - Deutsche Top-Marken\n')
  
  // Phase 1: Duplikat-Check
  console.log('='.repeat(60))
  console.log('PHASE 1: DUPLIKAT-ERKENNUNG')
  console.log('='.repeat(60))
  
  const duplicateCheckOk = await testDuplicateCheck()
  if (!duplicateCheckOk) {
    console.log('\n❌ Duplicate check failed - cannot proceed safely')
    process.exit(1)
  }
  
  // Phase 2: Enhanced Dry Run
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 2: ENHANCED DRY RUN')
  console.log('='.repeat(60))
  
  const dryRunCount = await testEnhancedDryRun(100)
  if (dryRunCount === 0) {
    console.log('\n❌ Enhanced dry run failed')
    process.exit(1)
  }
  
  // Phase 3: Confirm and run full import
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 3: FULL ENHANCED IMPORT')
  console.log('='.repeat(60))
  
  console.log('🤔 Ready to import 2000+ products from TOP GERMAN BRANDS?')
  console.log('This will add Ferrero, Milka, Haribo, Nestlé, Kelloggs, Bahlsen, etc.')
  console.log('Duplicates will be automatically skipped.')
  console.log('\nTo proceed, run:')
  console.log('node test-enhanced-import.js --full')
  
  if (process.argv.includes('--full')) {
    console.log('\n🚀 Starting full enhanced import...')
    
    const importedCount = await runEnhancedImport(2000)
    
    if (importedCount > 0) {
      await verifyResults()
      
      console.log(`\n🎊 SUCCESS! Your database now has ${importedCount} additional German brand products!`)
      console.log('🏪 Users can now find products from all major German brands!')
      console.log('📱 Barcode scanner works with Nutella, Milka, Haribo, and hundreds more!')
    }
  }
}

if (require.main === module) {
  main().catch(console.error)
}
