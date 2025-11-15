-- ================================================================
-- 🔥 CAPTCHA & REDIRECT FIX
-- Date: November 15, 2025
-- Purpose: Disable CAPTCHA and fix authentication flow
-- ================================================================

-- NOTE: CAPTCHA must be disabled in Supabase Dashboard
-- This script cannot disable CAPTCHA - you must do it manually:
-- 1. Go to: https://supabase.com/dashboard/project/iclnquvhushnvjzzcjrs/auth/settings
-- 2. Scroll to "Security and Protection"
-- 3. Find "CAPTCHA protection"
-- 4. Toggle OFF or set to "Disabled"
-- 5. Click Save

-- ================================================================
-- STEP 1: Ensure auth.users trigger is working
-- ================================================================

-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Creating user profile for: %', NEW.id;

  -- Extract name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );

  -- Insert new user profile with conflict handling
  INSERT INTO public.users (
    id,
    email,
    name,
    avatar,
    role,
    title,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    'developer',
    'Team Member',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    updated_at = NOW();

  RAISE NOTICE 'User profile created successfully for: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- STEP 2: Ensure RLS policies allow user creation
-- ================================================================

-- Drop ALL existing policies on users table (including old names)
DROP POLICY IF EXISTS "Allow users to create their own profile during signup" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to select their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can select own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to select their own profile
CREATE POLICY "Allow users to select their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "Allow users to delete their own profile"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ================================================================
-- STEP 3: Grant necessary permissions
-- ================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- STEP 4: Verify setup
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger recreated successfully';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: MANUAL STEPS REQUIRED';
  RAISE NOTICE '';
  RAISE NOTICE '1. DISABLE CAPTCHA (CRITICAL):';
  RAISE NOTICE '   - Go to: Authentication > Settings > Security';
  RAISE NOTICE '   - Find "CAPTCHA protection"';
  RAISE NOTICE '   - Toggle OFF or set to Disabled';
  RAISE NOTICE '   - Click Save';
  RAISE NOTICE '';
  RAISE NOTICE '2. Configure Site URL:';
  RAISE NOTICE '   - Go to: Authentication > URL Configuration';
  RAISE NOTICE '   - Site URL: http://localhost:5173 (for dev)';
  RAISE NOTICE '';
  RAISE NOTICE '3. Add Redirect URLs:';
  RAISE NOTICE '   - Go to: Authentication > URL Configuration';
  RAISE NOTICE '   - Add: http://localhost:5173/auth/callback';
  RAISE NOTICE '   - Add: https://your-production-domain.com/auth/callback';
  RAISE NOTICE '';
  RAISE NOTICE '4. Disable Email Confirmations (Optional for testing):';
  RAISE NOTICE '   - Go to: Authentication > Settings';
  RAISE NOTICE '   - Toggle OFF "Enable email confirmations"';
  RAISE NOTICE '   - This allows immediate signup without email verification';
END $$;

