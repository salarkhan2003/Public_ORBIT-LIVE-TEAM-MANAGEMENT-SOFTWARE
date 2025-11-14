-- =====================================================
-- OPTIMISTIC LOCKING MIGRATION
-- =====================================================
-- Adds version columns and triggers for concurrency control
-- =====================================================

-- =====================================================
-- 1. Add version columns to tables
-- =====================================================

-- Tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Groups table
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- =====================================================
-- 2. Create function to auto-increment version
-- =====================================================

CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment version if the row actually changed
  IF NEW IS DISTINCT FROM OLD THEN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Create triggers for each table
-- =====================================================

-- Tasks trigger
DROP TRIGGER IF EXISTS tasks_version_trigger ON tasks;
CREATE TRIGGER tasks_version_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- Projects trigger
DROP TRIGGER IF EXISTS projects_version_trigger ON projects;
CREATE TRIGGER projects_version_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- Documents trigger
DROP TRIGGER IF EXISTS documents_version_trigger ON documents;
CREATE TRIGGER documents_version_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- Meetings trigger
DROP TRIGGER IF EXISTS meetings_version_trigger ON meetings;
CREATE TRIGGER meetings_version_trigger
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- Groups trigger
DROP TRIGGER IF EXISTS groups_version_trigger ON groups;
CREATE TRIGGER groups_version_trigger
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- =====================================================
-- 4. Create indexes on version columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_version ON tasks(id, version);
CREATE INDEX IF NOT EXISTS idx_projects_version ON projects(id, version);
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(id, version);
CREATE INDEX IF NOT EXISTS idx_meetings_version ON meetings(id, version);
CREATE INDEX IF NOT EXISTS idx_groups_version ON groups(id, version);

-- =====================================================
-- 5. Add updated_at columns if not exists
-- =====================================================

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- =====================================================
-- 6. Create function for optimistic update with retry
-- =====================================================

CREATE OR REPLACE FUNCTION optimistic_update(
  p_table_name TEXT,
  p_id UUID,
  p_expected_version INTEGER,
  p_updates JSONB
)
RETURNS TABLE(success BOOLEAN, current_version INTEGER, updated_row JSONB) AS $$
DECLARE
  v_sql TEXT;
  v_result RECORD;
  v_row_count INTEGER;
BEGIN
  -- Build dynamic UPDATE query
  v_sql := format(
    'UPDATE %I SET %s WHERE id = $1 AND version = $2 RETURNING *',
    p_table_name,
    (
      SELECT string_agg(format('%I = %L', key, value), ', ')
      FROM jsonb_each_text(p_updates)
    )
  );

  -- Execute update
  EXECUTE v_sql USING p_id, p_expected_version;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;

  IF v_row_count = 0 THEN
    -- Update failed - fetch current version
    EXECUTE format('SELECT version, row_to_json(%I.*) as data FROM %I WHERE id = $1', p_table_name, p_table_name)
    INTO v_result
    USING p_id;

    RETURN QUERY SELECT FALSE, v_result.version, v_result.data::JSONB;
  ELSE
    -- Update succeeded
    EXECUTE format('SELECT version, row_to_json(%I.*) as data FROM %I WHERE id = $1', p_table_name, p_table_name)
    INTO v_result
    USING p_id;

    RETURN QUERY SELECT TRUE, v_result.version, v_result.data::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Create helper function to check version conflicts
-- =====================================================

CREATE OR REPLACE FUNCTION check_version_conflict(
  p_table_name TEXT,
  p_id UUID,
  p_expected_version INTEGER
)
RETURNS TABLE(has_conflict BOOLEAN, current_version INTEGER, current_data JSONB) AS $$
DECLARE
  v_sql TEXT;
  v_result RECORD;
BEGIN
  v_sql := format(
    'SELECT version, row_to_json(%I.*) as data FROM %I WHERE id = $1',
    p_table_name,
    p_table_name
  );

  EXECUTE v_sql INTO v_result USING p_id;

  IF v_result.version != p_expected_version THEN
    RETURN QUERY SELECT TRUE, v_result.version, v_result.data::JSONB;
  ELSE
    RETURN QUERY SELECT FALSE, v_result.version, v_result.data::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if version columns exist
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'version'
  AND table_name IN ('tasks', 'projects', 'documents', 'meetings', 'groups');

-- Check if triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%version%';

-- Test optimistic update (example)
/*
-- Create a test task
INSERT INTO tasks (id, title, group_id, created_by, version)
VALUES (
  gen_random_uuid(),
  'Test Task',
  (SELECT id FROM groups LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  1
);

-- Simulate concurrent update
-- User A reads version 1 and tries to update
-- User B also reads version 1 and tries to update
-- Only one should succeed

-- User A update (should succeed)
UPDATE tasks
SET title = 'Updated by User A'
WHERE id = '<task-id>' AND version = 1;

-- User B update (should fail - version already 2)
UPDATE tasks
SET title = 'Updated by User B'
WHERE id = '<task-id>' AND version = 1;
-- This returns 0 rows updated
*/

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
-- Drop triggers
DROP TRIGGER IF EXISTS tasks_version_trigger ON tasks;
DROP TRIGGER IF EXISTS projects_version_trigger ON projects;
DROP TRIGGER IF EXISTS documents_version_trigger ON documents;
DROP TRIGGER IF EXISTS meetings_version_trigger ON meetings;
DROP TRIGGER IF EXISTS groups_version_trigger ON groups;

-- Drop function
DROP FUNCTION IF EXISTS increment_version();
DROP FUNCTION IF EXISTS optimistic_update(TEXT, UUID, INTEGER, JSONB);
DROP FUNCTION IF EXISTS check_version_conflict(TEXT, UUID, INTEGER);

-- Remove version columns
ALTER TABLE tasks DROP COLUMN IF EXISTS version;
ALTER TABLE projects DROP COLUMN IF EXISTS version;
ALTER TABLE documents DROP COLUMN IF EXISTS version;
ALTER TABLE meetings DROP COLUMN IF EXISTS version;
ALTER TABLE groups DROP COLUMN IF EXISTS version;
*/

