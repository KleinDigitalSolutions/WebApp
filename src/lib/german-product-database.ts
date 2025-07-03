// Deutsche Produktdatenbank - Kuratierte echte Supermarktprodukte
export interface GermanProductDB {
  code: string
  name: string
  brand: string
  category: 'dairy' | 'meat' | 'bakery' | 'frozen' | 'beverages' | 'fruits' | 'vegetables' | 'snacks' | 'pantry'
  supermarkets: ('rewe' | 'edeka' | 'aldi' | 'lidl' | 'penny' | 'netto')[]
  price_range: {
    min: number
    max: number
  }
  image_url?: string
  nutrition: {
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    fiber_per_100g?: number
    sugar_per_100g?: number
    salt_per_100g?: number
  }
  allergens?: string[]
  keywords: string[]
}

export class GermanProductDatabase {
  private static products: GermanProductDB[] = [
    // MILCHPRODUKTE
    {
      code: 'de_milk_weihenstephan_vollmilch',
      name: 'Weihenstephan Vollmilch 3,5%',
      brand: 'Weihenstephan',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.39, max: 1.59 },
      nutrition: {
        calories_per_100g: 64,
        protein_per_100g: 3.4,
        carbs_per_100g: 4.8,
        fat_per_100g: 3.5,
        sugar_per_100g: 4.8,
        salt_per_100g: 0.12
      },
      allergens: ['Milch'],
      keywords: ['milch', 'vollmilch', 'weihenstephan', 'frischmilch']
    },
    {
      code: 'de_yogurt_danone_naturjoghurt',
      name: 'Danone Naturjoghurt 3,5%',
      brand: 'Danone',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 0.79, max: 0.99 },
      nutrition: {
        calories_per_100g: 66,
        protein_per_100g: 4.3,
        carbs_per_100g: 4.7,
        fat_per_100g: 3.5,
        sugar_per_100g: 4.7,
        salt_per_100g: 0.13
      },
      allergens: ['Milch'],
      keywords: ['joghurt', 'naturjoghurt', 'danone', 'milchprodukt']
    },
    
    // BROT & BACKWAREN
    {
      code: 'de_bread_harry_vollkornbrot',
      name: 'Harry Vollkornbrot 750g',
      brand: 'Harry',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 250,
        protein_per_100g: 8.5,
        carbs_per_100g: 45.2,
        fat_per_100g: 3.1,
        fiber_per_100g: 7.0,
        salt_per_100g: 1.2
      },
      allergens: ['Gluten'],
      keywords: ['brot', 'vollkornbrot', 'harry', 'vollkorn', 'kastenbrot']
    },
    {
      code: 'de_bread_golden_toast',
      name: 'Golden Toast Buttertoast',
      brand: 'Golden Toast',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.29, max: 1.49 },
      nutrition: {
        calories_per_100g: 265,
        protein_per_100g: 8.9,
        carbs_per_100g: 47.0,
        fat_per_100g: 4.2,
        fiber_per_100g: 3.2,
        salt_per_100g: 1.1
      },
      allergens: ['Gluten', 'Milch', 'Ei'],
      keywords: ['toast', 'buttertoast', 'golden toast', 'toastbrot', 'weißbrot']
    },

    // PIZZA & TIEFKÜHL
    {
      code: 'de_pizza_dr_oetker_ristorante_margherita',
      name: 'Dr. Oetker Ristorante Pizza Margherita',
      brand: 'Dr. Oetker',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 2.79, max: 3.29 },
      nutrition: {
        calories_per_100g: 218,
        protein_per_100g: 9.2,
        carbs_per_100g: 26.0,
        fat_per_100g: 8.5,
        fiber_per_100g: 1.8,
        salt_per_100g: 1.3
      },
      allergens: ['Gluten', 'Milch'],
      keywords: ['pizza', 'margherita', 'dr oetker', 'ristorante', 'tiefkühl']
    },
    {
      code: 'de_pizza_wagner_big_boston',
      name: 'Wagner Big Pizza Boston',
      brand: 'Wagner',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 3.29, max: 3.79 },
      nutrition: {
        calories_per_100g: 245,
        protein_per_100g: 11.0,
        carbs_per_100g: 25.0,
        fat_per_100g: 12.0,
        fiber_per_100g: 2.1,
        salt_per_100g: 1.4
      },
      allergens: ['Gluten', 'Milch'],
      keywords: ['pizza', 'wagner', 'big pizza', 'boston', 'salami', 'tiefkühl']
    },

    // FLEISCH & WURST
    {
      code: 'de_sausage_ruegenwalder_teewurst',
      name: 'Rügenwalder Teewurst fein',
      brand: 'Rügenwalder',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 327,
        protein_per_100g: 18.0,
        carbs_per_100g: 1.0,
        fat_per_100g: 28.0,
        salt_per_100g: 2.8
      },
      keywords: ['teewurst', 'rügenwalder', 'wurst', 'streichwurst', 'aufschnitt']
    },

    // OBST & GEMÜSE
    {
      code: 'de_fruit_apples_elstar',
      name: 'Äpfel Elstar',
      brand: 'Regional',
      category: 'fruits',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 2.29, max: 2.79 },
      nutrition: {
        calories_per_100g: 52,
        protein_per_100g: 0.3,
        carbs_per_100g: 11.4,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.0,
        sugar_per_100g: 10.4
      },
      keywords: ['äpfel', 'apfel', 'elstar', 'obst', 'frisch']
    },
    {
      code: 'de_fruit_bananas_chiquita',
      name: 'Chiquita Bananen',
      brand: 'Chiquita',
      category: 'fruits',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 89,
        protein_per_100g: 1.1,
        carbs_per_100g: 20.0,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.6,
        sugar_per_100g: 17.2
      },
      keywords: ['bananen', 'banane', 'chiquita', 'obst', 'frisch']
    },

    // EIER
    {
      code: 'de_eggs_freiland_rewe_bio',
      name: 'REWE Bio Eier Freilandhaltung 10er',
      brand: 'REWE Bio',
      category: 'dairy',
      supermarkets: ['rewe'],
      price_range: { min: 2.79, max: 3.19 },
      nutrition: {
        calories_per_100g: 155,
        protein_per_100g: 13.0,
        carbs_per_100g: 0.7,
        fat_per_100g: 11.0,
        salt_per_100g: 0.35
      },
      allergens: ['Ei'],
      keywords: ['eier', 'freiland', 'bio', 'rewe', 'frisch']
    },

    // GETRÄNKE
    {
      code: 'de_water_volvic_still',
      name: 'Volvic Natürliches Mineralwasser still',
      brand: 'Volvic',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 0.79, max: 1.19 },
      nutrition: {
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0
      },
      keywords: ['wasser', 'mineralwasser', 'volvic', 'still', 'getränk']
    },

    // PASTA & PANTRY
    {
      code: 'de_pasta_barilla_spaghetti',
      name: 'Barilla Spaghetti No.5',
      brand: 'Barilla',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 351,
        protein_per_100g: 12.0,
        carbs_per_100g: 70.0,
        fat_per_100g: 1.5,
        fiber_per_100g: 2.5,
        salt_per_100g: 0.005
      },
      allergens: ['Gluten'],
      keywords: ['pasta', 'spaghetti', 'barilla', 'nudeln', 'teigwaren']
    },

    // SNACKS
    {
      code: 'de_chips_funny_frisch_chipsfrisch',
      name: 'funny-frisch Chipsfrisch ungarisch',
      brand: 'funny-frisch',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 537,
        protein_per_100g: 6.5,
        carbs_per_100g: 50.0,
        fat_per_100g: 34.0,
        fiber_per_100g: 4.5,
        salt_per_100g: 1.8
      },
      keywords: ['chips', 'funny frisch', 'chipsfrisch', 'ungarisch', 'snack']
    },

    // WEITERE ECHTE DEUTSCHE SUPERMARKT PRODUKTE

    // NUTELLA & BROTAUFSTRICHE
    {
      code: 'de_nutella_ferrero_450g',
      name: 'Nutella Nuss-Nougat-Creme',
      brand: 'Ferrero',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 3.99, max: 4.79 },
      nutrition: {
        calories_per_100g: 539,
        protein_per_100g: 6.3,
        carbs_per_100g: 57.5,
        fat_per_100g: 30.9,
        sugar_per_100g: 56.3,
        salt_per_100g: 0.107
      },
      allergens: ['Milch', 'Nüsse', 'Soja'],
      keywords: ['nutella', 'nuss nougat creme', 'ferrero', 'brotaufstrich', 'süß']
    },

    // HAFERFLOCKEN & MÜSLI
    {
      code: 'de_koelln_haferflocken_zart',
      name: 'Kölln Haferflocken zart',
      brand: 'Kölln',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 368,
        protein_per_100g: 13.5,
        carbs_per_100g: 58.7,
        fat_per_100g: 7.0,
        fiber_per_100g: 10.0,
        salt_per_100g: 0.02
      },
      allergens: ['Gluten'],
      keywords: ['haferflocken', 'kölln', 'müsli', 'vollkorn', 'frühstück']
    },

    // FRISCHKÄSE
    {
      code: 'de_philadelphia_original',
      name: 'Philadelphia Frischkäse Original',
      brand: 'Philadelphia (Mondelez)',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.89, max: 2.19 },
      nutrition: {
        calories_per_100g: 265,
        protein_per_100g: 5.4,
        carbs_per_100g: 3.8,
        fat_per_100g: 25.0,
        salt_per_100g: 0.9
      },
      allergens: ['Milch'],
      keywords: ['philadelphia', 'frischkäse', 'streichkäse', 'cremig']
    },

    // BUTTER
    {
      code: 'de_kerrygold_butter_original',
      name: 'Kerrygold Original Irische Butter',
      brand: 'Kerrygold',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 717,
        protein_per_100g: 0.7,
        carbs_per_100g: 0.6,
        fat_per_100g: 80.0,
        salt_per_100g: 0.02
      },
      allergens: ['Milch'],
      keywords: ['kerrygold', 'butter', 'irische butter', 'streichfett']
    },

    // KETCHUP & SAUCEN
    {
      code: 'de_heinz_ketchup',
      name: 'Heinz Tomaten Ketchup',
      brand: 'Heinz',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.89, max: 3.29 },
      nutrition: {
        calories_per_100g: 112,
        protein_per_100g: 1.2,
        carbs_per_100g: 27.0,
        fat_per_100g: 0.1,
        sugar_per_100g: 23.0,
        salt_per_100g: 1.8
      },
      keywords: ['ketchup', 'heinz', 'tomaten', 'sauce', 'würze']
    },

    // PESTO
    {
      code: 'de_barilla_pesto_genovese',
      name: 'Barilla Pesto Genovese',
      brand: 'Barilla',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 2.79, max: 3.19 },
      nutrition: {
        calories_per_100g: 467,
        protein_per_100g: 5.1,
        carbs_per_100g: 5.0,
        fat_per_100g: 46.0,
        salt_per_100g: 3.2
      },
      allergens: ['Milch', 'Nüsse'],
      keywords: ['pesto', 'barilla', 'genovese', 'basilikum', 'sauce']
    },

    // GETRÄNKE
    {
      code: 'de_coca_cola_1_25l',
      name: 'Coca-Cola Original',
      brand: 'Coca-Cola',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 42,
        protein_per_100g: 0,
        carbs_per_100g: 10.6,
        fat_per_100g: 0,
        sugar_per_100g: 10.6
      },
      keywords: ['coca cola', 'cola', 'softdrink', 'erfrischung']
    },

    {
      code: 'de_red_bull_energy',
      name: 'Red Bull Energy Drink',
      brand: 'Red Bull',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.29, max: 1.49 },
      nutrition: {
        calories_per_100g: 45,
        protein_per_100g: 0,
        carbs_per_100g: 11.0,
        fat_per_100g: 0,
        sugar_per_100g: 11.0
      },
      keywords: ['red bull', 'energy drink', 'koffein', 'taurin']
    },

    // NÜSSE
    {
      code: 'de_alesto_walnuesse',
      name: 'Alesto Walnüsse',
      brand: 'Alesto',
      category: 'snacks',
      supermarkets: ['lidl'],
      price_range: { min: 3.99, max: 4.49 },
      nutrition: {
        calories_per_100g: 654,
        protein_per_100g: 15.2,
        carbs_per_100g: 13.7,
        fat_per_100g: 65.2,
        fiber_per_100g: 6.7,
        salt_per_100g: 0.01
      },
      allergens: ['Nüsse'],
      keywords: ['walnüsse', 'alesto', 'nüsse', 'gesund', 'snack']
    },

    {
      code: 'de_alesto_cashews',
      name: 'Alesto Cashewkerne naturbelassen',
      brand: 'Alesto',
      category: 'snacks',
      supermarkets: ['lidl'],
      price_range: { min: 4.99, max: 5.49 },
      nutrition: {
        calories_per_100g: 553,
        protein_per_100g: 18.2,
        carbs_per_100g: 30.2,
        fat_per_100g: 43.9,
        fiber_per_100g: 3.3,
        salt_per_100g: 0.01
      },
      allergens: ['Nüsse'],
      keywords: ['cashews', 'cashewkerne', 'alesto', 'nüsse', 'naturbelassen']
    },

    // SÜSSWAREN
    {
      code: 'de_toffifee_storck',
      name: 'Toffifee',
      brand: 'Storck',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 487,
        protein_per_100g: 5.8,
        carbs_per_100g: 61.0,
        fat_per_100g: 24.0,
        sugar_per_100g: 58.0,
        salt_per_100g: 0.28
      },
      allergens: ['Milch', 'Nüsse', 'Soja'],
      keywords: ['toffifee', 'storck', 'süßigkeiten', 'karamell', 'haselnuss']
    },

    // PFLANZLICHE ALTERNATIVEN
    {
      code: 'de_alpro_haferdrink',
      name: 'Alpro Haferdrink Original',
      brand: 'Alpro',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 46,
        protein_per_100g: 1.0,
        carbs_per_100g: 6.6,
        fat_per_100g: 1.5,
        fiber_per_100g: 0.8,
        salt_per_100g: 0.1
      },
      keywords: ['alpro', 'haferdrink', 'hafermilch', 'pflanzlich', 'vegan']
    },

    {
      code: 'de_oatly_barista',
      name: 'Oatly Hafer Barista Edition',
      brand: 'Oatly',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.19, max: 2.59 },
      nutrition: {
        calories_per_100g: 59,
        protein_per_100g: 1.0,
        carbs_per_100g: 6.6,
        fat_per_100g: 3.0,
        fiber_per_100g: 0.8,
        salt_per_100g: 0.1
      },
      keywords: ['oatly', 'hafer', 'barista', 'kaffeemilch', 'vegan']
    },

    // RÜGENWALDER VEGANE PRODUKTE
    {
      code: 'de_ruegenwalder_veganer_schinken',
      name: 'Rügenwalder Veganer Schinken Spicker',
      brand: 'Rügenwalder Mühle',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.99, max: 2.39 },
      nutrition: {
        calories_per_100g: 156,
        protein_per_100g: 14.0,
        carbs_per_100g: 4.1,
        fat_per_100g: 9.0,
        fiber_per_100g: 1.5,
        salt_per_100g: 2.3
      },
      allergens: ['Soja'],
      keywords: ['rügenwalder', 'veganer schinken', 'spicker', 'vegan', 'fleischersatz']
    },

    // MARGARINE
    {
      code: 'de_rama_margarine',
      name: 'Rama Margarine',
      brand: 'Rama',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 714,
        protein_per_100g: 0.2,
        carbs_per_100g: 0.2,
        fat_per_100g: 80.0,
        salt_per_100g: 0.2
      },
      keywords: ['rama', 'margarine', 'streichfett', 'pflanzlich']
    },

    // HÜTTENKÄSE
    {
      code: 'de_gervais_huettenkaese',
      name: 'Gervais Hüttenkäse körniger Frischkäse',
      brand: 'Gervais',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.39, max: 1.69 },
      nutrition: {
        calories_per_100g: 102,
        protein_per_100g: 12.0,
        carbs_per_100g: 3.5,
        fat_per_100g: 4.2,
        salt_per_100g: 0.8
      },
      allergens: ['Milch'],
      keywords: ['hüttenkäse', 'gervais', 'körniger frischkäse', 'protein']
    },

    // ERDNÜSSE
    {
      code: 'de_ueltje_erdnuesse',
      name: 'Ültje Erdnüsse geröstet & gesalzen',
      brand: 'Ültje',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 598,
        protein_per_100g: 25.3,
        carbs_per_100g: 7.9,
        fat_per_100g: 52.0,
        fiber_per_100g: 8.1,
        salt_per_100g: 1.0
      },
      allergens: ['Erdnüsse'],
      keywords: ['erdnüsse', 'ültje', 'geröstet', 'gesalzen', 'snack']
    },

    // MÜLLER KEFIR
    {
      code: 'de_mueller_kefir',
      name: 'Müller Kefir pur',
      brand: 'Müller',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 60,
        protein_per_100g: 3.0,
        carbs_per_100g: 4.0,
        fat_per_100g: 3.5,
        salt_per_100g: 0.1
      },
      allergens: ['Milch'],
      keywords: ['kefir', 'müller', 'probiotisch', 'milchgetränk']
    },

    // MEHR MILCHPRODUKTE
    {
      code: 'de_milsani_vollmilch',
      name: 'Milsani H-Vollmilch 3,5% Fett',
      brand: 'Milsani',
      category: 'dairy',
      supermarkets: ['aldi'],
      price_range: { min: 1.09, max: 1.29 },
      nutrition: {
        calories_per_100g: 64,
        protein_per_100g: 3.4,
        carbs_per_100g: 4.8,
        fat_per_100g: 3.5,
        sugar_per_100g: 4.8,
        salt_per_100g: 0.12
      },
      allergens: ['Milch'],
      keywords: ['milch', 'vollmilch', 'milsani', 'aldi', 'h-milch']
    },

    {
      code: 'de_buko_der_sahnige',
      name: 'Buko - Der Sahnige Frischkäse',
      brand: 'Arla',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.79, max: 2.09 },
      nutrition: {
        calories_per_100g: 265,
        protein_per_100g: 5.4,
        carbs_per_100g: 3.8,
        fat_per_100g: 25.0,
        salt_per_100g: 0.9
      },
      allergens: ['Milch'],
      keywords: ['buko', 'frischkäse', 'arla', 'sahnig', 'cremig']
    },

    {
      code: 'de_almette_natur',
      name: 'Almette Natur Frischkäse',
      brand: 'Almette',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 265,
        protein_per_100g: 5.4,
        carbs_per_100g: 3.8,
        fat_per_100g: 25.0,
        salt_per_100g: 0.9
      },
      allergens: ['Milch'],
      keywords: ['almette', 'frischkäse', 'natur', 'streichkäse']
    },

    {
      code: 'de_almette_krauter',
      name: 'Almette Kräuter Frischkäse',
      brand: 'Almette',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 265,
        protein_per_100g: 5.4,
        carbs_per_100g: 3.8,
        fat_per_100g: 25.0,
        salt_per_100g: 0.9
      },
      allergens: ['Milch'],
      keywords: ['almette', 'frischkäse', 'kräuter', 'würzig']
    },

    {
      code: 'de_bresso_krauter_provence',
      name: 'Bresso Kräuter der Provence',
      brand: 'Bresso',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.79, max: 2.09 },
      nutrition: {
        calories_per_100g: 265,
        protein_per_100g: 5.4,
        carbs_per_100g: 3.8,
        fat_per_100g: 25.0,
        salt_per_100g: 0.9
      },
      allergens: ['Milch'],
      keywords: ['bresso', 'kräuter', 'provence', 'frischkäse', 'französisch']
    },

    {
      code: 'de_skyr_arla',
      name: 'Arla Skyr Natur',
      brand: 'Arla',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 63,
        protein_per_100g: 11.0,
        carbs_per_100g: 4.0,
        fat_per_100g: 0.2,
        sugar_per_100g: 4.0,
        salt_per_100g: 0.1
      },
      allergens: ['Milch'],
      keywords: ['skyr', 'arla', 'isländisch', 'protein', 'natur']
    },

    {
      code: 'de_elinas_griechischer_joghurt',
      name: 'Elinas Joghurt Griechischer Art',
      brand: 'Elinas',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 133,
        protein_per_100g: 8.0,
        carbs_per_100g: 4.5,
        fat_per_100g: 9.0,
        sugar_per_100g: 4.5,
        salt_per_100g: 0.1
      },
      allergens: ['Milch'],
      keywords: ['elinas', 'griechischer joghurt', 'cremig', 'protein']
    },

    // MEHR BROT & BACKWAREN
    {
      code: 'de_lieken_urkorn_vollkornbrot',
      name: 'Lieken Urkorn Vollkornbrot',
      brand: 'Lieken',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.99, max: 2.39 },
      nutrition: {
        calories_per_100g: 234,
        protein_per_100g: 7.0,
        carbs_per_100g: 43.0,
        fat_per_100g: 3.0,
        fiber_per_100g: 6.0,
        salt_per_100g: 1.1
      },
      allergens: ['Gluten'],
      keywords: ['lieken', 'urkorn', 'vollkornbrot', 'vollkorn', 'gesund']
    },
    {
      code: 'de_pumpernickel_mestemacher',
      name: 'Mestemacher Pumpernickel',
      brand: 'Mestemacher',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.19, max: 1.49 },
      nutrition: {
        calories_per_100g: 188,
        protein_per_100g: 5.7,
        carbs_per_100g: 37.5,
        fat_per_100g: 1.3,
        fiber_per_100g: 8.2,
        salt_per_100g: 1.2
      },
      allergens: ['Gluten'],
      keywords: ['pumpernickel', 'mestemacher', 'roggen', 'vollkorn', 'westfälisch']
    },
    {
      code: 'de_knackebrot_wasa',
      name: 'Wasa Knäckebrot Vollkorn',
      brand: 'Wasa',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 366,
        protein_per_100g: 11.0,
        carbs_per_100g: 65.0,
        fat_per_100g: 4.5,
        fiber_per_100g: 11.0,
        salt_per_100g: 1.8
      },
      allergens: ['Gluten'],
      keywords: ['wasa', 'knäckebrot', 'vollkorn', 'schwedisch', 'crisp']
    },

    // MEHR FLEISCH & WURST
    {
      code: 'de_leberwurst_herta',
      name: 'Herta Leberwurst fein',
      brand: 'Herta',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 287,
        protein_per_100g: 14.0,
        carbs_per_100g: 1.5,
        fat_per_100g: 25.0,
        salt_per_100g: 1.9
      },
      keywords: ['leberwurst', 'herta', 'wurst', 'streichwurst', 'fein']
    },
    {
      code: 'de_salami_villa_gusto',
      name: 'Villa Gusto Salami Italiano',
      brand: 'Villa Gusto',
      category: 'meat',
      supermarkets: ['rewe', 'edeka'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 407,
        protein_per_100g: 23.0,
        carbs_per_100g: 1.0,
        fat_per_100g: 34.0,
        salt_per_100g: 4.2
      },
      keywords: ['salami', 'villa gusto', 'italien', 'aufschnitt', 'würzig']
    },
    {
      code: 'de_schinken_schwarzwalder',
      name: 'Schwarzwälder Schinken',
      brand: 'Regional',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 3.99, max: 4.79 },
      nutrition: {
        calories_per_100g: 155,
        protein_per_100g: 25.0,
        carbs_per_100g: 0.5,
        fat_per_100g: 6.0,
        salt_per_100g: 5.5
      },
      keywords: ['schwarzwälder schinken', 'geräuchert', 'aufschnitt', 'traditional']
    },

    // MEHR SÜSSWAREN & SNACKS
    {
      code: 'de_haribo_goldbaren',
      name: 'Haribo Goldbären',
      brand: 'Haribo',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 343,
        protein_per_100g: 6.9,
        carbs_per_100g: 77.0,
        fat_per_100g: 0.5,
        sugar_per_100g: 46.0,
        salt_per_100g: 0.07
      },
      keywords: ['haribo', 'goldbären', 'gummibärchen', 'süßigkeiten', 'fruchtgummi']
    },
    {
      code: 'de_kinder_schokolade',
      name: 'Kinder Schokolade',
      brand: 'Ferrero',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 566,
        protein_per_100g: 8.7,
        carbs_per_100g: 50.5,
        fat_per_100g: 35.0,
        sugar_per_100g: 50.0,
        salt_per_100g: 0.24
      },
      allergens: ['Milch', 'Nüsse', 'Soja'],
      keywords: ['kinder schokolade', 'ferrero', 'milchschokolade', 'süß']
    },
    {
      code: 'de_kinder_bueno',
      name: 'Kinder Bueno',
      brand: 'Ferrero',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 563,
        protein_per_100g: 8.5,
        carbs_per_100g: 49.5,
        fat_per_100g: 37.0,
        sugar_per_100g: 47.5,
        salt_per_100g: 0.20
      },
      allergens: ['Milch', 'Nüsse', 'Gluten', 'Soja'],
      keywords: ['kinder bueno', 'ferrero', 'haselnuss', 'waffel', 'cremig']
    },
    {
      code: 'de_duplo_hanuta',
      name: 'Duplo Hanuta',
      brand: 'Ferrero',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.69, max: 1.99 },
      nutrition: {
        calories_per_100g: 569,
        protein_per_100g: 8.0,
        carbs_per_100g: 42.0,
        fat_per_100g: 40.0,
        sugar_per_100g: 40.0,
        salt_per_100g: 0.15
      },
      allergens: ['Milch', 'Nüsse', 'Gluten', 'Soja'],
      keywords: ['duplo', 'hanuta', 'ferrero', 'haselnuss', 'waffel']
    },
    {
      code: 'de_milka_alpenmilch',
      name: 'Milka Alpenmilch Schokolade',
      brand: 'Milka',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 534,
        protein_per_100g: 7.0,
        carbs_per_100g: 57.0,
        fat_per_100g: 30.0,
        sugar_per_100g: 56.0,
        salt_per_100g: 0.24
      },
      allergens: ['Milch', 'Nüsse', 'Soja'],
      keywords: ['milka', 'alpenmilch', 'schokolade', 'lila', 'süß']
    },
    {
      code: 'de_ritter_sport_vollnuss',
      name: 'Ritter Sport Vollnuss',
      brand: 'Ritter Sport',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 576,
        protein_per_100g: 12.0,
        carbs_per_100g: 42.0,
        fat_per_100g: 42.0,
        sugar_per_100g: 41.0,
        salt_per_100g: 0.02
      },
      allergens: ['Milch', 'Nüsse', 'Soja'],
      keywords: ['ritter sport', 'vollnuss', 'haselnuss', 'quadratisch', 'schokolade']
    },

    // MEHR GETRÄNKE
    {
      code: 'de_apfelschorle_adelholzener',
      name: 'Adelholzener Apfelschorle',
      brand: 'Adelholzener',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 0.79, max: 1.09 },
      nutrition: {
        calories_per_100g: 24,
        protein_per_100g: 0.1,
        carbs_per_100g: 5.8,
        fat_per_100g: 0,
        sugar_per_100g: 5.8
      },
      keywords: ['apfelschorle', 'adelholzener', 'schorle', 'erfrischend', 'spritzig']
    },
    {
      code: 'de_orangensaft_hohes_c',
      name: 'Hohes C Orangensaft',
      brand: 'Hohes C',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 42,
        protein_per_100g: 0.7,
        carbs_per_100g: 9.6,
        fat_per_100g: 0.2,
        sugar_per_100g: 9.0
      },
      keywords: ['orangensaft', 'hohes c', 'vitamin c', 'saft', 'orange']
    },
    {
      code: 'de_coffee_jacobs_kronung',
      name: 'Jacobs Krönung Kaffee',
      brand: 'Jacobs',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 4.99, max: 5.79 },
      nutrition: {
        calories_per_100g: 2,
        protein_per_100g: 0.2,
        carbs_per_100g: 0.3,
        fat_per_100g: 0,
        sugar_per_100g: 0
      },
      keywords: ['kaffee', 'jacobs', 'krönung', 'aromatic', 'gemahlen']
    },
    {
      code: 'de_tea_teekanne_fruchte',
      name: 'Teekanne Früchtetee',
      brand: 'Teekanne',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 1,
        protein_per_100g: 0,
        carbs_per_100g: 0.2,
        fat_per_100g: 0,
        sugar_per_100g: 0
      },
      keywords: ['tee', 'teekanne', 'früchtetee', 'beutel', 'frucht']
    },

    // MEHR GRUNDNAHRUNGSMITTEL
    {
      code: 'de_reis_oncle_bens',
      name: 'Uncle Bens Reis Spitzen-Langkorn',
      brand: 'Uncle Bens',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 354,
        protein_per_100g: 7.4,
        carbs_per_100g: 78.0,
        fat_per_100g: 0.9,
        fiber_per_100g: 1.4,
        salt_per_100g: 0.01
      },
      keywords: ['reis', 'uncle bens', 'langkorn', 'spitzen', 'beilage']
    },
    {
      code: 'de_mehl_type_405',
      name: 'Weizenmehl Type 405',
      brand: 'Aurora',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 0.89, max: 1.19 },
      nutrition: {
        calories_per_100g: 364,
        protein_per_100g: 10.0,
        carbs_per_100g: 70.9,
        fat_per_100g: 1.0,
        fiber_per_100g: 3.2,
        salt_per_100g: 0.01
      },
      allergens: ['Gluten'],
      keywords: ['mehl', 'weizenmehl', 'type 405', 'aurora', 'backen']
    },
    {
      code: 'de_zucker_diamant',
      name: 'Diamant Kristallzucker',
      brand: 'Diamant',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.19, max: 1.49 },
      nutrition: {
        calories_per_100g: 405,
        protein_per_100g: 0,
        carbs_per_100g: 99.8,
        fat_per_100g: 0,
        sugar_per_100g: 99.8,
        salt_per_100g: 0
      },
      keywords: ['zucker', 'kristallzucker', 'diamant', 'süßen', 'backen']
    },
    {
      code: 'de_speisesalz_bad_reichenhaller',
      name: 'Bad Reichenhaller Speisesalz',
      brand: 'Bad Reichenhaller',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 0.59, max: 0.89 },
      nutrition: {
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        salt_per_100g: 99.5
      },
      keywords: ['salz', 'speisesalz', 'bad reichenhaller', 'würzen', 'kochen']
    },

    // MEHR TIEFKÜHLPRODUKTE
    {
      code: 'de_iglo_schlemmerfilet',
      name: 'Iglo Schlemmer Filet Bordelaise',
      brand: 'Iglo',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.79, max: 3.19 },
      nutrition: {
        calories_per_100g: 125,
        protein_per_100g: 12.0,
        carbs_per_100g: 4.0,
        fat_per_100g: 6.5,
        salt_per_100g: 0.9
      },
      keywords: ['iglo', 'schlemmerfilet', 'fisch', 'bordelaise', 'tiefkühl']
    },
    {
      code: 'de_frosta_gemuese_pfanne',
      name: 'FRoSTA Gemüse Pfanne Asia',
      brand: 'FRoSTA',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 35,
        protein_per_100g: 2.0,
        carbs_per_100g: 5.0,
        fat_per_100g: 1.0,
        fiber_per_100g: 3.0,
        salt_per_100g: 0.8
      },
      keywords: ['frosta', 'gemüse', 'pfanne', 'asia', 'tiefkühl', 'gesund']
    },

    // MEHR CONVENIENCE FOOD
    {
      code: 'de_knorr_fix_gulasch',
      name: 'Knorr Fix Gulasch',
      brand: 'Knorr',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 0.79, max: 1.09 },
      nutrition: {
        calories_per_100g: 334,
        protein_per_100g: 10.0,
        carbs_per_100g: 55.0,
        fat_per_100g: 7.5,
        salt_per_100g: 19.0
      },
      allergens: ['Gluten', 'Sellerie'],
      keywords: ['knorr', 'fix', 'gulasch', 'würzmischung', 'kochen']
    },
    {
      code: 'de_maggi_5_minuten_terrine',
      name: 'Maggi 5 Minuten Terrine Nudeln',
      brand: 'Maggi',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 380,
        protein_per_100g: 11.0,
        carbs_per_100g: 65.0,
        fat_per_100g: 9.0,
        salt_per_100g: 3.2
      },
      allergens: ['Gluten', 'Ei'],
      keywords: ['maggi', '5 minuten terrine', 'nudeln', 'instant', 'schnell']
    },

    // MEHR SOJAPRODUKTE & VEGETARISCH
    {
      code: 'de_alpro_soja_drink',
      name: 'Alpro Soja Drink Original',
      brand: 'Alpro',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 41,
        protein_per_100g: 3.3,
        carbs_per_100g: 2.5,
        fat_per_100g: 1.8,
        fiber_per_100g: 0.5,
        salt_per_100g: 0.11
      },
      keywords: ['alpro', 'soja drink', 'sojamilch', 'pflanzlich', 'vegan']
    },
    {
      code: 'de_tofu_taifun',
      name: 'Taifun Tofu Natur',
      brand: 'Taifun',
      category: 'meat',
      supermarkets: ['rewe', 'edeka'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 132,
        protein_per_100g: 13.0,
        carbs_per_100g: 1.5,
        fat_per_100g: 8.0,
        fiber_per_100g: 1.0,
        salt_per_100g: 0.01
      },
      allergens: ['Soja'],
      keywords: ['tofu', 'taifun', 'soja', 'vegan', 'protein']
    },

    // VERDOPPLUNG DER DATENBANK - NOCH MEHR ECHTE DEUTSCHE PRODUKTE

    // MEHR KÄSE & MILCHPRODUKTE
    {
      code: 'de_gouda_jung_aldi',
      name: 'Gouda jung in Scheiben',
      brand: 'Milbona',
      category: 'dairy',
      supermarkets: ['aldi'],
      price_range: { min: 1.99, max: 2.39 },
      nutrition: {
        calories_per_100g: 356,
        protein_per_100g: 25.0,
        carbs_per_100g: 0,
        fat_per_100g: 28.0,
        salt_per_100g: 2.0
      },
      allergens: ['Milch'],
      keywords: ['gouda', 'käse', 'milbona', 'aldi', 'scheiben']
    },

    {
      code: 'de_camembert_president',
      name: 'Président Camembert',
      brand: 'Président',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 291,
        protein_per_100g: 20.0,
        carbs_per_100g: 0.5,
        fat_per_100g: 23.0,
        salt_per_100g: 1.5
      },
      allergens: ['Milch'],
      keywords: ['camembert', 'président', 'weichkäse', 'französisch']
    },

    {
      code: 'de_emmentaler_schweizer',
      name: 'Schweizer Emmentaler',
      brand: 'Original',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 3.49, max: 3.99 },
      nutrition: {
        calories_per_100g: 382,
        protein_per_100g: 28.0,
        carbs_per_100g: 0.2,
        fat_per_100g: 30.0,
        salt_per_100g: 0.5
      },
      allergens: ['Milch'],
      keywords: ['emmentaler', 'schweizer', 'hartkäse', 'löcher']
    },

    {
      code: 'de_mozzarella_galbani',
      name: 'Galbani Mozzarella',
      brand: 'Galbani',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 254,
        protein_per_100g: 18.0,
        carbs_per_100g: 2.2,
        fat_per_100g: 20.0,
        salt_per_100g: 0.5
      },
      allergens: ['Milch'],
      keywords: ['mozzarella', 'galbani', 'italien', 'pizza', 'frisch']
    },

    // MEHR FLEISCH & AUFSCHNITT
    {
      code: 'de_putenbrust_herta',
      name: 'Herta Putenbrust geräuchert',
      brand: 'Herta',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.89, max: 3.29 },
      nutrition: {
        calories_per_100g: 102,
        protein_per_100g: 21.0,
        carbs_per_100g: 1.0,
        fat_per_100g: 2.0,
        salt_per_100g: 2.1
      },
      keywords: ['putenbrust', 'herta', 'geräuchert', 'aufschnitt', 'mager']
    },

    {
      code: 'de_mortadella_villa_gusto',
      name: 'Villa Gusto Mortadella',
      brand: 'Villa Gusto',
      category: 'meat',
      supermarkets: ['rewe', 'edeka'],
      price_range: { min: 2.19, max: 2.59 },
      nutrition: {
        calories_per_100g: 311,
        protein_per_100g: 15.0,
        carbs_per_100g: 1.5,
        fat_per_100g: 27.0,
        salt_per_100g: 2.3
      },
      keywords: ['mortadella', 'villa gusto', 'italien', 'wurst', 'pistazien']
    },

    {
      code: 'de_bratwurst_thueringer',
      name: 'Thüringer Rostbratwurst',
      brand: 'Regional',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 285,
        protein_per_100g: 13.0,
        carbs_per_100g: 1.0,
        fat_per_100g: 25.0,
        salt_per_100g: 2.0
      },
      keywords: ['bratwurst', 'thüringer', 'rostbratwurst', 'grillen', 'regional']
    },

    // MEHR BROT & BACKWAREN
    {
      code: 'de_laugenbrezeln_backwerk',
      name: 'Laugenbrezeln',
      brand: 'Backwerk',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.99, max: 2.39 },
      nutrition: {
        calories_per_100g: 290,
        protein_per_100g: 8.0,
        carbs_per_100g: 55.0,
        fat_per_100g: 4.5,
        salt_per_100g: 2.8
      },
      allergens: ['Gluten'],
      keywords: ['laugenbrezeln', 'backwerk', 'brezeln', 'salz', 'bayern']
    },

    {
      code: 'de_roggenbrot_paderborner',
      name: 'Paderborner Roggenbrot',
      brand: 'Paderborner',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 210,
        protein_per_100g: 6.0,
        carbs_per_100g: 42.0,
        fat_per_100g: 1.5,
        fiber_per_100g: 8.0,
        salt_per_100g: 1.4
      },
      allergens: ['Gluten'],
      keywords: ['roggenbrot', 'paderborner', 'roggen', 'vollkorn', 'dunkel']
    },

    {
      code: 'de_croissants_coppenrath',
      name: 'Coppenrath Butter Croissants',
      brand: 'Coppenrath & Wiese',
      category: 'bakery',
      supermarkets: ['rewe', 'edeka', 'lidl'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 406,
        protein_per_100g: 8.0,
        carbs_per_100g: 42.0,
        fat_per_100g: 23.0,
        salt_per_100g: 1.1
      },
      allergens: ['Gluten', 'Milch', 'Ei'],
      keywords: ['croissants', 'coppenrath', 'butter', 'französisch', 'blätterteig']
    },

    // MEHR SÜSSWAREN
    {
      code: 'de_nimm2_storck',
      name: 'nimm2 Bonbons',
      brand: 'Storck',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 385,
        protein_per_100g: 0.1,
        carbs_per_100g: 96.0,
        fat_per_100g: 0.1,
        sugar_per_100g: 96.0
      },
      keywords: ['nimm2', 'storck', 'bonbons', 'vitamin', 'frucht']
    },

    {
      code: 'de_manner_schnitten',
      name: 'Manner Schnitten',
      brand: 'Manner',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 513,
        protein_per_100g: 6.0,
        carbs_per_100g: 65.0,
        fat_per_100g: 26.0,
        sugar_per_100g: 48.0
      },
      allergens: ['Gluten', 'Nüsse', 'Soja'],
      keywords: ['manner', 'schnitten', 'waffel', 'haselnuss', 'österreich']
    },

    {
      code: 'de_yogurette_ferrero',
      name: 'Yogurette',
      brand: 'Ferrero',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.59, max: 1.89 },
      nutrition: {
        calories_per_100g: 555,
        protein_per_100g: 7.5,
        carbs_per_100g: 51.0,
        fat_per_100g: 36.0,
        sugar_per_100g: 50.0
      },
      allergens: ['Milch', 'Nüsse', 'Gluten'],
      keywords: ['yogurette', 'ferrero', 'joghurt', 'erdbeer', 'riegel']
    },

    {
      code: 'de_knoppers_storck',
      name: 'Knoppers',
      brand: 'Storck',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.69, max: 1.99 },
      nutrition: {
        calories_per_100g: 549,
        protein_per_100g: 7.0,
        carbs_per_100g: 52.0,
        fat_per_100g: 35.0,
        sugar_per_100g: 39.0
      },
      allergens: ['Milch', 'Nüsse', 'Gluten'],
      keywords: ['knoppers', 'storck', 'waffel', 'haselnuss', 'milch']
    },

    // MEHR TIEFKÜHLPRODUKTE
    {
      code: 'de_pizza_gustavo_gusto_margherita',
      name: 'Gustavo Gusto Pizza Margherita',
      brand: 'Gustavo Gusto',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka'],
      price_range: { min: 3.99, max: 4.49 },
      nutrition: {
        calories_per_100g: 235,
        protein_per_100g: 10.0,
        carbs_per_100g: 28.0,
        fat_per_100g: 9.5,
        salt_per_100g: 1.2
      },
      allergens: ['Gluten', 'Milch'],
      keywords: ['pizza', 'gustavo gusto', 'margherita', 'steinofen', 'premium']
    },

    {
      code: 'de_lasagne_iglo',
      name: 'Iglo Lasagne Bolognese',
      brand: 'Iglo',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 3.29, max: 3.79 },
      nutrition: {
        calories_per_100g: 145,
        protein_per_100g: 7.5,
        carbs_per_100g: 12.0,
        fat_per_100g: 7.0,
        salt_per_100g: 0.9
      },
      allergens: ['Gluten', 'Milch', 'Ei'],
      keywords: ['lasagne', 'iglo', 'bolognese', 'hackfleisch', 'italienisch']
    },

    {
      code: 'de_pommes_mccain',
      name: 'McCain Pommes frites',
      brand: 'McCain',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.89, max: 2.29 },
      nutrition: {
        calories_per_100g: 168,
        protein_per_100g: 3.0,
        carbs_per_100g: 26.0,
        fat_per_100g: 6.0,
        fiber_per_100g: 3.0,
        salt_per_100g: 0.4
      },
      keywords: ['pommes', 'mccain', 'kartoffeln', 'fritten', 'tiefkühl']
    },

    // MEHR GETRÄNKE
    {
      code: 'de_fanta_orange',
      name: 'Fanta Orange',
      brand: 'Coca-Cola',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 42,
        protein_per_100g: 0,
        carbs_per_100g: 10.4,
        fat_per_100g: 0,
        sugar_per_100g: 10.4
      },
      keywords: ['fanta', 'orange', 'limonade', 'erfrischung', 'süß']
    },

    {
      code: 'de_sprite_lemon',
      name: 'Sprite Lemon-Lime',
      brand: 'Coca-Cola',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.79, max: 2.19 },
      nutrition: {
        calories_per_100g: 37,
        protein_per_100g: 0,
        carbs_per_100g: 9.0,
        fat_per_100g: 0,
        sugar_per_100g: 9.0
      },
      keywords: ['sprite', 'lemon lime', 'zitrone', 'klar', 'spritzig']
    },

    {
      code: 'de_apfelsaft_beckers_bester',
      name: 'Beckers Bester Apfelsaft',
      brand: 'Beckers Bester',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.49, max: 1.89 },
      nutrition: {
        calories_per_100g: 46,
        protein_per_100g: 0.1,
        carbs_per_100g: 11.0,
        fat_per_100g: 0.1,
        sugar_per_100g: 10.0
      },
      keywords: ['apfelsaft', 'beckers bester', 'apfel', 'naturtrüb', 'saft']
    },

    {
      code: 'de_mineralwasser_gerolsteiner',
      name: 'Gerolsteiner Mineralwasser sprudel',
      brand: 'Gerolsteiner',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 0.79, max: 1.19 },
      nutrition: {
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0
      },
      keywords: ['mineralwasser', 'gerolsteiner', 'sprudel', 'kohlensäure', 'eifel']
    },

    // MEHR KEKSE & GEBÄCK
    {
      code: 'de_butterkekse_leibniz',
      name: 'Leibniz Butterkeks',
      brand: 'Bahlsen',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.49, max: 1.79 },
      nutrition: {
        calories_per_100g: 488,
        protein_per_100g: 6.5,
        carbs_per_100g: 70.0,
        fat_per_100g: 20.0,
        sugar_per_100g: 18.0,
        salt_per_100g: 1.2
      },
      allergens: ['Gluten', 'Milch', 'Ei'],
      keywords: ['leibniz', 'butterkeks', 'bahlsen', 'klassiker', 'gold']
    },

    {
      code: 'de_prinzenrolle_de_beukelaer',
      name: 'Prinzenrolle Original',
      brand: 'De Beukelaer',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.79, max: 2.09 },
      nutrition: {
        calories_per_100g: 486,
        protein_per_100g: 6.0,
        carbs_per_100g: 68.0,
        fat_per_100g: 21.0,
        sugar_per_100g: 32.0
      },
      allergens: ['Gluten', 'Milch', 'Soja'],
      keywords: ['prinzenrolle', 'de beukelaer', 'schokolade', 'doppelkeks', 'cremig']
    },

    {
      code: 'de_oreo_kekse',
      name: 'Oreo Original Kekse',
      brand: 'Oreo',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.99, max: 2.39 },
      nutrition: {
        calories_per_100g: 480,
        protein_per_100g: 4.7,
        carbs_per_100g: 71.0,
        fat_per_100g: 20.0,
        sugar_per_100g: 36.0
      },
      allergens: ['Gluten', 'Soja'],
      keywords: ['oreo', 'kekse', 'schwarz weiß', 'cremefüllung', 'twist']
    },

    // MEHR MÜSLI & CEREALIEN
    {
      code: 'de_cornflakes_kelloggs',
      name: 'Kelloggs Corn Flakes',
      brand: 'Kelloggs',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 2.99, max: 3.49 },
      nutrition: {
        calories_per_100g: 357,
        protein_per_100g: 7.0,
        carbs_per_100g: 84.0,
        fat_per_100g: 0.9,
        fiber_per_100g: 3.0,
        sugar_per_100g: 8.0,
        salt_per_100g: 1.3
      },
      keywords: ['cornflakes', 'kelloggs', 'frühstück', 'mais', 'knusprig']
    },

    {
      code: 'de_schokobons_ferrero',
      name: 'Ferrero Schoko-Bons',
      brand: 'Ferrero',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 576,
        protein_per_100g: 8.0,
        carbs_per_100g: 46.0,
        fat_per_100g: 40.0,
        sugar_per_100g: 45.0
      },
      allergens: ['Milch', 'Nüsse', 'Soja'],
      keywords: ['schoko bons', 'ferrero', 'haselnuss', 'weiße schokolade', 'praline']
    },

    // MEHR KONSERVEN & HALTBARES
    {
      code: 'de_tomaten_geschaelt_cirio',
      name: 'Cirio Tomaten geschält',
      brand: 'Cirio',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 0.89, max: 1.19 },
      nutrition: {
        calories_per_100g: 20,
        protein_per_100g: 1.0,
        carbs_per_100g: 3.2,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.4,
        salt_per_100g: 0.3
      },
      keywords: ['tomaten', 'cirio', 'geschält', 'dose', 'italien']
    },

    {
      code: 'de_thunfisch_saupiquet',
      name: 'Saupiquet Thunfisch in Öl',
      brand: 'Saupiquet',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 1.49, max: 1.89 },
      nutrition: {
        calories_per_100g: 189,
        protein_per_100g: 26.0,
        carbs_per_100g: 0,
        fat_per_100g: 9.0,
        salt_per_100g: 1.0
      },
      keywords: ['thunfisch', 'saupiquet', 'dose', 'öl', 'fisch']
    },

    {
      code: 'de_mais_bonduelle',
      name: 'Bonduelle Goldmais',
      brand: 'Bonduelle',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.19, max: 1.49 },
      nutrition: {
        calories_per_100g: 86,
        protein_per_100g: 3.2,
        carbs_per_100g: 15.0,
        fat_per_100g: 1.2,
        fiber_per_100g: 2.7,
        salt_per_100g: 0.6
      },
      keywords: ['mais', 'bonduelle', 'goldmais', 'dose', 'süß']
    },

    // MEHR ÖLEN & ESSIG
    {
      code: 'de_olivenoel_bertolli',
      name: 'Bertolli Olivenöl Extra Vergine',
      brand: 'Bertolli',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi'],
      price_range: { min: 4.99, max: 5.79 },
      nutrition: {
        calories_per_100g: 900,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 100.0
      },
      keywords: ['olivenöl', 'bertolli', 'extra vergine', 'italien', 'kochen']
    },

    {
      code: 'de_sonnenblumenoel_thomy',
      name: 'Thomy Sonnenblumenöl',
      brand: 'Thomy',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.49, max: 2.89 },
      nutrition: {
        calories_per_100g: 900,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 100.0
      },
      keywords: ['sonnenblumenöl', 'thomy', 'neutral', 'braten', 'backen']
    },

    // MEHR GEWÜRZE & WÜRZMITTEL
    {
      code: 'de_pfeffer_schwarz_fuchs',
      name: 'Fuchs Pfeffer schwarz gemahlen',
      brand: 'Fuchs',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.29, max: 1.59 },
      nutrition: {
        calories_per_100g: 251,
        protein_per_100g: 10.4,
        carbs_per_100g: 38.3,
        fat_per_100g: 3.3,
        fiber_per_100g: 25.3
      },
      keywords: ['pfeffer', 'fuchs', 'schwarz', 'gemahlen', 'gewürz']
    },

    {
      code: 'de_paprika_edelsuss_fuchs',
      name: 'Fuchs Paprika edelsüß',
      brand: 'Fuchs',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 1.19, max: 1.49 },
      nutrition: {
        calories_per_100g: 289,
        protein_per_100g: 14.8,
        carbs_per_100g: 35.6,
        fat_per_100g: 13.0,
        fiber_per_100g: 37.4
      },
      keywords: ['paprika', 'fuchs', 'edelsüß', 'gewürz', 'rot']
    },

    // MEHR GEMÜSE (FRISCH)
    {
      code: 'de_tomaten_strauch',
      name: 'Strauchtomaten',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 2.99, max: 3.49 },
      nutrition: {
        calories_per_100g: 18,
        protein_per_100g: 0.9,
        carbs_per_100g: 3.9,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.0,
        sugar_per_100g: 3.9
      },
      keywords: ['tomaten', 'strauch', 'rot', 'frisch', 'gemüse']
    },

    {
      code: 'de_gurken_salatgurke',
      name: 'Salatgurken',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 0.99, max: 1.29 },
      nutrition: {
        calories_per_100g: 12,
        protein_per_100g: 0.7,
        carbs_per_100g: 2.2,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.9,
        sugar_per_100g: 1.7
      },
      keywords: ['gurken', 'salatgurke', 'grün', 'frisch', 'salat']
    },

    {
      code: 'de_karotten_moehren',
      name: 'Möhren/Karotten',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 0.79, max: 1.19 },
      nutrition: {
        calories_per_100g: 41,
        protein_per_100g: 0.9,
        carbs_per_100g: 9.6,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.8,
        sugar_per_100g: 4.7
      },
      keywords: ['karotten', 'möhren', 'orange', 'beta carotin', 'rüben']
    },

    // MEHR OBST (FRISCH)
    {
      code: 'de_orangen_valencia',
      name: 'Orangen Valencia',
      brand: 'Regional',
      category: 'fruits',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.99, max: 2.49 },
      nutrition: {
        calories_per_100g: 47,
        protein_per_100g: 0.9,
        carbs_per_100g: 11.8,
        fat_per_100g: 0.1,
        fiber_per_100g: 2.4,
        sugar_per_100g: 9.4
      },
      keywords: ['orangen', 'valencia', 'vitamin c', 'zitrus', 'süß']
    },

    {
      code: 'de_trauben_blau',
      name: 'Blaue Trauben',
      brand: 'Regional',
      category: 'fruits',
      supermarkets: ['rewe', 'edeka', 'aldi', 'penny'],
      price_range: { min: 2.49, max: 2.99 },
      nutrition: {
        calories_per_100g: 69,
        protein_per_100g: 0.6,
        carbs_per_100g: 17.0,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.6,
        sugar_per_100g: 16.0
      },
      keywords: ['trauben', 'blau', 'süß', 'kernlos', 'antioxidantien']
    },

    {
      code: 'de_birnen_conference',
      name: 'Birnen Conference',
      brand: 'Regional',
      category: 'fruits',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 2.19, max: 2.69 },
      nutrition: {
        calories_per_100g: 57,
        protein_per_100g: 0.4,
        carbs_per_100g: 15.2,
        fat_per_100g: 0.1,
        fiber_per_100g: 3.1,
        sugar_per_100g: 9.8
      },
      keywords: ['birnen', 'conference', 'süß', 'saftig', 'grün']
    },

    // WEITERE BELIEBTE DEUTSCHE SUPERMARKTPRODUKTE

    // FLEISCH & WURST
    {
      code: 'de_bratwurst_gutfleisch',
      name: 'Gut & Günstig Bratwurst 4 Stück',
      brand: 'Gut & Günstig',
      category: 'meat',
      supermarkets: ['edeka'],
      price_range: { min: 1.99, max: 2.49 },
      nutrition: {
        calories_per_100g: 312,
        protein_per_100g: 13.5,
        carbs_per_100g: 1.2,
        fat_per_100g: 28.5,
        salt_per_100g: 2.1
      },
      allergens: ['Senf'],
      keywords: ['bratwurst', 'wurst', 'grillen', 'grillwurst', 'fleisch']
    },
    {
      code: 'de_hackfleisch_rind_schwein',
      name: 'Hackfleisch gemischt Rind/Schwein',
      brand: 'Metzgerei Regional',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 5.99, max: 7.99 },
      nutrition: {
        calories_per_100g: 263,
        protein_per_100g: 17.2,
        carbs_per_100g: 0,
        fat_per_100g: 21.2,
        salt_per_100g: 0.08
      },
      keywords: ['hackfleisch', 'gehacktes', 'hack', 'rind', 'schwein', 'fleisch']
    },
    {
      code: 'de_haehnchenbrust_filet',
      name: 'Hähnchenbrust Filet',
      brand: 'Regional',
      category: 'meat',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 7.99, max: 12.99 },
      nutrition: {
        calories_per_100g: 165,
        protein_per_100g: 31.0,
        carbs_per_100g: 0,
        fat_per_100g: 3.6,
        salt_per_100g: 0.05
      },
      keywords: ['hähnchen', 'hühnchen', 'brust', 'filet', 'geflügel', 'fleisch']
    },

    // KÄSE
    {
      code: 'de_gouda_jung_rewe',
      name: 'REWE Gouda jung 45% Fett i.Tr.',
      brand: 'REWE',
      category: 'dairy',
      supermarkets: ['rewe'],
      price_range: { min: 1.79, max: 2.29 },
      nutrition: {
        calories_per_100g: 356,
        protein_per_100g: 25.0,
        carbs_per_100g: 0.1,
        fat_per_100g: 27.0,
        salt_per_100g: 2.0
      },
      allergens: ['Milch'],
      keywords: ['gouda', 'käse', 'jung', 'schnittkäse', 'mild']
    },
    {
      code: 'de_emmentaler_bio_alnatura',
      name: 'Alnatura Bio Emmentaler',
      brand: 'Alnatura',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka'],
      price_range: { min: 2.79, max: 3.49 },
      nutrition: {
        calories_per_100g: 380,
        protein_per_100g: 28.5,
        carbs_per_100g: 0.1,
        fat_per_100g: 29.0,
        salt_per_100g: 1.1
      },
      allergens: ['Milch'],
      keywords: ['emmentaler', 'käse', 'bio', 'schweizer', 'löcher', 'hartkäse']
    },
    {
      code: 'de_mozzarella_galbani',
      name: 'Galbani Mozzarella 125g',
      brand: 'Galbani',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.29, max: 1.79 },
      nutrition: {
        calories_per_100g: 254,
        protein_per_100g: 18.1,
        carbs_per_100g: 1.0,
        fat_per_100g: 19.5,
        salt_per_100g: 0.5
      },
      allergens: ['Milch'],
      keywords: ['mozzarella', 'käse', 'italien', 'pizza', 'caprese', 'weichkäse']
    },

    // GEMÜSE
    {
      code: 'de_tomaten_rispentomaten',
      name: 'Rispentomaten',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 2.99, max: 4.99 },
      nutrition: {
        calories_per_100g: 18,
        protein_per_100g: 0.9,
        carbs_per_100g: 3.9,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.0,
        sugar_per_100g: 2.6
      },
      keywords: ['tomaten', 'rispentomaten', 'rot', 'gemüse', 'salat', 'frisch']
    },
    {
      code: 'de_gurken_salatgurke',
      name: 'Salatgurke',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 0.79, max: 1.29 },
      nutrition: {
        calories_per_100g: 12,
        protein_per_100g: 0.6,
        carbs_per_100g: 2.3,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.9,
        sugar_per_100g: 1.7
      },
      keywords: ['gurke', 'salatgurke', 'grün', 'gemüse', 'salat', 'frisch']
    },
    {
      code: 'de_paprika_rot',
      name: 'Paprika rot',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.99, max: 3.49 },
      nutrition: {
        calories_per_100g: 37,
        protein_per_100g: 1.0,
        carbs_per_100g: 6.4,
        fat_per_100g: 0.3,
        fiber_per_100g: 3.6,
        sugar_per_100g: 4.2
      },
      keywords: ['paprika', 'rot', 'gemüse', 'vitamin c', 'süß', 'frisch']
    },
    {
      code: 'de_zwiebeln_gelb',
      name: 'Zwiebeln gelb 2kg Netz',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.49, max: 2.29 },
      nutrition: {
        calories_per_100g: 40,
        protein_per_100g: 1.1,
        carbs_per_100g: 9.3,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.7,
        sugar_per_100g: 4.2
      },
      keywords: ['zwiebeln', 'gelb', 'gemüse', 'kochen', 'würzen', 'scharf']
    },
    {
      code: 'de_kartoffeln_festkochend',
      name: 'Kartoffeln festkochend 2,5kg',
      brand: 'Regional',
      category: 'vegetables',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.99, max: 3.49 },
      nutrition: {
        calories_per_100g: 77,
        protein_per_100g: 2.0,
        carbs_per_100g: 14.8,
        fat_per_100g: 0.1,
        fiber_per_100g: 2.1,
        sugar_per_100g: 0.8
      },
      keywords: ['kartoffeln', 'festkochend', 'gemüse', 'kochen', 'beilage', 'stärke']
    },

    // TIEFKÜHLPRODUKTE
    {
      code: 'de_tk_pommes_mccain',
      name: 'McCain Pommes Original 750g',
      brand: 'McCain',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.79, max: 2.49 },
      nutrition: {
        calories_per_100g: 155,
        protein_per_100g: 2.5,
        carbs_per_100g: 24.0,
        fat_per_100g: 5.2,
        fiber_per_100g: 2.8,
        salt_per_100g: 0.5
      },
      keywords: ['pommes', 'tiefkühl', 'kartoffeln', 'fritten', 'backofen', 'mccain']
    },
    {
      code: 'de_tk_fischstaebchen_iglo',
      name: 'iglo Fischstäbchen 15 Stück',
      brand: 'iglo',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 2.99, max: 3.99 },
      nutrition: {
        calories_per_100g: 214,
        protein_per_100g: 13.1,
        carbs_per_100g: 16.8,
        fat_per_100g: 10.6,
        salt_per_100g: 1.0
      },
      allergens: ['Fisch', 'Gluten'],
      keywords: ['fischstäbchen', 'iglo', 'tiefkühl', 'fisch', 'paniert', 'kinder']
    },
    {
      code: 'de_tk_spinat_iglo',
      name: 'iglo Blattspinat 450g',
      brand: 'iglo',
      category: 'frozen',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.69, max: 2.19 },
      nutrition: {
        calories_per_100g: 26,
        protein_per_100g: 2.8,
        carbs_per_100g: 1.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 2.9,
        salt_per_100g: 0.1
      },
      keywords: ['spinat', 'blattspinat', 'iglo', 'tiefkühl', 'gemüse', 'grün']
    },

    // REIS & GETREIDE
    {
      code: 'de_reis_uncle_bens',
      name: 'Uncle Ben\'s Langkorn Reis 1kg',
      brand: 'Uncle Ben\'s',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 2.49, max: 3.49 },
      nutrition: {
        calories_per_100g: 350,
        protein_per_100g: 7.2,
        carbs_per_100g: 78.0,
        fat_per_100g: 0.6,
        fiber_per_100g: 1.4,
        salt_per_100g: 0.01
      },
      keywords: ['reis', 'langkorn', 'uncle bens', 'beilage', 'kochen', 'getreide']
    },
    {
      code: 'de_quinoa_alnatura',
      name: 'Alnatura Bio Quinoa 500g',
      brand: 'Alnatura',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka'],
      price_range: { min: 3.79, max: 4.99 },
      nutrition: {
        calories_per_100g: 368,
        protein_per_100g: 14.1,
        carbs_per_100g: 58.5,
        fat_per_100g: 6.1,
        fiber_per_100g: 7.0,
        salt_per_100g: 0.01
      },
      keywords: ['quinoa', 'bio', 'superfood', 'alnatura', 'glutenfrei', 'protein']
    },

    // SÜSSWAREN
    {
      code: 'de_gummibaerchen_haribo_color_rado',
      name: 'Haribo Color-Rado 200g',
      brand: 'Haribo',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.29, max: 1.79 },
      nutrition: {
        calories_per_100g: 343,
        protein_per_100g: 6.9,
        carbs_per_100g: 77.0,
        fat_per_100g: 0.5,
        sugar_per_100g: 46.0,
        salt_per_100g: 0.07
      },
      keywords: ['haribo', 'gummibärchen', 'color-rado', 'süß', 'fruchtgummi', 'bunt']
    },
    {
      code: 'de_schokolade_lindt_excellence',
      name: 'Lindt Excellence 70% Cacao 100g',
      brand: 'Lindt',
      category: 'snacks',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.79, max: 3.49 },
      nutrition: {
        calories_per_100g: 579,
        protein_per_100g: 9.0,
        carbs_per_100g: 24.0,
        fat_per_100g: 42.0,
        fiber_per_100g: 12.0,
        sugar_per_100g: 19.0,
        salt_per_100g: 0.01
      },
      keywords: ['lindt', 'schokolade', 'excellence', 'dunkel', 'cacao', 'bitter']
    },

    // GETRÄNKE
    {
      code: 'de_apfelsaft_valensina',
      name: 'Valensina Apfelsaft 1L',
      brand: 'Valensina',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.99, max: 2.79 },
      nutrition: {
        calories_per_100g: 46,
        protein_per_100g: 0.1,
        carbs_per_100g: 11.0,
        fat_per_100g: 0.1,
        sugar_per_100g: 10.0,
        salt_per_100g: 0.01
      },
      keywords: ['valensina', 'apfelsaft', 'saft', 'frucht', 'trinken', 'süß']
    },
    {
      code: 'de_orangensaft_hohes_c',
      name: 'Hohes C Orangensaft 1L',
      brand: 'Hohes C',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 1.79, max: 2.49 },
      nutrition: {
        calories_per_100g: 42,
        protein_per_100g: 0.7,
        carbs_per_100g: 8.9,
        fat_per_100g: 0.2,
        sugar_per_100g: 8.1,
        salt_per_100g: 0.01
      },
      keywords: ['hohes c', 'orangensaft', 'saft', 'vitamin c', 'frucht', 'orange']
    },
    {
      code: 'de_kaffee_jacobs_kronung',
      name: 'Jacobs Krönung Kaffee 500g',
      brand: 'Jacobs',
      category: 'beverages',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 4.99, max: 6.99 },
      nutrition: {
        calories_per_100g: 2,
        protein_per_100g: 0.1,
        carbs_per_100g: 0.3,
        fat_per_100g: 0,
        salt_per_100g: 0.01
      },
      keywords: ['jacobs', 'krönung', 'kaffee', 'gemahlen', 'filterkaffee', 'röstung']
    },

    // EIER & MILCHPRODUKTE
    {
      code: 'de_eier_bodenhaltung_10er',
      name: 'Eier Bodenhaltung 10er Packung',
      brand: 'Regional',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl', 'penny'],
      price_range: { min: 1.79, max: 2.49 },
      nutrition: {
        calories_per_100g: 155,
        protein_per_100g: 13.0,
        carbs_per_100g: 0.7,
        fat_per_100g: 11.0,
        salt_per_100g: 0.14
      },
      allergens: ['Ei'],
      keywords: ['eier', 'bodenhaltung', 'frisch', 'kochen', 'backen', 'protein']
    },
    {
      code: 'de_sahne_schlagrahm_weihenstephan',
      name: 'Weihenstephan Schlagsahne 30% 200ml',
      brand: 'Weihenstephan',
      category: 'dairy',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 1.29, max: 1.79 },
      nutrition: {
        calories_per_100g: 309,
        protein_per_100g: 2.4,
        carbs_per_100g: 3.2,
        fat_per_100g: 30.0,
        salt_per_100g: 0.06
      },
      allergens: ['Milch'],
      keywords: ['sahne', 'schlagsahne', 'weihenstephan', 'schlagen', 'kochen', 'backen']
    },

    // BROTAUFSTRICHE
    {
      code: 'de_marmelade_zentis_erdbeere',
      name: 'Zentis Erdbeere Fruchtaufstrich 450g',
      brand: 'Zentis',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'penny'],
      price_range: { min: 2.49, max: 3.29 },
      nutrition: {
        calories_per_100g: 247,
        protein_per_100g: 0.4,
        carbs_per_100g: 60.0,
        fat_per_100g: 0.2,
        sugar_per_100g: 58.0,
        salt_per_100g: 0.01
      },
      keywords: ['zentis', 'marmelade', 'erdbeere', 'fruchtaufstrich', 'süß', 'brot']
    },
    {
      code: 'de_honig_langnese_blueten',
      name: 'Langnese Blütenhonig 500g',
      brand: 'Langnese',
      category: 'pantry',
      supermarkets: ['rewe', 'edeka', 'aldi', 'lidl'],
      price_range: { min: 3.99, max: 5.49 },
      nutrition: {
        calories_per_100g: 304,
        protein_per_100g: 0.4,
        carbs_per_100g: 75.1,
        fat_per_100g: 0,
        sugar_per_100g: 75.1,
        salt_per_100g: 0.01
      },
      keywords: ['langnese', 'honig', 'blütenhonig', 'süß', 'natur', 'brot']
    }
  ]

  static searchProducts(query: string): GermanProductDB[] {
    const queryLower = query.toLowerCase().trim()
    if (!queryLower) return []

    // Suche in Name, Brand und Keywords (Teilwort-Suche, nicht nur includes)
    const matches = this.products.filter(product => {
      return (
        product.name.toLowerCase().includes(queryLower) ||
        product.brand.toLowerCase().includes(queryLower) ||
        product.keywords.some(kw => kw.toLowerCase().includes(queryLower))
      )
    })

    // Sortiere nach Relevanz (exakte Matches im Namen zuerst, dann Teilwort, dann Rest)
    return matches.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const aExact = aName === queryLower
      const bExact = bName === queryLower
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      // Dann nach Position des Teilworts im Namen
      const aIndex = aName.indexOf(queryLower)
      const bIndex = bName.indexOf(queryLower)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return 0
    })
  }

  static getProductsByCategory(category: GermanProductDB['category']): GermanProductDB[] {
    return this.products.filter(product => product.category === category)
  }

  static getProductsBySupermarket(supermarket: 'rewe' | 'edeka' | 'aldi' | 'lidl' | 'penny' | 'netto'): GermanProductDB[] {
    return this.products.filter(product => product.supermarkets.includes(supermarket))
  }

  static getAllProducts(): GermanProductDB[] {
    return [...this.products]
  }

  static getRandomProducts(count: number = 10): GermanProductDB[] {
    const shuffled = [...this.products].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  static findByBarcode(barcode: string): GermanProductDB | null {
    return this.products.find(product => product.code === barcode) || null
  }
}
