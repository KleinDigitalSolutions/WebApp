-- =====================================================
-- TrackFood Barcode Scanner Migration
-- Execute these SQL statements in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Erweitere products Tabelle für Barcode-Scanner
-- =====================================================

-- Erweitere products Tabelle um fehlende Spalten für Barcode-Support
DO $$ 
BEGIN
    -- Füge source Spalte hinzu (falls nicht vorhanden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'source') THEN
        ALTER TABLE public.products ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;

    -- Füge sodium_mg Spalte hinzu (falls nicht vorhanden)  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'sodium_mg') THEN
        ALTER TABLE public.products ADD COLUMN sodium_mg DECIMAL(8,2) DEFAULT 0;
    END IF;

    -- Füge stores Spalte hinzu (falls nicht vorhanden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'stores') THEN
        ALTER TABLE public.products ADD COLUMN stores TEXT[] DEFAULT '{}';
    END IF;

    -- Füge country Spalte hinzu (falls nicht vorhanden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'country') THEN
        ALTER TABLE public.products ADD COLUMN country TEXT DEFAULT 'germany';
    END IF;
END $$;

-- Kommentare für neue Spalten
COMMENT ON COLUMN public.products.source IS 'Source of product data: manual, openfoodfacts, scraping, community';
COMMENT ON COLUMN public.products.sodium_mg IS 'Sodium content in mg per 100g';
COMMENT ON COLUMN public.products.stores IS 'List of stores where product is available';
COMMENT ON COLUMN public.products.country IS 'Country where product is primarily sold';

-- Index für Barcode-Suche optimieren
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('german', name));
CREATE INDEX IF NOT EXISTS idx_products_brand_search ON public.products USING gin(to_tsvector('german', brand));

-- =====================================================
-- PART 2: Sample Deutsche Barcode-Daten einfügen
-- =====================================================

-- Füge deutsche Testprodukte hinzu (nur falls noch nicht vorhanden)
INSERT INTO public.products (
    code, name, brand, category, 
    calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
    fiber_per_100g, sugar_per_100g, salt_per_100g, sodium_mg,
    supermarkets, stores, allergens, 
    is_verified, verification_status, source, country,
    created_by
) VALUES 
-- Coca Cola 0,33L
('4000177050019', 'Coca-Cola Classic 0,33L Dose', 'Coca-Cola', 'beverages', 
 42.0, 0.0, 10.6, 0.0, 0.0, 10.6, 0.01, 4.0,
 ARRAY['rewe', 'edeka', 'kaufland', 'netto'], 
 ARRAY['Rewe', 'Edeka', 'Kaufland', 'Netto'],
 ARRAY[]::TEXT[],
 true, 'approved', 'manual', 'germany', null),

-- Haribo Goldbären
('4001686301005', 'Haribo Goldbären 200g', 'Haribo', 'snacks',
 343.0, 6.9, 77.0, 0.5, 0.0, 46.0, 0.07, 28.0,
 ARRAY['rewe', 'edeka', 'dm', 'rossmann'],
 ARRAY['Rewe', 'Edeka', 'dm', 'Rossmann'],
 ARRAY['Gelatine'],
 true, 'approved', 'manual', 'germany', null),

-- Milka Schokolade
('7622210002211', 'Milka Alpenmilch Schokolade 100g', 'Milka', 'snacks',
 534.0, 7.0, 56.0, 30.0, 2.5, 55.0, 0.18, 72.0,
 ARRAY['rewe', 'edeka', 'kaufland'],
 ARRAY['Rewe', 'Edeka', 'Kaufland'],
 ARRAY['Milch', 'Soja', 'Nüsse'],
 true, 'approved', 'manual', 'germany', null),

-- Müller Milch Vanille
('40123456789012', 'Müller Milch Vanille 500ml', 'Müller', 'dairy',
 76.0, 3.1, 9.5, 3.8, 0.0, 9.2, 0.12, 48.0,
 ARRAY['rewe', 'edeka', 'kaufland'],
 ARRAY['Rewe', 'Edeka', 'Kaufland'],
 ARRAY['Milch'],
 true, 'approved', 'manual', 'germany', null),

-- Knorr Nudeln
('8712100825903', 'Knorr Spaghetti Napoli', 'Knorr', 'pantry',
 350.0, 12.0, 70.0, 2.5, 4.0, 6.0, 2.8, 1120.0,
 ARRAY['rewe', 'edeka', 'kaufland', 'netto'],
 ARRAY['Rewe', 'Edeka', 'Kaufland', 'Netto'],
 ARRAY['Gluten', 'Ei'],
 true, 'approved', 'manual', 'germany', null)

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PART 3: Update existing diary_entries für erweiterte Nährstoffe
-- =====================================================

