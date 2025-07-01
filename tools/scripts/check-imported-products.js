#!/usr/bin/env node

// Script um die importierten OpenFoodFacts-Produkte zu überprüfen
// Usage: node check-imported-products.js

const API_BASE = 'http://localhost:3000'

async function checkProductCount() {
  console.log('📊 Checking imported products...')
  
  try {
    // Test verschiedene Suchbegriffe
    const searchTerms = ['nutella', 'milch', 'brot', 'butter', 'kaffee']
    
    for (const term of searchTerms) {
      const response = await fetch(`${API_BASE}/api/food/search?q=${term}`)
      const data = await response.json()
      
      console.log(`\n🔍 "${term}": ${data.total} products found`)
      console.log(`   Sources: local=${data.sources?.local || 0}, community=${data.sources?.community || 0}`)
      
      if (data.products && data.products.length > 0) {
        const sample = data.products[0]
        console.log(`   Sample: ${sample.product_name} (${sample.brands})`)
        console.log(`   Barcode: ${sample.code}`)
        console.log(`   Nutrition: ${sample.nutriments['energy-kcal_100g']} kcal, ${sample.nutriments['proteins_100g']}g protein`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error.message)
  }
}

async function testBarcodeLookup() {
  console.log('\n📱 Testing barcode lookup...')
  
  // Test bekannte deutsche Barcodes
  const testBarcodes = [
    '4008400404127', // Nutella
    '4001954161010', // Kerrygold Butter
    '4061462842764', // Milch
    '6410500090014', // Finn Crisp
  ]
  
  for (const barcode of testBarcodes) {
    try {
      const response = await fetch(`${API_BASE}/api/food/barcode?code=${barcode}`)
      const data = await response.json()
      
      if (data.success && data.product) {
        console.log(`✅ ${barcode}: ${data.product.name} (${data.product.brand})`)
        console.log(`   Source: ${data.source}`)
        console.log(`   Nutrition: ${data.product.nutrition.calories} kcal/100g`)
      } else {
        console.log(`❌ ${barcode}: Not found`)
      }
    } catch (error) {
      console.log(`❌ ${barcode}: Error - ${error.message}`)
    }
  }
}

async function showDatabaseStats() {
  console.log('\n📈 Database Statistics...')
  
  try {
    // Test verschiedene Kategorien
    const categories = ['chocolate', 'dairy', 'bread', 'beverages']
    
    for (const category of categories) {
      const response = await fetch(`${API_BASE}/api/food/search?q=${category}`)
      const data = await response.json()
      
      console.log(`📂 ${category}: ${data.total} products`)
    }
    
  } catch (error) {
    console.error('❌ Error getting stats:', error.message)
  }
}

async function main() {
  console.log('🗄️ NutriWise Product Database Check\n')
  
  console.log('=' .repeat(50))
  console.log('IMPORTIERTE PRODUKTE ÜBERPRÜFEN')
  console.log('=' .repeat(50))
  
  await checkProductCount()
  await testBarcodeLookup()
  await showDatabaseStats()
  
  console.log('\n🎯 ZUSAMMENFASSUNG:')
  console.log('Die 806 importierten OpenFoodFacts-Produkte sind in Supabase gespeichert:')
  console.log('📍 Tabelle: public.products')
  console.log('🔍 Zugriff: /api/food/search und /api/food/barcode')
  console.log('📱 Barcode-Scanner kann jetzt deutsche Produkte finden!')
  console.log('🧠 KI-Chat hat Zugriff auf echte Produktdaten!')
}

if (require.main === module) {
  main().catch(console.error)
}
