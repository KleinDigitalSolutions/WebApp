import 'dotenv/config'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function scrapeLeckerCategory(categoryUrl: string, category: string) {
  const res = await axios.get<string>(categoryUrl)
  const $ = cheerio.load(res.data as string)
  const recipes: any[] = []

  // Neue Logik: Alle <a>-Tags mit Einzelrezept-Links extrahieren
  $('a').each((_, el) => {
    const href = $(el).attr('href')
    // Nur echte Rezeptseiten (Endung -[0-9]+.html)
    if (href && /-[0-9]+\.html$/.test(href)) {
      const link = href.startsWith('http') ? href : 'https://www.lecker.de' + href
      const title = $(el).text().trim()
      // Bild extrahieren: Suche nach <img> im Link oder im Nachbarbereich
      let image = undefined
      const imgEl = $(el).find('img').get(0) || $(el).next('img').get(0)
      if (imgEl) {
        // 1. Versuche srcset (größtes Bild)
        const srcset = $(imgEl).attr('srcset')
        if (srcset) {
          // srcset: "url1 320w, url2 640w, ..."
          const candidates = srcset.split(',').map(s => s.trim().split(' ')[0])
          // Bevorzuge größte URL (letzter Eintrag)
          image = candidates[candidates.length - 1]
        }
        // 2. Falls kein srcset: Versuche data-src, src
        if (!image) image = $(imgEl).attr('data-src')
        if (!image) image = $(imgEl).attr('src')
      }
      // Fallback: wie bisher
      if (!image) {
        const nextImg = $(el).next('img').attr('data-src') || $(el).next('img').attr('src')
        if (nextImg) image = nextImg
      }
      if (title && link && image) {
        recipes.push({ title, link, image, category })
      }
    }
  })

  for (const recipe of recipes) {
    try {
      // Duplikat-Schutz: Prüfe, ob das Rezept schon existiert
      const { data: existing, error: selectError } = await supabase
        .from('recipes')
        .select('id')
        .eq('link', recipe.link)
        .maybeSingle();
      if (selectError) {
        console.error('Fehler bei Duplikat-Check:', selectError);
        continue;
      }
      if (existing) {
        console.log('Übersprungen (Duplikat):', recipe.title);
        continue;
      }
      const detail = await axios.get<string>(recipe.link)
      const $d = cheerio.load(detail.data as string)
      const ingredients = $d('.o-Ingredients__listItem').map((_, el) => $d(el).text().trim()).get()
      recipe.ingredients = ingredients
      const { error } = await supabase.from('recipes').insert([
        {
          title: recipe.title,
          image_url: recipe.image,
          link: recipe.link,
          ingredients: '{' + recipe.ingredients.map((i: string) => `"${i.replace(/"/g, '\"')}"`).join(',') + '}',
          category: recipe.category,
          source: 'lecker'
        }
      ])
      if (error) {
        console.error('Supabase-Fehler:', error)
      } else {
        console.log('Gespeichert:', recipe.title)
      }
    } catch (e) {
      console.error('Fehler bei', recipe.link, e)
    }
  }
}

// Multi-Page Scraping: Lädt bis zu maxPages Seiten automatisch, ab beliebiger Startseite
async function scrapeLeckerCategoryMulti(baseUrl: string, category: string, maxPages = 10, startPage = 1) {
  for (let page = startPage; page < startPage + maxPages; page++) {
    const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`
    console.log(`\n--- Scraping Seite ${page}: ${url} ---`)
    const beforeCount = await countRecipesInDB(category)
    await scrapeLeckerCategory(url, category)
    const afterCount = await countRecipesInDB(category)
    if (afterCount === beforeCount) {
      console.log('Keine neuen Rezepte mehr gefunden, Abbruch.')
      break
    }
  }
}

// Hilfsfunktion: Zählt Rezepte in DB für Kategorie
async function countRecipesInDB(category: string) {
  const { count } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('category', category)
  return count || 0
}

// Beispielaufruf: scrapeLeckerCategoryMulti('https://www.lecker.de/gesundes-essen', 'Gesundes', 10, 3)
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2]
  const cat = process.argv[3] || ''
  const multi = process.argv[4] === 'multi'
  const startPage = parseInt(process.argv[5] || '1', 10)
  if (!url) throw new Error('Bitte Kategorie-URL angeben!')
  if (multi) {
    scrapeLeckerCategoryMulti(url, cat, 10, startPage)
  } else {
    scrapeLeckerCategory(url, cat)
  }
}
