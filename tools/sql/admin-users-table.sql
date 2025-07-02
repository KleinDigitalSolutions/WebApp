-- Create admin_users table for product moderation
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'super_admin')),
    permissions JSONB DEFAULT '{"products": true, "users": false, "analytics": false}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users
CREATE POLICY "Admin users can view themselves" ON public.admin_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        )
    );

-- Create update trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert a default admin user (you can update this with your actual user ID)
-- This is a placeholder - you'll need to update with real user_id after registration
INSERT INTO public.admin_users (user_id, email, role, permissions) 
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
    'admin@trackfood.app',
    'super_admin',
    '{"products": true, "users": true, "analytics": true, "moderation": true}'
) ON CONFLICT (email) DO NOTHING;
