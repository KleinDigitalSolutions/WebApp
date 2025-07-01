const { createClient } = require('@supabase/supabase-js');
const { default: fetch } = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials missing in environment variables');
  console.error('Make sure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fehlende wichtige Marken basierend auf Analyse
const MISSING_BRANDS = [
  'pepsi',
  'tchibo',
  'erdinger', 
  'schweppes',
  'red bull',
  'monster',
  'berchtesgadener',
  'landliebe',
  'golden toast',
  'bioland',
  'basic',
  'bio zentrale',
  'davert',
  'lebensbaum'
];

// Beverage-specific search terms for better results
const BEVERAGE_TERMS = [
  'cola', 'limo', 'limonade', 'soda', 'energy drink', 'bier', 'beer',
  'mineralwasser', 'wasser', 'juice', 'saft', 'tea', 'tee', 'coffee', 'kaffee'
];

// Bio/Organic terms
const BIO_TERMS = [
  'bio', 'organic', 'ökologisch', 'naturkost', 'vollkorn', 'demeter'
];

async function searchOpenFoodFacts(searchTerm, page = 1) {
  try {
    const url = `https://de.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page=${page}&page_size=50`;
    console.log(`🔍 Searching: ${searchTerm} (page ${page})`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`❌ Error searching for ${searchTerm}:`, error.message);
    return [];
  }
}

async function getExistingBarcodes() {
  try {
    // Prüfe zuerst, ob barcode Spalte existiert, sonst verwende code
    const { data, error } = await supabase
      .from('products')
      .select('barcode')
      .not('barcode', 'is', null)
      .limit(1);
    
    if (error && error.code === '42703') {
      // barcode Spalte existiert nicht, verwende code
      console.log('📝 Using code column (barcode column not found)');
      const { data: codeData, error: codeError } = await supabase
        .from('products')
        .select('code')
        .not('code', 'is', null);
      
      if (codeError) throw codeError;
      return new Set(codeData.map(p => p.code));
    }
    
    if (error) throw error;
    
    // Hole alle barcodes
    const { data: allData, error: allError } = await supabase
      .from('products')
      .select('barcode')
      .not('barcode', 'is', null);
    
    if (allError) throw allError;
    return new Set(allData.map(p => p.barcode));
  } catch (error) {
    console.error('❌ Error fetching existing barcodes:', error);
    return new Set();
  }
}

function isValidProduct(product) {
  // Must have barcode and name
  if (!product.code || !product.product_name_de && !product.product_name) {
    return false;
  }

  // Must have some nutrition data
  const hasNutrition = product.nutriments && (
    product.nutriments.energy_100g ||
    product.nutriments['energy-kcal_100g'] ||
    product.nutriments.proteins_100g ||
    product.nutriments.carbohydrates_100g ||
    product.nutriments.fat_100g
  );

  if (!hasNutrition) {
    return false;
  }

  // Prefer German products
  const isGerman = product.countries_tags && 
    product.countries_tags.some(tag => tag.includes('deutschland') || tag.includes('germany'));

  return isGerman;
}

function extractNutrition(nutriments) {
  if (!nutriments) return {};

  return {
    calories: nutriments['energy-kcal_100g'] || nutriments.energy_100g ? Math.round((nutriments.energy_100g || 0) / 4.184) : null,
    protein: nutriments.proteins_100g || 0,
    carbs: nutriments.carbohydrates_100g || 0,
    fat: nutriments.fat_100g || 0,
    sugar: nutriments.sugars_100g || 0,
    fiber: nutriments.fiber_100g || 0,
    sodium: nutriments.sodium_100g ? nutriments.sodium_100g * 1000 : 0, // Convert to mg
  };
}

async function insertProduct(product) {
  try {
    const nutrition = extractNutrition(product.nutriments);
    const name = product.product_name_de || product.product_name || 'Unbekanntes Produkt';
    
    const productData = {
      name: name.substring(0, 255), // Ensure name fits database limit
      barcode: product.code,
      brand: product.brands || null,
      category: product.categories || null,
      description: product.generic_name_de || product.generic_name || null,
      image_url: product.image_url || null,
      calories_per_100g: nutrition.calories,
      protein_per_100g: nutrition.protein,
      carbs_per_100g: nutrition.carbs,
      fat_per_100g: nutrition.fat,
      sugar_per_100g: nutrition.sugar,
      fiber_per_100g: nutrition.fiber,
      sodium_per_100mg: nutrition.sodium,
      source: 'openfoodfacts',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (duplicate barcode)
        return null;
      }
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error(`❌ Error inserting product ${product.code}:`, error.message);
    return null;
  }
}

async function importMissingBrands() {
  console.log('🚀 Starting Missing Brands Import for NutriWise');
  console.log('================================================\n');

  const existingBarcodes = await getExistingBarcodes();
  console.log(`📊 Found ${existingBarcodes.size} existing products in database\n`);

  let totalNewProducts = 0;
  const brandStats = {};

  // Import missing brands
  for (const brand of MISSING_BRANDS) {
    console.log(`🏷️  Importing brand: ${brand}`);
    brandStats[brand] = 0;

    // Search for brand directly
    let allProducts = await searchOpenFoodFacts(brand, 1);
    
    // If it's a beverage brand, also search with beverage terms
    if (['pepsi', 'schweppes', 'red bull', 'monster', 'erdinger'].includes(brand)) {
      for (const term of BEVERAGE_TERMS) {
        const beverageProducts = await searchOpenFoodFacts(`${brand} ${term}`, 1);
        allProducts = [...allProducts, ...beverageProducts];
      }
    }

    // If it's a bio brand, search with bio terms
    if (['bioland', 'basic', 'bio zentrale', 'davert', 'lebensbaum'].includes(brand)) {
      for (const term of BIO_TERMS) {
        const bioProducts = await searchOpenFoodFacts(`${brand} ${term}`, 1);
        allProducts = [...allProducts, ...bioProducts];
      }
    }

    // Remove duplicates by barcode
    const uniqueProducts = allProducts.reduce((acc, product) => {
      if (!acc.find(p => p.code === product.code)) {
        acc.push(product);
      }
      return acc;
    }, []);

    // Filter and import valid products
    for (const product of uniqueProducts) {
      if (!existingBarcodes.has(product.code) && isValidProduct(product)) {
        const insertedProduct = await insertProduct(product);
        if (insertedProduct) {
          totalNewProducts++;
          brandStats[brand]++;
          existingBarcodes.add(product.code);
          
          if (brandStats[brand] % 5 === 0) {
            console.log(`   ✅ ${brandStats[brand]} products imported for ${brand}`);
          }
        }
      }
    }

    console.log(`   🏁 ${brandStats[brand]} total products imported for ${brand}\n`);
    
    // Add delay to be respectful to API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📈 IMPORT SUMMARY');
  console.log('================');
  console.log(`🆕 Total new products imported: ${totalNewProducts}`);
  console.log('\n📊 Products per brand:');
  
  Object.entries(brandStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} products`);
    });

  console.log('\n✅ Missing brands import completed!');
}

importMissingBrands().catch(console.error);
