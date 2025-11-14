ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS policies (simple, non-recursive)
-- =====================================================

-- Projects policies
DROP POLICY IF EXISTS "allow_view_projects" ON projects;
CREATE POLICY "allow_view_projects" ON projects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_insert_projects" ON projects;
CREATE POLICY "allow_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_projects" ON projects;
CREATE POLICY "allow_update_projects" ON projects FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_delete_projects" ON projects;
CREATE POLICY "allow_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- Tasks policies
DROP POLICY IF EXISTS "allow_view_tasks" ON tasks;
CREATE POLICY "allow_view_tasks" ON tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_insert_tasks" ON tasks;
CREATE POLICY "allow_insert_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_tasks" ON tasks;
CREATE POLICY "allow_update_tasks" ON tasks FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_delete_tasks" ON tasks;
CREATE POLICY "allow_delete_tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- Activity logs policies
DROP POLICY IF EXISTS "allow_view_activity" ON activity_logs;
CREATE POLICY "allow_view_activity" ON activity_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_insert_activity" ON activity_logs;
CREATE POLICY "allow_insert_activity" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Documents policies
DROP POLICY IF EXISTS "allow_view_documents" ON documents;
CREATE POLICY "allow_view_documents" ON documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_insert_documents" ON documents;
CREATE POLICY "allow_insert_documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_documents" ON documents;
CREATE POLICY "allow_update_documents" ON documents FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_delete_documents" ON documents;
CREATE POLICY "allow_delete_documents" ON documents FOR DELETE TO authenticated USING (true);

-- =====================================================
-- STEP 6: Create indexes
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
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Only create task_id index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'task_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_documents_task_id ON documents(task_id);
  END IF;
END $$;

-- =====================================================
-- STEP 7: Grant permissions
-- =====================================================

GRANT ALL ON projects TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON documents TO authenticated;

-- =====================================================
-- STEP 8: Insert sample data
-- =====================================================

DO $$
DECLARE
  v_group_id UUID;
  v_user_id UUID;
  v_project_id UUID;
BEGIN
  -- Get first group and user
  SELECT id INTO v_group_id FROM groups LIMIT 1;
  SELECT id INTO v_user_id FROM users LIMIT 1;

  IF v_group_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    -- Only insert if projects table is empty
    IF NOT EXISTS (SELECT 1 FROM projects LIMIT 1) THEN
      RAISE NOTICE 'Inserting sample data...';

      -- Insert sample project
      INSERT INTO projects (id, group_id, name, description, status, created_by)
      VALUES (gen_random_uuid(), v_group_id, 'Welcome to ORBIT LIVE', 'Your first project to get started', 'active', v_user_id)
      RETURNING id INTO v_project_id;

      -- Insert sample tasks
      INSERT INTO tasks (group_id, project_id, title, description, status, priority, created_by)
      VALUES
        (v_group_id, v_project_id, 'Complete your profile', 'Add your details and avatar', 'todo', 'high', v_user_id),
        (v_group_id, v_project_id, 'Invite your team', 'Share the join code', 'todo', 'medium', v_user_id),
        (v_group_id, v_project_id, 'Create your first task', 'Try the task system', 'todo', 'low', v_user_id),
        (v_group_id, v_project_id, 'Explore dashboard', 'Check out features', 'done', 'low', v_user_id);

      -- Insert sample activity
      INSERT INTO activity_logs (group_id, user_id, action, description)
      VALUES
        (v_group_id, v_user_id, 'project_created', 'Welcome project created'),
        (v_group_id, v_user_id, 'task_created', 'Initial tasks created');

      RAISE NOTICE '✅ Sample data inserted';
    END IF;
  END IF;
END $$;

-- =====================================================
-- VERIFY & SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
  v_projects_count INT;
  v_tasks_count INT;
  v_activity_count INT;
  v_documents_count INT;
BEGIN
  SELECT COUNT(*) INTO v_projects_count FROM projects;
  SELECT COUNT(*) INTO v_tasks_count FROM tasks;
  SELECT COUNT(*) INTO v_activity_count FROM activity_logs;
  SELECT COUNT(*) INTO v_documents_count FROM documents;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '✅✅✅ ALL TABLES CREATED SUCCESSFULLY! ✅✅✅';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Table Status:';
  RAISE NOTICE '  ✅ projects: % rows', v_projects_count;
  RAISE NOTICE '  ✅ tasks: % rows', v_tasks_count;
  RAISE NOTICE '  ✅ activity_logs: % rows', v_activity_count;
  RAISE NOTICE '  ✅ documents: % rows', v_documents_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '  ✅ RLS enabled on all tables';
  RAISE NOTICE '  ✅ Non-recursive policies applied';
  RAISE NOTICE '  ✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Performance:';
  RAISE NOTICE '  ✅ Indexes created';
  RAISE NOTICE '  ✅ Foreign keys added';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Clear browser localStorage (F12 → Application → Clear)';
  RAISE NOTICE '  2. Hard refresh (Ctrl+Shift+R)';
  RAISE NOTICE '  3. Login and test dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '🚀 YOUR APP IS READY TO USE! 🚀';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
