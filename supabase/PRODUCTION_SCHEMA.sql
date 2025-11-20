-- =====================================================
-- ORBIT LIVE TEAM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- This is the complete, production-ready schema
-- Run this ONCE on a fresh database
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'developer', 'viewer')) DEFAULT 'developer',
  title TEXT,
  position TEXT,
  department TEXT,
  phone TEXT,
  custom_roles TEXT[],
  bio TEXT,
  skills TEXT[],
  location TEXT,
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups (Workspaces)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  group_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members (User-Workspace relationship)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'need_time', 'completed', 'active', 'on_hold')) DEFAULT 'active',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  team_members UUID[],
  start_date DATE,
  end_date DATE,
  deadline TIMESTAMPTZ,
  budget NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'need_time', 'completed', 'todo', 'done')) DEFAULT 'todo',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings/Calendar Events
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  attendees UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'task_created', 'task_updated', 'task_completed', 
    'project_created', 'project_updated', 
    'document_uploaded', 'meeting_scheduled', 
    'user_joined', 'user_left'
  )),
  description TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('notification', 'privacy', 'appearance', 'preference')) DEFAULT 'preference',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Attachments (for tasks)
CREATE TABLE IF NOT EXISTS task_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, document_id)
);

-- Document Attachments (for projects)
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, document_id)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Groups
CREATE INDEX IF NOT EXISTS idx_groups_owner ON groups(group_owner_id);
CREATE INDEX IF NOT EXISTS idx_groups_join_code ON groups(join_code);

-- Group Members
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_group ON projects(group_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_group ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_group ON documents(group_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Meetings
CREATE INDEX IF NOT EXISTS idx_meetings_group ON meetings(group_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_group ON activity_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at DESC);

-- User Settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- AI Conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_group ON ai_conversations(group_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can view groups they are members of" ON groups FOR SELECT TO authenticated 
  USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert groups" ON groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = group_owner_id);
CREATE POLICY "Group owners can update" ON groups FOR UPDATE TO authenticated USING (auth.uid() = group_owner_id);
CREATE POLICY "Group owners can delete" ON groups FOR DELETE TO authenticated USING (auth.uid() = group_owner_id);

-- Group Members policies
CREATE POLICY "Users can view group members" ON group_members FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can join groups" ON group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage members" ON group_members FOR DELETE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Projects policies
CREATE POLICY "Users can view workspace projects" ON projects FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create projects" ON projects FOR INSERT TO authenticated 
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update projects" ON projects FOR UPDATE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete projects" ON projects FOR DELETE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Tasks policies
CREATE POLICY "Users can view workspace tasks" ON tasks FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT TO authenticated 
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete tasks" ON tasks FOR DELETE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Documents policies
CREATE POLICY "Users can view workspace documents" ON documents FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can upload documents" ON documents FOR INSERT TO authenticated 
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update documents" ON documents FOR UPDATE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete documents" ON documents FOR DELETE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Meetings policies
CREATE POLICY "Users can view workspace meetings" ON meetings FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create meetings" ON meetings FOR INSERT TO authenticated 
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update meetings" ON meetings FOR UPDATE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete meetings" ON meetings FOR DELETE TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Activity Logs policies
CREATE POLICY "Users can view workspace activity" ON activity_logs FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create activity logs" ON activity_logs FOR INSERT TO authenticated 
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- User Settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL TO authenticated USING (auth.uid() = user_id);

-- AI Conversations policies
CREATE POLICY "Users can view own conversations" ON ai_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversations" ON ai_conversations FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Task/Project Documents policies
CREATE POLICY "Users can view task documents" ON task_documents FOR SELECT TO authenticated 
  USING (task_id IN (SELECT id FROM tasks WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage task documents" ON task_documents FOR ALL TO authenticated 
  USING (task_id IN (SELECT id FROM tasks WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can view project documents" ON project_documents FOR SELECT TO authenticated 
  USING (project_id IN (SELECT id FROM projects WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage project documents" ON project_documents FOR ALL TO authenticated 
  USING (project_id IN (SELECT id FROM projects WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())));

-- =====================================================
-- 4. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
-- Drop triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. STORAGE BUCKETS (Run in Supabase Storage UI or via API)
-- =====================================================
-- These need to be created in Supabase Dashboard > Storage
-- 
-- 1. Create bucket 'avatars' (public)
-- 2. Create bucket 'documents' (private with RLS)
-- 
-- RLS Policies for 'documents' bucket:
-- - SELECT: Users can view files from their workspace
-- - INSERT: Users can upload files to their workspace
-- - DELETE: Users can delete their own files

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ PRODUCTION SCHEMA INSTALLED';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Create storage buckets: avatars (public), documents (private)';
  RAISE NOTICE '2. Configure storage RLS policies';
  RAISE NOTICE '3. Update application .env file with Supabase credentials';
  RAISE NOTICE '4. Test authentication and workspace creation';
  RAISE NOTICE '';
END $$;
