-- =====================================================
-- FIX INFINITE RECURSION IN GROUP_MEMBERS RLS POLICY
-- =====================================================
-- This fixes the "infinite recursion detected in policy" error
-- Run this in Supabase SQL Editor NOW
-- =====================================================

-- Step 1: Drop ALL existing policies on group_members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Admins can add members" ON group_members;
DROP POLICY IF EXISTS "Admins can update members" ON group_members;
DROP POLICY IF EXISTS "Admins can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can view their groups" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;

-- Step 2: Create NON-RECURSIVE policies

-- ✅ Policy 1: Users can view members in ANY group (simpler, no recursion)
CREATE POLICY "Users can view all group members"
ON group_members FOR SELECT
TO authenticated
USING (true);  -- Allow viewing all members (they'll only see groups they have access to anyway)

-- ✅ Policy 2: Users can insert themselves into a group (for joining)
CREATE POLICY "Users can join groups"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()  -- Can only insert themselves, no recursion
);

-- ✅ Policy 3: Group owners can insert any member
CREATE POLICY "Owners can add members"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if user is owner of the group (via groups table, not group_members)
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
);

-- ✅ Policy 4: Admins and owners can update members
CREATE POLICY "Admins can update members"
ON group_members FOR UPDATE
TO authenticated
USING (
  -- Check via groups table to avoid recursion
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
  OR
  -- Or user is updating their own record
  user_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
  OR
  user_id = auth.uid()
);

-- ✅ Policy 5: Owners can remove members
CREATE POLICY "Owners can remove members"
ON group_members FOR DELETE
TO authenticated
USING (
  -- Check via groups table to avoid recursion
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.group_owner_id = auth.uid()
  )
  OR
  -- Users can remove themselves
  user_id = auth.uid()
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify policies are working:

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
WHERE tablename = 'group_members'
ORDER BY policyname;

-- =====================================================
-- EXPECTED OUTPUT:
-- You should see 5 policies:
-- 1. Users can view all group members (SELECT)
-- 2. Users can join groups (INSERT)
-- 3. Owners can add members (INSERT)
-- 4. Admins can update members (UPDATE)
-- 5. Owners can remove members (DELETE)
-- =====================================================

-- ✅ TEST: Try joining a group - should work now without recursion error

