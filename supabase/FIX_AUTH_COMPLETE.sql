-- ================================================================
-- 🔥 COMPLETE AUTHENTICATION FIX
-- Date: November 15, 2025
-- Purpose: Fix Google OAuth redirect and email confirmation issues
-- ================================================================

-- ================================================================
-- STEP 1: Enable Email Confirmations (if disabled)
-- ================================================================
-- NOTE: This must be done in Supabase Dashboard > Authentication > Settings
-- 1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/settings
-- 2. Under "Email Auth", ENABLE "Confirm email"
-- 3. Under "Email Templates", verify "Confirm signup" template is active
-- 4. Under "URL Configuration", set Site URL to your production URL

-- ================================================================
-- STEP 2: Fix RLS Policies for User Signup
-- ================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user signup" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Create a comprehensive policy for user signup
CREATE POLICY "Allow users to create their own profile during signup"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure users can read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ================================================================
-- STEP 3: Create trigger to auto-create user profile
-- ================================================================

-- Drop existing trigger and function if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Extract name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );

  -- Insert new user profile
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
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- STEP 4: Fix users table structure
-- ================================================================

-- Ensure all required columns exist with proper defaults
ALTER TABLE public.users
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN name SET DEFAULT 'User',
  ALTER COLUMN role SET DEFAULT 'developer',
  ALTER COLUMN title SET DEFAULT 'Team Member',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Make sure created_at is properly set for existing users
UPDATE public.users
SET created_at = NOW()
WHERE created_at IS NULL;

-- ================================================================
-- STEP 5: Grant necessary permissions
-- ================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- STEP 6: Verify setup
-- ================================================================

-- Check if users table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    RAISE EXCEPTION 'Users table does not exist!';
  END IF;

  RAISE NOTICE '✅ Users table exists';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '✅ Trigger created for auto-profile creation';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Settings';
  RAISE NOTICE '2. Set Site URL to your production domain (e.g., https://your-app.vercel.app)';
  RAISE NOTICE '3. Under "Redirect URLs", add: https://your-app.vercel.app/auth/callback';
  RAISE NOTICE '4. Under "Email Auth", enable "Confirm email" if you want email confirmations';
  RAISE NOTICE '5. Under "Auth Providers", configure Google OAuth:';
  RAISE NOTICE '   - Enable Google provider';
  RAISE NOTICE '   - Add your Google Client ID and Secret';
  RAISE NOTICE '   - Add authorized redirect URI: https://iclnquvhushnvjzzcjrs.supabase.co/auth/v1/callback';
END $$;

