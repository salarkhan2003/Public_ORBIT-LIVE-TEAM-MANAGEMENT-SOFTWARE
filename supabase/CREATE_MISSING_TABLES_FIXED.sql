-- =====================================================
-- CREATE ALL MISSING TABLES FOR DASHBOARD & PAGES (FIXED)
-- Run this in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: Run scripts in this order:
-- 1. First run FIX_INFINITE_RECURSION.sql
-- 2. Then run FIX_CREATED_AT_COLUMN.sql
-- 3. Finally run this script

-- =====================================================
-- STEP 1: Create tables without foreign keys first
-- =====================================================

-- 1. Create projects table
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 2. Create tasks table
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 3. Create activity_logs table
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create documents table
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  project_id UUID,
  task_id UUID,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Add foreign key constraints after all tables exist
-- =====================================================

-- Add foreign keys to projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_group_id_fkey'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_created_by_fkey'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
END $$;

-- Add foreign keys to tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_group_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_project_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_assigned_to_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey
      FOREIGN KEY (assigned_to) REFERENCES users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_created_by_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
END $$;

-- Add foreign keys to activity_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'activity_logs_group_id_fkey'
  ) THEN
    ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'activity_logs_user_id_fkey'
  ) THEN
    ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

-- Add foreign keys to documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_group_id_fkey'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_project_id_fkey'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_task_id_fkey'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_task_id_fkey
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_uploaded_by_fkey'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey
      FOREIGN KEY (uploaded_by) REFERENCES users(id);
  END IF;
END $$;

-- =====================================================
-- STEP 3: Enable RLS on all tables
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create simple, non-recursive RLS policies
-- =====================================================

-- Projects policies
DROP POLICY IF EXISTS "allow_view_projects" ON projects;
CREATE POLICY "allow_view_projects"
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

-- Tasks policies
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

-- Activity logs policies
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

-- Documents policies
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

DROP POLICY IF EXISTS "allow_update_documents" ON documents;
CREATE POLICY "allow_update_documents"
ON documents FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_delete_documents" ON documents;
CREATE POLICY "allow_delete_documents"
ON documents FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- STEP 5: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_projects_group_id ON projects(group_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_group_id ON activity_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_documents_group_id ON documents(group_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_task_id ON documents(task_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- =====================================================
-- STEP 6: Grant permissions
-- =====================================================

GRANT ALL ON projects TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON documents TO authenticated;

-- =====================================================
-- STEP 7: Insert sample data (only if tables are empty)
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
      RAISE NOTICE 'Inserting sample data...';

      -- Insert sample project
      INSERT INTO projects (id, group_id, name, description, status, created_by)
      VALUES (gen_random_uuid(), v_group_id, 'Welcome to ORBIT LIVE', 'Your first project to get started', 'active', v_user_id)
      RETURNING id INTO v_project_id;

      -- Insert sample tasks
      INSERT INTO tasks (group_id, project_id, title, description, status, priority, created_by)
      VALUES
        (v_group_id, v_project_id, 'Complete your profile', 'Add your details and avatar to personalize your account', 'todo', 'high', v_user_id),
        (v_group_id, v_project_id, 'Invite your team', 'Share the workspace join code with your team members', 'todo', 'medium', v_user_id),
        (v_group_id, v_project_id, 'Create your first task', 'Try creating a task and assigning it to team members', 'todo', 'low', v_user_id),
        (v_group_id, v_project_id, 'Explore the dashboard', 'Check out the dashboard to see your team''s progress', 'done', 'low', v_user_id);

      -- Insert sample activity
      INSERT INTO activity_logs (group_id, user_id, action, description)
      VALUES
        (v_group_id, v_user_id, 'project_created', 'Welcome to ORBIT LIVE project was created'),
        (v_group_id, v_user_id, 'task_created', 'Initial tasks were created'),
        (v_group_id, v_user_id, 'task_completed', 'Completed exploring the dashboard');

      RAISE NOTICE '✅ Sample data inserted successfully';
    ELSE
      RAISE NOTICE 'ℹ️ Projects table already has data, skipping sample data insertion';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ No groups or users found, skipping sample data insertion';
  END IF;
END $$;

-- =====================================================
-- STEP 8: Verify everything
-- =====================================================

SELECT
  'projects' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'projects') as column_count
FROM projects
UNION ALL
SELECT
  'tasks' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'tasks') as column_count
FROM tasks
UNION ALL
SELECT
  'activity_logs' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'activity_logs') as column_count
FROM activity_logs
UNION ALL
SELECT
  'documents' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'documents') as column_count
FROM documents;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ ALL TABLES CREATED SUCCESSFULLY! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Projects table ready';
  RAISE NOTICE '✅ Tasks table ready';
  RAISE NOTICE '✅ Activity logs table ready';
  RAISE NOTICE '✅ Documents table ready';
  RAISE NOTICE '✅ All foreign keys added';
  RAISE NOTICE '✅ RLS policies applied (non-recursive)';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '✅ Sample data inserted (if needed)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Dashboard should now load without errors!';
  RAISE NOTICE '🎯 All pages should work properly!';
  RAISE NOTICE '🎯 No more infinite loading!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Clear browser localStorage (F12 → Application → Clear)';
  RAISE NOTICE '2. Hard refresh (Ctrl+Shift+R)';
  RAISE NOTICE '3. Login and test dashboard';
  RAISE NOTICE '';
END $$;

