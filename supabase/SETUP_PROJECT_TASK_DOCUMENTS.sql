-- Create tables for project and task documents
-- Run this in Supabase SQL Editor

-- Project Documents Table
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Documents Table
CREATE TABLE IF NOT EXISTS task_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_by ON project_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_task_documents_task_id ON task_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_task_documents_uploaded_by ON task_documents(uploaded_by);

-- Enable Row Level Security
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_documents
DROP POLICY IF EXISTS "Users can view project documents" ON project_documents;
CREATE POLICY "Users can view project documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert project documents" ON project_documents;
CREATE POLICY "Users can insert project documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete project documents" ON project_documents;
CREATE POLICY "Users can delete project documents"
  ON project_documents FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update project documents" ON project_documents;
CREATE POLICY "Users can update project documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for task_documents
DROP POLICY IF EXISTS "Users can view task documents" ON task_documents;
CREATE POLICY "Users can view task documents"
  ON task_documents FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert task documents" ON task_documents;
CREATE POLICY "Users can insert task documents"
  ON task_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete task documents" ON task_documents;
CREATE POLICY "Users can delete task documents"
  ON task_documents FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update task documents" ON task_documents;
CREATE POLICY "Users can update task documents"
  ON task_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_documents_updated_at ON project_documents;
CREATE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_documents_updated_at ON task_documents;
CREATE TRIGGER update_task_documents_updated_at
  BEFORE UPDATE ON task_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Project and Task document tables setup complete!';
  RAISE NOTICE 'Tables created: project_documents, task_documents';
  RAISE NOTICE 'RLS policies and triggers applied successfully';
END $$;

