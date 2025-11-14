-- =====================================================
-- FIX DUPLICATE GROUP MEMBERSHIP ERRORS
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Remove duplicate group memberships (keep the oldest one for each user)
-- =====================================================
WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at ASC
    ) as rn
  FROM group_members
)
DELETE FROM group_members
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify no user has multiple memberships
SELECT
  user_id,
  COUNT(*) as membership_count
FROM group_members
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- 2. Ensure unique constraint exists
-- =====================================================
-- Drop existing constraint if it exists
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_group_id_user_id_key;

-- Add proper unique constraint
ALTER TABLE group_members
ADD CONSTRAINT group_members_group_id_user_id_key
UNIQUE (group_id, user_id);

-- 3. Add constraint: user can only be in ONE group at a time
-- =====================================================
-- Drop existing constraint if it exists
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_one_group_per_user;

-- Add unique constraint on user_id alone (one group per user)
ALTER TABLE group_members
ADD CONSTRAINT group_members_one_group_per_user
UNIQUE (user_id);

-- 4. Create index for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_group_members_user_id
ON group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id
ON group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_user_group
ON group_members(user_id, group_id);

-- 5. Add created_at column if it doesn't exist
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_members' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE group_members
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Update existing rows without created_at
UPDATE group_members
SET created_at = NOW()
WHERE created_at IS NULL;

-- 6. Create function to prevent duplicate group memberships
-- =====================================================
CREATE OR REPLACE FUNCTION check_single_group_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is already in another group
  IF EXISTS (
    SELECT 1 FROM group_members
    WHERE user_id = NEW.user_id
    AND group_id != NEW.group_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of another workspace. Please leave your current workspace first.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger
DROP TRIGGER IF EXISTS enforce_single_group_membership ON group_members;

-- Create trigger
CREATE TRIGGER enforce_single_group_membership
  BEFORE INSERT OR UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION check_single_group_membership();

-- 7. Update RLS policies for group_members
-- =====================================================
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

-- Allow users to view members of groups they're in
CREATE POLICY "Users can view group members"
ON group_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Allow users to join groups (with upsert support)
CREATE POLICY "Users can join groups"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow upsert for existing members
CREATE POLICY "Users can update their membership"
ON group_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to leave groups
CREATE POLICY "Users can leave groups"
ON group_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 8. Create helper function to safely join group
-- =====================================================
CREATE OR REPLACE FUNCTION join_group_safe(
  p_group_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member'
)
RETURNS JSONB AS $$
DECLARE
  v_existing_membership RECORD;
  v_result JSONB;
BEGIN
  -- Check if user is already in ANY group
  SELECT * INTO v_existing_membership
  FROM group_members
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If user is already in a group
  IF FOUND THEN
    -- If it's the same group, just return success
    IF v_existing_membership.group_id = p_group_id THEN
      SELECT jsonb_build_object(
        'success', true,
        'message', 'Already a member of this group',
        'membership', row_to_json(v_existing_membership)
      ) INTO v_result;
      RETURN v_result;
    ELSE
      -- User is in a different group
      RAISE EXCEPTION 'User is already a member of another workspace';
    END IF;
  END IF;

  -- Insert new membership
  INSERT INTO group_members (group_id, user_id, role, created_at)
  VALUES (p_group_id, p_user_id, p_role, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET group_id = EXCLUDED.group_id,
      role = EXCLUDED.role
  RETURNING * INTO v_existing_membership;

  SELECT jsonb_build_object(
    'success', true,
    'message', 'Successfully joined group',
    'membership', row_to_json(v_existing_membership)
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION join_group_safe TO authenticated;

-- 9. Verify everything is working
-- =====================================================
-- Check for any remaining duplicates
SELECT
  'Duplicate Check' as test,
  COUNT(*) as duplicate_count
FROM (
  SELECT user_id, COUNT(*) as cnt
  FROM group_members
  GROUP BY user_id
  HAVING COUNT(*) > 1
) sub;

-- Check constraints
SELECT
  'Constraints' as test,
  conname as constraint_name
FROM pg_constraint
WHERE conrelid = 'group_members'::regclass
  AND contype = 'u';

-- Check indexes
SELECT
  'Indexes' as test,
  indexname as index_name
FROM pg_indexes
WHERE tablename = 'group_members';

-- 10. Clean up any orphaned memberships
-- =====================================================
-- Remove memberships where group doesn't exist
DELETE FROM group_members
WHERE group_id NOT IN (SELECT id FROM groups);

-- Remove memberships where user doesn't exist
DELETE FROM group_members
WHERE user_id NOT IN (SELECT id FROM users);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All duplicate group membership issues fixed!';
  RAISE NOTICE '✅ Unique constraints added';
  RAISE NOTICE '✅ One group per user enforced';
  RAISE NOTICE '✅ Helper function created';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Next steps:';
  RAISE NOTICE '1. Test joining a workspace';
  RAISE NOTICE '2. Test creating a workspace';
  RAISE NOTICE '3. Verify no duplicate errors';
END $$;

