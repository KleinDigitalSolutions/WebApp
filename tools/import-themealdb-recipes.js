/**
 * THEMEALDB RECIPE IMPORTER
 * Lädt automatisch Rezepte von TheMealDB in deine Supabase Datenbank
 *
 * USAGE:
 * node tools/import-themealdb-recipes.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Kategorien die wir importieren wollen
const CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous',
  'Pasta', 'Pork', 'Seafood', 'Side', 'Starter',
  'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
];

// Übersetzung für Kategorien (optional)
const CATEGORY_TRANSLATION = {
  'Beef': 'Rindfleisch',
  'Chicken': 'Hähnchen',
  'Dessert': 'Dessert',
  'Lamb': 'Lamm',
  'Miscellaneous': 'Sonstiges',
  'Pasta': 'Pasta',
  'Pork': 'Schweinefleisch',
  'Seafood': 'Meeresfrüchte',
  'Side': 'Beilage',
  'Starter': 'Vorspeise',
  'Vegan': 'Vegan',
  'Vegetarian': 'Vegetarisch',
  'Breakfast': 'Frühstück',
  'Goat': 'Ziege'
};

async function fetchRecipesByCategory(category) {
  console.log(`📡 Lade Rezepte für Kategorie: ${category}...`);

  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );

  const data = await response.json();

  if (!data.meals) {
    console.log(`⚠️  Keine Rezepte für ${category} gefunden`);
    return [];
  }

  // Hole Details für jedes Rezept (TheMealDB filter gibt nur IDs)
  const detailedRecipes = [];

  for (const meal of data.meals.slice(0, 10)) { // Max 10 pro Kategorie
    const detailResponse = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
    );
    const detailData = await detailResponse.json();

    if (detailData.meals && detailData.meals[0]) {
      detailedRecipes.push(detailData.meals[0]);
    }

    // Rate limiting - warte 100ms zwischen Anfragen
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return detailedRecipes;
}

function formatRecipeForSupabase(meal, category) {
  // Extrahiere Zutaten
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || ''
      });
    }
  }

  return {
    title: meal.strMeal,
    description: meal.strMeal,
    image_url: meal.strMealThumb,
    link: `https://www.themealdb.com/meal/${meal.idMeal}`,
    ingredients: JSON.stringify(ingredients),
    instructions: meal.strInstructions || '',
    category: CATEGORY_TRANSLATION[category] || category,
    source: 'themealdb',
    is_public: true,
    prep_time_minutes: null,
    cook_time_minutes: null,
    servings: 4,
    tags: [meal.strCategory, meal.strArea].filter(Boolean),
    nutrition_info: JSON.stringify({})
  };
}

async function importRecipes() {
  console.log('🚀 Starte TheMealDB Import...\n');

  let totalImported = 0;
  let totalSkipped = 0;

  for (const category of CATEGORIES) {
    const recipes = await fetchRecipesByCategory(category);

    if (recipes.length === 0) {
      continue;
    }

    console.log(`✅ ${recipes.length} Rezepte gefunden für ${category}`);

    for (const recipe of recipes) {
      const formattedRecipe = formatRecipeForSupabase(recipe, category);

      // Prüfe ob Rezept schon existiert (per link)
      const { data: existing } = await supabase
        .from('recipes')
        .select('id')
        .eq('link', formattedRecipe.link)
        .single();

      if (existing) {
        console.log(`⏭️  Überspringe: ${formattedRecipe.title} (existiert schon)`);
        totalSkipped++;
        continue;
      }

      // Importiere Rezept
      const { error } = await supabase
        .from('recipes')
        .insert([formattedRecipe]);

      if (error) {
        console.error(`❌ Fehler bei ${formattedRecipe.title}:`, error.message);
      } else {
        console.log(`✅ Importiert: ${formattedRecipe.title}`);
        totalImported++;
      }
    }

    console.log(''); // Leerzeile nach jeder Kategorie
  }

  console.log('\n🎉 Import abgeschlossen!');
  console.log(`✅ ${totalImported} Rezepte importiert`);
  console.log(`⏭️  ${totalSkipped} Rezepte übersprungen (existieren schon)`);
}

// Starte Import
importRecipes().catch(console.error);
