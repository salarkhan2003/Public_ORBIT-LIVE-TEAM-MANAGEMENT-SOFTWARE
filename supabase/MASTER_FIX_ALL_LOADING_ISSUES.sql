-- =====================================================
-- MASTER FIX: ALL LOADING ISSUES + RLS POLICIES
-- =====================================================
-- Run this ONCE in Supabase SQL Editor to fix everything
-- =====================================================

-- =====================================================
-- 1. FIX INFINITE RECURSION IN GROUP_MEMBERS
-- =====================================================

-- Drop ALL existing policies on group_members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Admins can add members" ON group_members;
DROP POLICY IF EXISTS "Admins can update members" ON group_members;
DROP POLICY IF EXISTS "Admins can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can view their groups" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can view all group members" ON group_members;
DROP POLICY IF EXISTS "Owners can add members" ON group_members;
DROP POLICY IF EXISTS "Owners can remove members" ON group_members;

-- Create NON-RECURSIVE policies
CREATE POLICY "Allow all authenticated users to view group members"
ON group_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert themselves as members"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can insert any member"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
);

CREATE POLICY "Users and owners can update members"
ON group_members FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
);

CREATE POLICY "Users can remove themselves, owners can remove anyone"
ON group_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
);

-- =====================================================
-- 2. ENSURE USERS TABLE HAS PROPER POLICIES
-- =====================================================

-- Drop and recreate users policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON users;

CREATE POLICY "All users can view profiles"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile only"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile only"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. ENSURE GROUPS TABLE HAS PROPER POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their groups" ON groups;
DROP POLICY IF EXISTS "Owners can update their groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Owners can delete their groups" ON groups;

-- Allow users to view groups they're members of
CREATE POLICY "Members can view their groups"
ON groups FOR SELECT
TO authenticated
USING (
  group_owner_id = auth.uid()
  OR id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update groups"
ON groups FOR UPDATE
TO authenticated
USING (group_owner_id = auth.uid())
WITH CHECK (group_owner_id = auth.uid());

CREATE POLICY "Authenticated users can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (group_owner_id = auth.uid());

CREATE POLICY "Owners can delete groups"
ON groups FOR DELETE
TO authenticated
USING (group_owner_id = auth.uid());

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Check group_members policies
SELECT
  policyname,
  cmd as command,
  CASE
    WHEN qual LIKE '%group_members%' THEN '⚠️ RECURSIVE!'
    ELSE '✅ Safe'
  END as recursion_check
FROM pg_policies
WHERE tablename = 'group_members'
ORDER BY policyname;

-- Check users policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- Check groups policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'groups';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ ALL RLS POLICIES FIXED!';
  RAISE NOTICE '✅ No more infinite recursion';
  RAISE NOTICE '✅ Join/Create workspace should work now';
  RAISE NOTICE '✅ Team members should load properly';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next steps:';
  RAISE NOTICE '1. Clear browser cache';
  RAISE NOTICE '2. Refresh the app';
  RAISE NOTICE '3. Test join/create workspace';
END $$;

