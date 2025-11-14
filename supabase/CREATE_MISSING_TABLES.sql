-- =====================================================
-- CREATE ALL MISSING TABLES FOR DASHBOARD & PAGES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Ensure projects table exists
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Simple policies
DROP POLICY IF EXISTS "allow_view_group_projects" ON projects;
CREATE POLICY "allow_view_group_projects"
ON projects FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_insert_projects" ON projects;
CREATE POLICY "allow_insert_projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_projects" ON projects;
CREATE POLICY "allow_update_projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_delete_projects" ON projects;
CREATE POLICY "allow_delete_projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- 2. Ensure tasks table exists
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Simple policies
DROP POLICY IF EXISTS "allow_view_tasks" ON tasks;
CREATE POLICY "allow_view_tasks"
ON tasks FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_insert_tasks" ON tasks;
CREATE POLICY "allow_insert_tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_tasks" ON tasks;
CREATE POLICY "allow_update_tasks"
ON tasks FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_delete_tasks" ON tasks;
CREATE POLICY "allow_delete_tasks"
ON tasks FOR DELETE
TO authenticated
USING (true);

-- 3. Ensure activity_logs table exists
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Simple policies
DROP POLICY IF EXISTS "allow_view_activity" ON activity_logs;
CREATE POLICY "allow_view_activity"
ON activity_logs FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_insert_activity" ON activity_logs;
CREATE POLICY "allow_insert_activity"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Ensure documents table exists
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Simple policies
DROP POLICY IF EXISTS "allow_view_documents" ON documents;
CREATE POLICY "allow_view_documents"
ON documents FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_insert_documents" ON documents;
CREATE POLICY "allow_insert_documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_delete_documents" ON documents;
CREATE POLICY "allow_delete_documents"
ON documents FOR DELETE
TO authenticated
USING (true);

-- 5. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_group_id ON projects(group_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_activity_logs_group_id ON activity_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_documents_group_id ON documents(group_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_task_id ON documents(task_id);

-- 6. Grant permissions
-- =====================================================
GRANT ALL ON projects TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON documents TO authenticated;

-- 7. Insert sample data for testing (optional - only if tables are empty)
-- =====================================================
DO $$
DECLARE
  v_group_id UUID;
  v_user_id UUID;
  v_project_id UUID;
BEGIN
  -- Get first group and user for sample data
  SELECT id INTO v_group_id FROM groups LIMIT 1;
  SELECT id INTO v_user_id FROM users LIMIT 1;

  IF v_group_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    -- Check if projects table is empty
    IF NOT EXISTS (SELECT 1 FROM projects LIMIT 1) THEN
      -- Insert sample project
      INSERT INTO projects (id, group_id, name, description, status, created_by)
      VALUES (gen_random_uuid(), v_group_id, 'Welcome Project', 'Get started with your first project', 'active', v_user_id)
      RETURNING id INTO v_project_id;

      -- Insert sample tasks
      INSERT INTO tasks (group_id, project_id, title, description, status, priority, created_by)
      VALUES
        (v_group_id, v_project_id, 'Complete your profile', 'Add your details and avatar', 'todo', 'high', v_user_id),
        (v_group_id, v_project_id, 'Invite team members', 'Share the join code with your team', 'todo', 'medium', v_user_id),
        (v_group_id, v_project_id, 'Create your first task', 'Try creating a task for your team', 'todo', 'low', v_user_id);

      -- Insert sample activity
      INSERT INTO activity_logs (group_id, user_id, action, description)
      VALUES
        (v_group_id, v_user_id, 'project_created', 'Welcome Project was created'),
        (v_group_id, v_user_id, 'task_created', 'First tasks were created');

      RAISE NOTICE '✅ Sample data inserted';
    END IF;
  END IF;
END $$;

-- =====================================================
-- VERIFY TABLES
-- =====================================================
SELECT
  'projects' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'projects' AND privilege_type = 'SELECT') as has_privileges
FROM projects
UNION ALL
SELECT
  'tasks' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'tasks' AND privilege_type = 'SELECT') as has_privileges
FROM tasks
UNION ALL
SELECT
  'activity_logs' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'activity_logs' AND privilege_type = 'SELECT') as has_privileges
FROM activity_logs
UNION ALL
SELECT
  'documents' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'documents' AND privilege_type = 'SELECT') as has_privileges
FROM documents;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Dashboard should now load without errors!';
  RAISE NOTICE '🎯 All pages (Team, Projects, Tasks, etc.) should work!';
END $$;

