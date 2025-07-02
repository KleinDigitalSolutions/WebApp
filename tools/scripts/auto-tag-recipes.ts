// tools/scripts/auto-tag-recipes.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key für Schreibrechte
)

const TAG_KEYWORDS = [
  'Kuchen', 'Torte', 'Salat', 'Auflauf', 'Suppe', 'Pizza', 'Gebäck', 'Fleisch', 'Fisch',
  'Vegetarisch', 'Vegan', 'Low Carb', 'Schnell', 'Gesund', 'Frühstück', 'Dessert', 'Snack',
  'Brot', 'Brötchen', 'Burger', 'Eintopf', 'Süß', 'Herzhaft', 'Weihnachten', 'Ostern',
  'Sommer', 'Winter', 'Herbst', 'Frühling'
]

// False-Positive-Filter für "Süß" und Co
const EXCLUDE_SUEß = [/süßkartoffel/i, /süßkartoffeln/i]

function getTags(title: string, category?: string): string[] {
  const tags: string[] = []
  for (const keyword of TAG_KEYWORDS) {
    if (keyword === 'Süß') {
      if (/\bSüß(?![a-zA-ZäöüÄÖÜß])/i.test(title) && !EXCLUDE_SUEß.some(r => r.test(title))) {
        tags.push('Süß')
      }
      continue
    }
    if (new RegExp(`(^|[\s.,;:!?()"'-])${keyword}(e|er|en|es|s|n|r|e)?(?![a-zA-ZäöüÄÖÜß])`, 'iu').test(title)) {
      tags.push(keyword)
      continue
    }
    if (category && category.toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  }
  return Array.from(new Set(tags))
}

async function main() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, category')
  if (error) throw error
  for (const recipe of recipes) {
    const tags = getTags(recipe.title, recipe.category)
    await supabase
      .from('recipes')
      .update({ tags })
      .eq('id', recipe.id)
  }
  console.log('Tagging abgeschlossen!')
}

main().catch(console.error)
