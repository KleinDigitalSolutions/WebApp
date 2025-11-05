# Onboarding Fix - Complete Guide

## Issues Fixed

Your app had three main issues that have been resolved:

### 1. Database Schema Missing Columns (CRITICAL)
**Error:** `Could not find the 'target_weight_kg' column of 'profiles' in the schema cache`

**Status:** SQL migration file created

### 2. Incorrect Image Paths
**Error:** `GET http://localhost:3000/public/icons/height-ruler.png 404 (Not Found)`

**Status:** Fixed - Image paths corrected in components

### 3. Row Level Security Policies
**Status:** Updated and included in migration

---

## What You Need To Do

### Step 1: Run the Database Migration (REQUIRED)

1. Open your Supabase dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to SQL Editor (in the left sidebar)
4. Open the file: `fix-onboarding-database.sql`
5. Copy the entire contents of that file
6. Paste it into the SQL Editor in Supabase
7. Click "Run" to execute the migration

**This step is CRITICAL** - your onboarding will not work until you run this migration.

### Step 2: Add Icon Images (OPTIONAL)

The app will work without these images (it has fallback SVG icons), but for better UX:

1. Create or download two PNG icons:
   - `height-ruler.png` (icon representing height/measuring)
   - `weight-scale.png` (icon representing weight/scale)

2. Place them in: `public/icons/`

The directory has already been created for you.

**Recommended icon sizes:** 96x96px or 128x128px PNG files

**Where to get icons:**
- https://www.flaticon.com
- https://iconmonstr.com
- https://heroicons.com
- Or create your own

---

## Files Modified

### Created:
1. `/fix-onboarding-database.sql` - Complete database migration
2. `/public/icons/` - Directory for icon files

### Updated:
1. `/src/components/onboarding/OnboardingHeight.tsx`
   - Fixed image path from `/public/icons/` to `/icons/`

2. `/src/components/onboarding/OnboardingWeight.tsx`
   - Fixed image path from `/public/icons/` to `/icons/`

---

## Database Changes

The migration adds these columns to your `profiles` table:

| Column | Type | Purpose |
|--------|------|---------|
| `first_name` | TEXT | User's first name |
| `last_name` | TEXT | User's last name |
| `phone` | TEXT | User's phone number |
| `email` | TEXT | User's email |
| `target_weight_kg` | DECIMAL(5,2) | User's target weight (fixes the 400 error) |
| `birth_date` | DATE | User's date of birth |
| `fitness_goals` | TEXT[] | Array of fitness goals |
| `onboarding_completed` | BOOLEAN | Onboarding completion status |
| `onboarding_step` | INTEGER | Current onboarding step |
| `diet_type` | TEXT | Dietary preference |

### RLS Policies Updated:

1. **INSERT:** Any authenticated user can create their profile
2. **SELECT:** Users can only view their own profile
3. **UPDATE:** Users can only update their own profile
4. **DELETE:** Users can only delete their own profile

---

## Verification

After running the migration, verify it worked:

1. In Supabase SQL Editor, run:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

2. You should see all the columns listed above, including `target_weight_kg`

3. Test the onboarding flow:
   - Clear your browser's localStorage: `localStorage.clear()` in console
   - Visit: http://localhost:3000/onboarding
   - Complete all steps
   - Should successfully save to database without errors

---

## Troubleshooting

### If you still get the column error:

1. Check that the migration ran successfully (no red errors in Supabase)
2. Try refreshing your Supabase schema cache:
   - In Supabase Dashboard → Database → Tables
   - Click on `profiles` table to refresh

### If images still don't load:

1. Clear your browser cache
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check that images are in `public/icons/` (not `public/public/icons/`)

### If RLS errors occur:

The migration includes updated policies. If you still have issues:
- Ensure you're logged in as an authenticated user
- Check that `auth.uid()` matches your user ID in the profiles table

---

## Console Log Analysis

Your console showed:
- ✅ Authentication working correctly
- ✅ User logged in: `9e80879d-5a03-4ccd-8563-cb19a6890fdd`
- ✅ Profile data retrieved successfully
- ✅ Onboarding flow reaching step 1
- ❌ **Final save failing** due to missing `target_weight_kg` column
- ❌ Image 404 errors (now fixed)

After this fix, all steps should work end-to-end.

---

## Need Help?

If you encounter any issues after following these steps, check:

1. Supabase project URL is correct in your `.env.local`
2. Supabase anon key is correct in your `.env.local`
3. You're using the correct Supabase project (check project ID)
4. The migration ran without errors

---

**Last Updated:** November 5, 2025
**App:** A.N.D LETICS Fitness Studio
