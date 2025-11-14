-- =====================================================
-- FIX MISSING created_at COLUMN IN group_members
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add created_at column if it doesn't exist
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_members' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE group_members
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

    RAISE NOTICE '✅ Added created_at column to group_members';
  ELSE
    RAISE NOTICE 'ℹ️ created_at column already exists';
  END IF;
END $$;

-- 2. Update existing rows to have created_at value
-- =====================================================
UPDATE group_members
SET created_at = NOW()
WHERE created_at IS NULL;

-- 3. Make created_at NOT NULL with default
-- =====================================================
ALTER TABLE group_members
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE group_members
ALTER COLUMN created_at SET NOT NULL;

-- 4. Verify the column exists
-- =====================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'group_members'
  AND column_name = 'created_at';

-- 5. Test query that was failing
-- =====================================================
SELECT
  gm.*,
  u.name as user_name,
  u.email as user_email
FROM group_members gm
JOIN users u ON u.id = gm.user_id
ORDER BY gm.created_at ASC
LIMIT 5;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ created_at column fixed!';
  RAISE NOTICE '✅ All existing rows updated';
  RAISE NOTICE '✅ Column set to NOT NULL with default';
  RAISE NOTICE '✅ Query should now work without errors';
END $$;