-- Stelle sicher, dass diary_entries alle benötigten Spalten hat
DO $$ 
BEGIN
    -- Füge sugar_g Spalte hinzu (falls nicht vorhanden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'diary_entries' AND column_name = 'sugar_g') THEN
        ALTER TABLE public.diary_entries ADD COLUMN sugar_g DECIMAL(8,2) DEFAULT 0;
    END IF;

    -- Füge fiber_g Spalte hinzu (falls nicht vorhanden)  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'diary_entries' AND column_name = 'fiber_g') THEN
        ALTER TABLE public.diary_entries ADD COLUMN fiber_g DECIMAL(8,2) DEFAULT 0;
    END IF;

    -- Füge sodium_mg Spalte hinzu (falls nicht vorhanden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'diary_entries' AND column_name = 'sodium_mg') THEN
        ALTER TABLE public.diary_entries ADD COLUMN sodium_mg DECIMAL(8,2) DEFAULT 0;
    END IF;

    -- Füge product_code Spalte hinzu für Barcode-Referenz (falls nicht vorhanden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'diary_entries' AND column_name = 'product_code') THEN
        ALTER TABLE public.diary_entries ADD COLUMN product_code TEXT;
    END IF;
END $$;

-- Kommentare für diary_entries Spalten
COMMENT ON COLUMN public.diary_entries.sugar_g IS 'Sugar content in grams for this portion';
COMMENT ON COLUMN public.diary_entries.fiber_g IS 'Fiber content in grams for this portion';
COMMENT ON COLUMN public.diary_entries.sodium_mg IS 'Sodium content in mg for this portion';
COMMENT ON COLUMN public.diary_entries.product_code IS 'Barcode/EAN of the product (for tracking)';

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_product_code ON public.diary_entries(product_code);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date_user ON public.diary_entries(entry_date, user_id);

-- =====================================================
-- PART 4: Erstelle View für Barcode-Statistiken
-- =====================================================

-- View für häufig gescannte Produkte
CREATE OR REPLACE VIEW public.popular_scanned_products AS
SELECT 
    p.code,
    p.name,
    p.brand,
    p.category,
    COUNT(d.id) as scan_count,
    COUNT(DISTINCT d.user_id) as unique_users,
    MAX(d.created_at) as last_scanned
FROM public.products p
LEFT JOIN public.diary_entries d ON p.code = d.product_code
WHERE p.code IS NOT NULL
GROUP BY p.id, p.code, p.name, p.brand, p.category
ORDER BY scan_count DESC;

-- =====================================================
-- PART 5: Funktionen für Barcode-Lookup
-- =====================================================

-- Funktion für optimierte Barcode-Suche
CREATE OR REPLACE FUNCTION find_product_by_barcode(search_code TEXT)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    brand TEXT,
    category TEXT,
    calories_per_100g DECIMAL,
    protein_per_100g DECIMAL,
    carbs_per_100g DECIMAL,
    fat_per_100g DECIMAL,
    fiber_per_100g DECIMAL,
    sugar_per_100g DECIMAL,
    salt_per_100g DECIMAL,
    sodium_mg DECIMAL,
    image_url TEXT,
    stores TEXT[],
    allergens TEXT[],
    source TEXT,
    is_verified BOOLEAN
) 
LANGUAGE sql
STABLE
AS $$
    SELECT 
        p.id, p.code, p.name, p.brand, p.category,
        p.calories_per_100g, p.protein_per_100g, p.carbs_per_100g, p.fat_per_100g,
        p.fiber_per_100g, p.sugar_per_100g, p.salt_per_100g, p.sodium_mg,
        p.image_url, p.stores, p.allergens, p.source, p.is_verified
    FROM public.products p
    WHERE p.code = search_code
    AND p.verification_status = 'approved'
    LIMIT 1;
$$;

-- =====================================================
-- Migration erfolgreich abgeschlossen! 
-- =====================================================

-- Zeige Status der Migration
SELECT 
    'Barcode Scanner Migration' as status,
    'Erfolgreich abgeschlossen' as result,
    NOW() as completed_at;

-- Zeige Anzahl verfügbarer Produkte
SELECT 
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE source = 'manual') as manual_products,
    COUNT(*) FILTER (WHERE source = 'openfoodfacts') as openfoodfacts_products,
    COUNT(*) FILTER (WHERE is_verified = true) as verified_products
FROM public.products;
