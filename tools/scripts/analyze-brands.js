#!/usr/bin/env node

// Marken-Analyse Script - Welche deutschen Marken haben wir bereits?
// Usage: node analyze-brands.js

const API_BASE = 'http://localhost:3000'

// Liste der wichtigsten deutschen/internationalen Marken in Deutschland
const expectedGermanBrands = {
  // Tier 1: Absolute Must-Have Marken
  tier1: [
    'ferrero', 'nutella', 'milka', 'haribo', 'coca-cola', 'pepsi',
    'ritter-sport', 'lindt', 'kinder', 'hanuta'
  ],
  
  // Tier 2: Sehr bekannte Marken
  tier2: [
    'nestle', 'nestlé', 'kelloggs', 'bahlsen', 'knorr', 'maggi',
    'dr-oetker', 'lorenz', 'leibniz', 'tchibo', 'jacobs'
  ],
  
  // Tier 3: Deutsche Klassiker & Getränke
  tier3: [
    'beck', 'warsteiner', 'krombacher', 'bitburger', 'erdinger',
    'fanta', 'sprite', 'schweppes', 'red-bull', 'monster'
  ],
  
  // Tier 4: Milchprodukte & Molkerei
  tier4: [
    'muller', 'danone', 'weihenstephan', 'andechser', 'berchtesgadener',
    'landliebe', 'bauer', 'ehrmann', 'zott', 'almighurt'
  ],
  
  // Tier 5: Supermarkt-Eigenmarken
  tier5: [
    'ja', 'gut-gunstig', 'edeka', 'rewe', 'aldi', 'lidl',
    'kaufland', 'netto', 'penny', 'real'
  ],
  
  // Tier 6: Brot, Backwaren & Aufstriche
  tier6: [
    'golden-toast', 'lieken', 'harry', 'mestemacher', 'pumpernickel',
    'nutella', 'ovomaltine', 'milka', 'zentis', 'schwartau'
  ],
  
  // Tier 7: Bio & Premium Marken
  tier7: [
    'alnatura', 'demeter', 'bioland', 'rapunzel', 'dennree',
    'basic', 'bio-zentrale', 'davert', 'lebensbaum'
  ]
}

async function analyzeExistingBrands() {
  console.log('🔍 Analyzing existing brands in database...\n')
  
  const allExpectedBrands = Object.values(expectedGermanBrands).flat()
  const foundBrands = {}
  const missingBrands = []
  
  // Teste jede erwartete Marke
  for (const brand of allExpectedBrands) {
    try {
      const response = await fetch(`${API_BASE}/api/food/search?q=${brand}`)
      const data = await response.json()
      
      if (data.total > 0) {
        const communityProducts = data.products?.filter(p => p.source === 'community').length || 0
        foundBrands[brand] = {
          total: data.total,
          community: communityProducts,
          local: data.total - communityProducts
        }
      } else {
        missingBrands.push(brand)
      }
      
      // Kurze Pause um API nicht zu überlasten
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.log(`⚠️ Error checking ${brand}:`, error.message)
      missingBrands.push(brand)
    }
  }
  
  return { foundBrands, missingBrands }
}

async function showBrandAnalysis() {
  const { foundBrands, missingBrands } = await analyzeExistingBrands()
  
  console.log('📊 MARKEN-ANALYSE RESULTS\n')
  console.log('='.repeat(60))
  
  // Gefundene Marken nach Kategorien
  Object.entries(expectedGermanBrands).forEach(([tier, brands]) => {
    console.log(`\n🏷️ ${tier.toUpperCase()}:`)
    
    brands.forEach(brand => {
      if (foundBrands[brand]) {
        const info = foundBrands[brand]
        console.log(`   ✅ ${brand}: ${info.total} products (${info.community} community + ${info.local} local)`)
      } else {
        console.log(`   ❌ ${brand}: MISSING`)
      }
    })
  })
  
  // Zusammenfassung
  const totalFound = Object.keys(foundBrands).length
  const totalExpected = Object.values(expectedGermanBrands).flat().length
  const coveragePercent = Math.round((totalFound / totalExpected) * 100)
  
  console.log('\n' + '='.repeat(60))
  console.log('📈 ZUSAMMENFASSUNG:')
  console.log(`   Gefundene Marken: ${totalFound}/${totalExpected} (${coveragePercent}%)`)
  console.log(`   Fehlende Marken: ${missingBrands.length}`)
  
  // Top gefundene Marken
  console.log('\n🏆 TOP GEFUNDENE MARKEN:')
  Object.entries(foundBrands)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10)
    .forEach(([brand, info]) => {
      console.log(`   ${brand}: ${info.total} products`)
    })
  
  // Wichtigste fehlende Marken
  console.log('\n❌ WICHTIGSTE FEHLENDE MARKEN:')
  const tier1Missing = missingBrands.filter(brand => expectedGermanBrands.tier1.includes(brand))
  const tier2Missing = missingBrands.filter(brand => expectedGermanBrands.tier2.includes(brand))
  
  if (tier1Missing.length > 0) {
    console.log(`   Tier 1 (kritisch): ${tier1Missing.join(', ')}`)
  }
  if (tier2Missing.length > 0) {
    console.log(`   Tier 2 (wichtig): ${tier2Missing.join(', ')}`)
  }
  
  // Empfehlungen
  console.log('\n💡 EMPFEHLUNGEN:')
  if (coveragePercent < 70) {
    console.log('   🔄 Weitere Imports nötig - viele wichtige Marken fehlen noch')
  } else if (coveragePercent < 85) {
    console.log('   👍 Gute Abdeckung - noch ein paar wichtige Marken ergänzen')
  } else {
    console.log('   🎉 Excellente Marken-Abdeckung erreicht!')
  }
  
  if (tier1Missing.length > 0) {
    console.log(`   🎯 Fokus auf Tier 1 Marken: ${tier1Missing.slice(0, 5).join(', ')}`)
  }
  
  return { foundBrands, missingBrands, coveragePercent }
}

async function suggestNextImport() {
  console.log('\n🎯 NÄCHSTE IMPORT-STRATEGIE:\n')
  
  const { missingBrands, coveragePercent } = await showBrandAnalysis()
  
  if (coveragePercent < 80) {
    console.log('🚀 Empfehlung: Nochmal Enhanced Import mit Fokus auf fehlende Marken')
    console.log('   Command: node test-enhanced-import.js --full')
    console.log('   Wird automatisch noch nicht importierte Marken priorisieren')
  }
  
  if (missingBrands.includes('pepsi') || missingBrands.includes('fanta')) {
    console.log('🥤 Getränke-Import könnte sich lohnen')
  }
  
  if (missingBrands.includes('alnatura') || missingBrands.includes('rapunzel')) {
    console.log('🌱 Bio-Marken-Import fehlt noch')
  }
  
  console.log('\n📱 Status für Barcode-Scanner:')
  if (coveragePercent > 75) {
    console.log('   ✅ Scanner wird die meisten deutschen Supermarkt-Produkte finden')
  } else {
    console.log('   ⚠️ Scanner könnte noch viele Produkte nicht finden')
  }
}

async function main() {
  console.log('🇩🇪 Deutsche Marken-Analyse für TrackFood\n')
  
  try {
    await suggestNextImport()
  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
