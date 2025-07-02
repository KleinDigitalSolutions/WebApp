// Script: list-category-keywords.ts
// Analysiert alle Kategorien in der Supabase-DB und zählt Vorkommen von Teilstrings wie "Kuchen", "Torte", "Salat" etc.
// Ausgabe: Übersicht aller Kategorien und Häufigkeiten von Keywords

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const KEYWORDS = [
  'Kuchen',
  'Torte',
  'Salat',
  'Gebäck',
  'Fleisch',
  'Fisch',
  'Vegetarisch',
  'Vegan',
  'Suppe',
  'Auflauf',
  'Snack',
  'Brot',
  'Frühstück',
  'Low Carb',
  'Schnell',
  'Gesund',
  'Dessert',
  'Pasta',
  'Reis',
  'Grillen',
  'Sommersalat',
  'Winter',
  'Omas',
  'Schokolade',
  'Obst',
  'Gemüse',
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

  // Zähle Vorkommen der Keywords
  const keywordStats: Record<string, number> = {}
  for (const kw of KEYWORDS) {
    keywordStats[kw] = allCategories.filter((cat) => cat && cat.toLowerCase().includes(kw.toLowerCase())).length
  }

  console.log('Alle eindeutigen Kategorien (', uniqueCategories.length, '):')
  for (const cat of uniqueCategories) {
    console.log('-', cat)
  }

  console.log('\nKeyword-Vorkommen:')
  for (const kw of KEYWORDS) {
    console.log(kw.padEnd(15), ':', keywordStats[kw])
  }
}

main()
