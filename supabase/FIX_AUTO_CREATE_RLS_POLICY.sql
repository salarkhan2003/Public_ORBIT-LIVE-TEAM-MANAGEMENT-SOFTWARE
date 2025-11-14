-- ================================================
-- FIX RLS POLICY FOR AUTO-CREATE PROFILES
-- ================================================
-- This script fixes the RLS policy to allow automatic
-- profile creation for team members without profiles
-- ================================================

-- ================================================
-- STEP 1: Drop ALL existing policies on users table
-- ================================================
DROP POLICY IF EXISTS "Users can only update own profile" ON users;
DROP POLICY IF EXISTS "Users can only insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON users;
DROP POLICY IF EXISTS "Allow users to read all profiles" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- ================================================
-- STEP 2: Create INSERT policy (allow profile creation)
-- ================================================
CREATE POLICY "Allow authenticated users to insert profiles"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to insert

-- ================================================
-- STEP 3: Create SELECT policy (view team members)
-- ================================================
CREATE POLICY "Allow users to read all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);  -- Allow reading all user profiles

-- ================================================
-- STEP 4: Create UPDATE policy (only own profile)
-- ================================================
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

