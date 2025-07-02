// Script: debug-keyword-matches.ts
// Zweck: Zeigt für jedes Filter-Keyword die Anzahl und Beispiel-Titel, die im Titel ein Match ergeben würden.

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const FILTER_KEYWORDS = [
  'Kuchen', 'Torte', 'Salat', 'Auflauf', 'Suppe', 'Pizza', 'Gebäck', 'Fleisch', 'Fisch',
  'Vegetarisch', 'Vegan', 'Low Carb', 'Schnell', 'Gesund', 'Frühstück', 'Dessert', 'Snack',
  'Brot', 'Brötchen', 'Burger', 'Eintopf', 'Süß', 'Herzhaft', 'Weihnachten', 'Ostern',
  'Sommer', 'Winter', 'Herbst', 'Frühling',
]

async function main() {
  const { data, error } = await supabase
    .from('recipes')
    .select('title')
    .neq('title', null)

  if (error) {
    console.error('Fehler beim Laden:', error)
    process.exit(1)
  }

  const titles = data.map((r: any) => r.title?.trim()).filter(Boolean)
  for (const keyword of FILTER_KEYWORDS) {
    const matches = titles.filter(title => title.toLowerCase().includes(keyword.toLowerCase()))
    if (matches.length > 0) {
      console.log(`\nKeyword: ${keyword} (${matches.length} Treffer)`)
      for (const t of matches.slice(0, 5)) {
        console.log('  -', t)
      }
    }
  }
}

main()
