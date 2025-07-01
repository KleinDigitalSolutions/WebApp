-- NutriWise Database Schema Update
-- Nur die neuen Tabellen für User-Generated Products
-- Execute these SQL statements in your Supabase SQL Editor

-- Create products table for user-generated content (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT CHECK (category IN ('dairy', 'meat', 'bakery', 'frozen', 'beverages', 'fruits', 'vegetables', 'snacks', 'pantry')) NOT NULL,
  supermarkets TEXT[] DEFAULT '{}',
  price_min DECIMAL(8,2),
  price_max DECIMAL(8,2),
  image_url TEXT,
  
  -- Nutrition information per 100g
  calories_per_100g DECIMAL(8,2) NOT NULL,
  protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_per_100g DECIMAL(8,2) DEFAULT 0,
  sugar_per_100g DECIMAL(8,2) DEFAULT 0,
  salt_per_100g DECIMAL(8,2) DEFAULT 0,
  
  allergens TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- User who added this product
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Verification and moderation
  is_verified BOOLEAN DEFAULT FALSE,
  is_community_product BOOLEAN DEFAULT TRUE,
  verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderator_notes TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_reviews table for community feedback (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  is_nutrition_accurate BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews from same user
  UNIQUE(product_id, user_id)
);

-- Create product_reports table for reporting incorrect data (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.product_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT CHECK (report_type IN ('incorrect_nutrition', 'wrong_name', 'wrong_brand', 'spam', 'other')) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies für neue Tabellen

-- Products RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view approved products and own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

-- Create new policies
CREATE POLICY "Users can view approved products and own products"
  ON public.products FOR SELECT
  USING (verification_status = 'approved' OR auth.uid() = created_by);

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = created_by);

-- Product Reviews RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all product reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own product reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product reviews"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Product Reports RLS
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product reports"
  ON public.product_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product reports"
  ON public.product_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product reports"
  ON public.product_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product reports"
  ON public.product_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_verification_status ON public.products(verification_status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('german', name || ' ' || brand));
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_product ON public.product_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_user ON public.product_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_status ON public.product_reports(status);

-- Add updated_at trigger for products (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_products'
  ) THEN
    CREATE TRIGGER set_updated_at_products
      BEFORE UPDATE ON public.products
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Insert some sample test products (optional)
INSERT INTO public.products (
  code, name, brand, category, calories_per_100g, protein_per_100g, 
  carbs_per_100g, fat_per_100g, verification_status, is_verified,
  supermarkets, keywords
) VALUES 
(
  'test_001', 'Test Vollmilch', 'Test Marke', 'dairy', 
  64, 3.4, 4.8, 3.5, 'approved', true,
  ARRAY['rewe', 'edeka'], ARRAY['milch', 'test']
),
(
  'test_002', 'Test Weißbrot', 'Test Bäcker', 'bakery',
  265, 8.5, 49.0, 3.2, 'approved', true,
  ARRAY['lidl', 'aldi'], ARRAY['brot', 'weizen', 'test']
)
ON CONFLICT (code) DO NOTHING;

-- Enable realtime for products table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reports;
