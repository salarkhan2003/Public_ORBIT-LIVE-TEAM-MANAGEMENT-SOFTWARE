-- =====================================================
-- FIX INFINITE RECURSION & WORKSPACE PERSISTENCE
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Drop ALL existing RLS policies on group_members
-- =====================================================
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
DROP POLICY IF EXISTS "Users can update their membership" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their group" ON group_members;
DROP POLICY IF EXISTS "Members can view their group" ON group_members;
DROP POLICY IF EXISTS "Allow viewing group members" ON group_members;

-- 2. Create SIMPLE, NON-RECURSIVE policies
-- =====================================================

-- Allow users to view ALL group members (no recursion)
CREATE POLICY "allow_view_all_members"
ON group_members FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own membership
CREATE POLICY "allow_insert_own_membership"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own membership
CREATE POLICY "allow_update_own_membership"
ON group_members FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own membership
CREATE POLICY "allow_delete_own_membership"
ON group_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Fix groups table policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON groups;
DROP POLICY IF EXISTS "Users can view groups" ON groups;

-- Allow all authenticated users to view all groups
CREATE POLICY "allow_view_all_groups"
ON groups FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create groups
CREATE POLICY "allow_create_groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = group_owner_id);

-- Allow group owners to update their groups
CREATE POLICY "allow_update_own_groups"
ON groups FOR UPDATE
TO authenticated
USING (auth.uid() = group_owner_id)
WITH CHECK (auth.uid() = group_owner_id);

-- 4. Fix users table policies (allow any signup)
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON users;
DROP POLICY IF EXISTS "Allow public user creation during signup" ON users;

-- Allow users to view their own profile
CREATE POLICY "allow_view_own_profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (CRITICAL for signup)
CREATE POLICY "allow_insert_own_profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "allow_update_own_profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Remove the ONE group per user constraint (causing issues)
-- =====================================================
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_one_group_per_user;

-- Keep only the group_id + user_id unique constraint
-- (This was already there, just ensuring it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'group_members_group_id_user_id_key'
  ) THEN
    ALTER TABLE group_members
    ADD CONSTRAINT group_members_group_id_user_id_key
    UNIQUE (group_id, user_id);
  END IF;
END $$;

-- 6. Drop the problematic trigger
-- =====================================================
DROP TRIGGER IF EXISTS enforce_single_group_membership ON group_members;
DROP FUNCTION IF EXISTS check_single_group_membership();

-- 7. Verify RLS is enabled
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 8. Grant necessary permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON groups TO authenticated;
GRANT ALL ON group_members TO authenticated;

-- 9. Verify all policies
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'groups', 'group_members')
ORDER BY tablename, policyname;

-- 10. Test queries that were failing
-- =====================================================
-- This should now work without recursion errors
SELECT
  gm.*,
  u.name as user_name,
  g.name as group_name
FROM group_members gm
JOIN users u ON u.id = gm.user_id
JOIN groups g ON g.id = gm.group_id
WHERE gm.user_id = auth.uid()
LIMIT 1;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All RLS policies fixed!';
  RAISE NOTICE '✅ Infinite recursion resolved';
  RAISE NOTICE '✅ Simple, non-recursive policies applied';
  RAISE NOTICE '✅ Any email can now signup/login';
  RAISE NOTICE '✅ Workspace persistence enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Next steps:';
  RAISE NOTICE '1. Clear browser localStorage';
  RAISE NOTICE '2. Test signup with any email';
  RAISE NOTICE '3. Test join/create workspace';
  RAISE NOTICE '4. Test logout and re-login';
END $$;

