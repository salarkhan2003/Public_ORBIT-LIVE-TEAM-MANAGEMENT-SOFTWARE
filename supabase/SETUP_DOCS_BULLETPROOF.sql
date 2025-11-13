-- BULLETPROOF SETUP for project and task documents
-- This script will work regardless of current state
-- Run this in Supabase SQL Editor

-- Step 1: Drop everything cleanly
DROP TABLE IF EXISTS project_documents CASCADE;
DROP TABLE IF EXISTS task_documents CASCADE;

-- Step 2: Create project_documents table
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create task_documents table
CREATE TABLE task_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes (after tables are confirmed to exist)
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_uploaded_by ON project_documents(uploaded_by);
CREATE INDEX idx_task_documents_task_id ON task_documents(task_id);
CREATE INDEX idx_task_documents_uploaded_by ON task_documents(uploaded_by);

-- Step 5: Enable RLS
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_documents ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple, permissive policies
CREATE POLICY "project_documents_select_policy"
  ON project_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "project_documents_insert_policy"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "project_documents_update_policy"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "project_documents_delete_policy"
  ON project_documents FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "task_documents_select_policy"
  ON task_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "task_documents_insert_policy"
  ON task_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "task_documents_update_policy"
  ON task_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "task_documents_delete_policy"
  ON task_documents FOR DELETE
  TO authenticated
  USING (true);

-- Step 7: Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create triggers
CREATE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_documents_updated_at
  BEFORE UPDATE ON task_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Verify everything worked
DO $$
DECLARE
  project_doc_count INTEGER;
  task_doc_count INTEGER;
  project_policy_count INTEGER;
  task_policy_count INTEGER;
BEGIN
  -- Count columns
  SELECT COUNT(*) INTO project_doc_count
  FROM information_schema.columns
  WHERE table_name = 'project_documents';

  SELECT COUNT(*) INTO task_doc_count
  FROM information_schema.columns
  WHERE table_name = 'task_documents';

  -- Count policies
  SELECT COUNT(*) INTO project_policy_count
  FROM pg_policies
  WHERE tablename = 'project_documents';

  SELECT COUNT(*) INTO task_policy_count
  FROM pg_policies
  WHERE tablename = 'task_documents';

  -- Report results
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'project_documents: % columns, % policies', project_doc_count, project_policy_count;
  RAISE NOTICE 'task_documents: % columns, % policies', task_doc_count, task_policy_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 Ready to upload documents!';
  RAISE NOTICE '========================================';
END $$;

