#!/usr/bin/env node

// Marken-Analyse Script - Welche deutschen Marken haben wir bereits?
// Usage: node brands-analysis.js

const API_BASE = 'http://localhost:3000'

async function analyzeBrands() {
  console.log('🔍 Analysiere vorhandene deutsche Marken...\n')
  
  // Top deutsche Marken die wir haben sollten
  const expectedBrands = [
    // Tier 1 - Absolute Must-Haves
    'ferrero', 'nutella', 'milka', 'haribo', 'coca-cola', 'ritter-sport', 'lindt', 'kinder',
    
    // Tier 2 - Sehr bekannt
    'nestle', 'kelloggs', 'bahlsen', 'knorr', 'maggi', 'dr-oetker', 'lorenz', 'leibniz',
    
    // Getränke
    'pepsi', 'red-bull', 'monster', 'schweppes', 'beck', 'warsteiner', 'erdinger',
    
    // Milchprodukte
    'muller', 'danone', 'weihenstephan', 'landliebe', 'berchtesgadener',
    
    // Bio & Premium
    'alnatura', 'bioland', 'dennree', 'lebensbaum',
    
    // Kaffee & Tee
    'jacobs', 'tchibo', 'dallmayr', 'teekanne',
    
    // Supermarkt-Eigenmarken
    'ja', 'edeka', 'rewe', 'aldi', 'lidl', 'gut-gunstig',
    
    // Weitere wichtige
    'barilla', 'thomy', 'develey', 'heinz', 'hellmanns'
  ]
  
  const foundBrands = []
  const missingBrands = []
  
  console.log('📊 Prüfe Marken-Verfügbarkeit:\n')
  
  for (const brand of expectedBrands) {
    try {
      const response = await fetch(`${API_BASE}/api/food/search?q=${brand}`)
      const data = await response.json()
      
      if (data.total > 0) {
        const communityProducts = data.products ? data.products.filter(p => p.source === 'community').length : 0
        foundBrands.push({ brand, total: data.total, community: communityProducts })
        
        const status = data.total >= 5 ? '✅' : data.total >= 2 ? '⚠️' : '🔸'
        console.log(`${status} ${brand}: ${data.total} Produkte (${communityProducts} community)`)
      } else {
        missingBrands.push(brand)
        console.log(`❌ ${brand}: 0 Produkte`)
      }
      
      // Kleine Pause um API nicht zu überlasten
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.log(`❌ ${brand}: Error - ${error.message}`)
      missingBrands.push(brand)
    }
  }
  
  // Zusammenfassung
  console.log('\n' + '='.repeat(60))
  console.log('📊 MARKEN-ANALYSE ZUSAMMENFASSUNG')
  console.log('='.repeat(60))
  
  console.log(`\n✅ VORHANDENE MARKEN: ${foundBrands.length}/${expectedBrands.length} (${Math.round(foundBrands.length/expectedBrands.length*100)}%)`)
  
  // Top gefundene Marken
  const topBrands = foundBrands
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
  
  console.log('\n🏆 TOP 10 MARKEN (nach Produktanzahl):')
  topBrands.forEach((brand, i) => {
    console.log(`${i+1}.  ${brand.brand}: ${brand.total} Produkte`)
  })
  
  // Fehlende wichtige Marken
  console.log('\n❌ FEHLENDE WICHTIGE MARKEN:')
  if (missingBrands.length > 0) {
    missingBrands.forEach(brand => {
      console.log(`   • ${brand}`)
    })
  } else {
    console.log('   🎉 Alle wichtigen Marken vorhanden!')
  }
  
  // Empfehlungen
  console.log('\n💡 EMPFEHLUNGEN:')
  const lowCoverageBrands = foundBrands.filter(b => b.total < 5)
  
  if (lowCoverageBrands.length > 0) {
    console.log('⚠️  Marken mit wenigen Produkten (< 5):')
    lowCoverageBrands.forEach(brand => {
      console.log(`   • ${brand.brand}: nur ${brand.total} Produkte`)
    })
  }
  
  if (missingBrands.length > 0) {
    console.log(`❗ ${missingBrands.length} wichtige Marken fehlen komplett`)
    console.log('   Führe nochmal einen Enhanced Import aus!')
  }
  
  // Gesamtstatistik
  const totalProducts = foundBrands.reduce((sum, b) => sum + b.total, 0)
  const totalCommunity = foundBrands.reduce((sum, b) => sum + b.community, 0)
  
  console.log('\n📈 GESAMT-STATISTIK:')
  console.log(`   📦 Gesamt-Produkte: ${totalProducts}`)
  console.log(`   🏪 Community-Produkte: ${totalCommunity}`)
  console.log(`   🏷️ Marken-Abdeckung: ${Math.round(foundBrands.length/expectedBrands.length*100)}%`)
  
  if (foundBrands.length / expectedBrands.length >= 0.8) {
    console.log('\n🎉 EXCELLENT! Sehr gute Marken-Abdeckung!')
  } else if (foundBrands.length / expectedBrands.length >= 0.6) {
    console.log('\n👍 GUT! Solide Marken-Abdeckung, kann aber noch erweitert werden.')
  } else {
    console.log('\n⚠️  Marken-Abdeckung ausbaufähig. Mehr Imports empfohlen!')
  }
  
  return { foundBrands, missingBrands, totalProducts }
}

async function main() {
  console.log('🇩🇪 Deutsche Marken-Analyse für NutriWise\n')
  
  try {
    const results = await analyzeBrands()
    
    console.log('\n🚀 NÄCHSTE SCHRITTE:')
    if (results.missingBrands.length > 0) {
      console.log('1. Enhanced Import für fehlende Marken ausführen')
      console.log('2. Gezielt nach Bio-Marken und Premium-Produkten suchen')
      console.log('3. Regionale deutsche Marken erweitern')
    } else {
      console.log('✅ Marken-Datenbank ist sehr vollständig!')
      console.log('💡 Optional: Produktanzahl einzelner Marken erweitern')
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Marken-Analyse:', error)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