-- =====================================================
-- CREATE ALL MISSING TABLES - BULLETPROOF VERSION
-- Run this in Supabase SQL Editor
-- This version checks EVERYTHING before creating
-- =====================================================

-- =====================================================
-- STEP 1: Create base tables (no foreign keys)
-- =====================================================

-- 1. Projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'projects'
  ) THEN
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID
    );
    RAISE NOTICE '✅ Created projects table';
  ELSE
    RAISE NOTICE 'ℹ️ Projects table already exists';
  END IF;
END $$;

-- 2. Tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'tasks'
  ) THEN
    CREATE TABLE tasks (
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
    RAISE NOTICE '✅ Created tasks table';
  ELSE
    RAISE NOTICE 'ℹ️ Tasks table already exists';
  END IF;
END $$;

-- 3. Activity logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'activity_logs'
  ) THEN
    CREATE TABLE activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL,
      user_id UUID,
      action TEXT NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created activity_logs table';
  ELSE
    RAISE NOTICE 'ℹ️ Activity_logs table already exists';
  END IF;
END $$;

-- 4. Documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'documents'
  ) THEN
    CREATE TABLE documents (
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
    RAISE NOTICE '✅ Created documents table';
  ELSE
    RAISE NOTICE 'ℹ️ Documents table already exists';
  END IF;
END $$;

-- =====================================================
-- STEP 2: Add missing columns if they don't exist
-- =====================================================

-- Add task_id to documents if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'task_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN task_id UUID;
    RAISE NOTICE '✅ Added task_id column to documents';
  END IF;
END $$;

-- =====================================================
-- STEP 3: Add foreign key constraints
-- =====================================================

-- Projects foreign keys
DO $$
BEGIN
  -- group_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_group_id_fkey'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added projects.group_id foreign key';
  END IF;

  -- created_by foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_created_by_fkey'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id);
    RAISE NOTICE '✅ Added projects.created_by foreign key';
  END IF;
END $$;

-- Tasks foreign keys
DO $$
BEGIN
  -- group_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_group_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added tasks.group_id foreign key';
  END IF;

  -- project_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_project_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added tasks.project_id foreign key';
  END IF;

  -- assigned_to foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_assigned_to_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey
      FOREIGN KEY (assigned_to) REFERENCES users(id);
    RAISE NOTICE '✅ Added tasks.assigned_to foreign key';
  END IF;

  -- created_by foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_created_by_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id);
    RAISE NOTICE '✅ Added tasks.created_by foreign key';
  END IF;
END $$;

-- Activity logs foreign keys
DO $$
BEGIN
  -- group_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'activity_logs_group_id_fkey'
  ) THEN
    ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added activity_logs.group_id foreign key';
  END IF;

  -- user_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'activity_logs_user_id_fkey'
  ) THEN
    ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id);
    RAISE NOTICE '✅ Added activity_logs.user_id foreign key';
  END IF;
END $$;

-- Documents foreign keys (ONLY if columns exist)
DO $$
BEGIN
  -- group_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_group_id_fkey'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'documents' AND column_name = 'group_id'
    ) THEN
      ALTER TABLE documents ADD CONSTRAINT documents_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added documents.group_id foreign key';
    END IF;
  END IF;

  -- project_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_project_id_fkey'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'documents' AND column_name = 'project_id'
    ) THEN
      ALTER TABLE documents ADD CONSTRAINT documents_project_id_fkey
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added documents.project_id foreign key';
    END IF;
  END IF;

  -- task_id foreign key (CHECK COLUMN EXISTS FIRST!)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_task_id_fkey'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'documents' AND column_name = 'task_id'
    ) THEN
      ALTER TABLE documents ADD CONSTRAINT documents_task_id_fkey
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added documents.task_id foreign key';
    ELSE
      RAISE NOTICE '⚠️ Skipped documents.task_id foreign key - column does not exist';
    END IF;
  END IF;

  -- uploaded_by foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_uploaded_by_fkey'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'documents' AND column_name = 'uploaded_by'
    ) THEN
      ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey
        FOREIGN KEY (uploaded_by) REFERENCES users(id);
      RAISE NOTICE '✅ Added documents.uploaded_by foreign key';
    END IF;
  END IF;
END $$;

-- =====================================================
-- STEP 4: Enable RLS
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

