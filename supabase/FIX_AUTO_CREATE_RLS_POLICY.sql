-- ================================================
-- FIX RLS POLICY FOR AUTO-CREATE PROFILES
-- ================================================
-- This script fixes the RLS policy to allow automatic
-- profile creation for team members without profiles
-- ================================================

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can only update own profile" ON users;
DROP POLICY IF EXISTS "Users can only insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- ================================================
-- STEP 1: Allow users to INSERT their own profile
-- ================================================
CREATE POLICY "Allow authenticated users to insert profiles"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to insert

-- ================================================
-- STEP 2: Allow users to SELECT all profiles
-- (Needed to view team members)
-- ================================================
DROP POLICY IF EXISTS "Allow users to read all profiles" ON users;
CREATE POLICY "Allow users to read all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);  -- Allow reading all user profiles

-- ================================================
-- STEP 3: Allow users to UPDATE their own profile
-- ================================================
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
CREATE POLICY "Allow users to update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)  -- Can only update their own profile
WITH CHECK (auth.uid() = id);

-- ================================================
-- VERIFICATION: Check policies
-- ================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ================================================
-- Expected Output:
-- ================================================
-- You should see 3 policies:
-- 1. "Allow authenticated users to insert profiles" - INSERT - WITH CHECK (true)
-- 2. "Allow users to read all profiles" - SELECT - USING (true)
-- 3. "Allow users to update own profile" - UPDATE - USING/WITH CHECK (auth.uid() = id)
-- ================================================

