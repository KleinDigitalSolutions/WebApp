import 'dotenv/config'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function scrapeKochrezepteCategory(categoryUrl: string, category: string) {
  const res = await axios.get<string>(categoryUrl)
  const $ = cheerio.load(res.data as string)
  const recipes: any[] = []

  $('.recipe-list-item').each((_, el) => {
    const link = 'https://kochrezepte.de' + $(el).find('a').attr('href')
    const title = $(el).find('.recipe-list-item__title').text().trim()
    const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src')
    if (title && link && image) {
      recipes.push({ title, link, image, category })
    }
  })

  for (const recipe of recipes) {
    try {
      const detail = await axios.get<string>(recipe.link)
      const $d = cheerio.load(detail.data as string)
      const ingredients = $d('.ingredients-list__item').map((_, el) => $d(el).text().trim()).get()
      recipe.ingredients = ingredients
      await supabase.from('recipes').upsert([
        {
          title: recipe.title,
          image_url: recipe.image,
          link: recipe.link,
          ingredients: '{' + recipe.ingredients.map((i: string) => `"${i.replace(/"/g, '\"')}"`).join(',') + '}',
          category: recipe.category,
          source: 'kochrezepte'
        }
      ], { onConflict: 'link' })
    } catch (e) {
      console.error('Fehler bei', recipe.link, e)
    }
  }
}

// Beispielaufruf: scrapeKochrezepteCategory('https://kochrezepte.de/rezepte/salate', 'Salate')
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2]
  const cat = process.argv[3] || ''
  if (!url) throw new Error('Bitte Kategorie-URL angeben!')
  scrapeKochrezepteCategory(url, cat)
}
