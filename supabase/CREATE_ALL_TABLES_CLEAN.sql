-- CLEAN INSTALLATION - Drop and recreate all tables
-- Run this script in your Supabase SQL Editor
-- WARNING: This will delete all existing data in these tables!

-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  deadline TIMESTAMPTZ,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_members UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_group_id ON projects(group_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their group" ON projects
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create projects in their group" ON projects
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update projects in their group" ON projects
  FOR UPDATE USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete projects in their group" ON projects
  FOR DELETE USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),
  deadline TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  attachments JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_group_id ON tasks(group_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their group" ON tasks
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create tasks in their group" ON tasks
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update tasks in their group" ON tasks
  FOR UPDATE USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete tasks in their group" ON tasks
  FOR DELETE USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- ============================================
-- FILE UPLOADS TABLE
-- ============================================
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'document' CHECK (category IN ('document', 'image', 'video', 'audio', 'archive', 'other')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_group_id ON file_uploads(group_id);
CREATE INDEX idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_category ON file_uploads(category);

ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files in their group" ON file_uploads
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can upload files to their group" ON file_uploads
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own files" ON file_uploads
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_link TEXT,
  meeting_type TEXT DEFAULT 'team' CHECK (meeting_type IN ('team', 'client', 'standup', 'review', 'planning', 'other')),
  attendees UUID[] DEFAULT ARRAY[]::UUID[],
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_group_id ON meetings(group_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meetings in their group" ON meetings
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create meetings in their group" ON meetings
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update meetings in their group" ON meetings
  FOR UPDATE USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete meetings they created" ON meetings
  FOR DELETE USING (
    created_by = auth.uid() OR
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- ============================================
-- AI CONVERSATIONS TABLE
-- ============================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::JSONB,
  context JSONB DEFAULT '{}'::JSONB,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_group_id ON ai_conversations(group_id);
CREATE INDEX idx_ai_conversations_updated_at ON ai_conversations(updated_at);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" ON ai_conversations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations" ON ai_conversations
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('notification', 'privacy', 'appearance', 'preference')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_setting_key ON user_settings(setting_key);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_group_id ON activity_logs(group_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs in their group" ON activity_logs
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All tables created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ projects';
  RAISE NOTICE '  ✓ tasks';
  RAISE NOTICE '  ✓ file_uploads';
  RAISE NOTICE '  ✓ meetings';
  RAISE NOTICE '  ✓ ai_conversations';
  RAISE NOTICE '  ✓ user_settings';
  RAISE NOTICE '  ✓ activity_logs';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies applied to all tables';
  RAISE NOTICE 'Update triggers configured';
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now use the Track Boss AI application!';
  RAISE NOTICE '========================================';
END $$;

