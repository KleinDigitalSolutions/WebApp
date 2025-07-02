// Script: list-category-keywords-advanced.ts
// Zweck: Analysiert alle Kategorien in der Supabase-DB und zählt Vorkommen von Keywords wie "Kuchen", "Torte", "Salat", usw.
// Ergebnis: Gibt eine Übersicht aller Kategorien und deren Häufigkeit nach Keyword-Gruppen aus.

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const KEYWORDS = [
  'Kuchen',
  'Torte',
  'Salat',
  'Sommersalat',
  'Gebäck',
  'Fleisch',
  'Fisch',
  'Vegetarisch',
  'Vegan',
  'Low Carb',
  'Schnell',
  'Gesund',
  'Frühstück',
  'Dessert',
  'Suppe',
  'Auflauf',
  'Pasta',
  'Reis',
  'Grillen',
  'Snack',
  'Brot',
  'Brötchen',
  'Pizza',
  'Burger',
  'Eintopf',
  'Süß',
  'Herzhaft',
  'Weihnachten',
  'Ostern',
  'Sommer',
  'Winter',
  'Herbst',
  'Frühling',
]

async function main() {
  const { data, error } = await supabase
    .from('recipes')
    .select('category')
    .neq('category', null)

  if (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
    process.exit(1)
  }

  const allCategories = data.map((r: { category: string }) => r.category)
  const uniqueCategories = Array.from(new Set(allCategories))

  // Zähle Vorkommen pro Keyword
  const keywordStats: Record<string, { count: number; categories: string[] }> = {}
  for (const keyword of KEYWORDS) {
    keywordStats[keyword] = { count: 0, categories: [] }
    for (const cat of uniqueCategories) {
      if (cat.toLowerCase().includes(keyword.toLowerCase())) {
        keywordStats[keyword].count++
        keywordStats[keyword].categories.push(cat)
      }
    }
  }

  // Ausgabe
  console.log('--- Kategorien-Analyse nach Keywords ---')
  for (const keyword of KEYWORDS) {
    if (keywordStats[keyword].count > 0) {
      console.log(
        `${keyword}: ${keywordStats[keyword].count} Kategorien → [${keywordStats[keyword].categories.join(', ')}]`
      )
    }
  }
  console.log('\nAlle eindeutigen Kategorien:')
  console.log(uniqueCategories.sort().join(', '))
}

main()
