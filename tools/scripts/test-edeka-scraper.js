#!/usr/bin/env node

// Test-Script für Edeka Scraper
// Usage: node test-edeka-scraper.js

const API_BASE = 'http://localhost:3000'

async function testEdekaConnection() {
  console.log('🧪 Testing Edeka connection...')
  
  try {
    const response = await fetch(`${API_BASE}/api/scraping/edeka?test=true`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Connection successful!')
      console.log(`📂 Found ${data.categoriesFound} categories:`)
      data.categories.forEach((cat, i) => {
        console.log(`  ${i + 1}. ${cat}`)
      })
      return true
    } else {
      console.log('❌ Connection failed:', data.message)
      console.log('💡 Recommendation:', data.recommendation)
      return false
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return false
  }
}

async function testProductScraping(maxProducts = 5) {
  console.log(`🛒 Testing product scraping (max ${maxProducts} products)...`)
  
  try {
    const response = await fetch(`${API_BASE}/api/scraping/edeka?max=${maxProducts}`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Scraping successful!')
      console.log(`📦 Scraped ${data.stats.totalProducts} products`)
      console.log(`🧪 ${data.stats.withNutrition} with nutrition data`)
      console.log(`📊 ${data.stats.withBarcodes} with barcodes`)
      console.log(`📂 ${data.stats.categories} categories`)
      
      console.log('\n📋 Sample products:')
      data.products.slice(0, 3).forEach((product, i) => {
        console.log(`\n${i + 1}. ${product.name}`)
        console.log(`   Brand: ${product.brand || 'N/A'}`)
        console.log(`   Price: ${product.price || 'N/A'}`)
        console.log(`   Barcode: ${product.barcode || 'N/A'}`)
        if (product.nutritionPer100g) {
          console.log(`   Nutrition: ${product.nutritionPer100g.calories || 0} kcal, ${product.nutritionPer100g.protein || 0}g protein`)
        }
      })
      
      return data.products
    } else {
      console.log('❌ Scraping failed:', data.error)
      console.log('💡 Recommendation:', data.recommendation)
      return []
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return []
  }
}

async function main() {
  console.log('🥕 Edeka Scraper Test\n')
  
  // Zuerst Verbindung testen
  const connectionOk = await testEdekaConnection()
  
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed with scraping - connection failed')
    process.exit(1)
  }
  
  console.log('\n' + '='.repeat(50))
  
  // Dann paar Produkte scrapen
  const products = await testProductScraping(5)
  
  if (products.length > 0) {
    console.log(`\n🎉 Success! Edeka scraper is working!`)
    console.log(`💡 Ready to scale up to 1000+ products`)
  } else {
    console.log(`\n❌ No products scraped - check bot protection`)
  }
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
  main().catch(console.error)
}
