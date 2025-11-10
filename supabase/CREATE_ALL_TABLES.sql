-- Create all required tables for the Track Boss AI application
-- Run this script in your Supabase SQL Editor

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_group_id ON projects(group_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- RLS Policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view projects in their group" ON projects;
CREATE POLICY "Users can view projects in their group" ON projects
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create projects in their group" ON projects;
CREATE POLICY "Users can create projects in their group" ON projects
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update projects in their group" ON projects;
CREATE POLICY "Users can update projects in their group" ON projects
  FOR UPDATE USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete projects in their group" ON projects;
CREATE POLICY "Users can delete projects in their group" ON projects
  FOR DELETE USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
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

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- RLS Policies for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks in their group" ON tasks;
CREATE POLICY "Users can view tasks in their group" ON tasks
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in their group" ON tasks;
CREATE POLICY "Users can create tasks in their group" ON tasks
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in their group" ON tasks;
CREATE POLICY "Users can update tasks in their group" ON tasks
  FOR UPDATE USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks in their group" ON tasks;
CREATE POLICY "Users can delete tasks in their group" ON tasks
  FOR DELETE USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FILE UPLOADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS file_uploads (
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

-- Indexes for file uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_group_id ON file_uploads(group_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_uploads_category ON file_uploads(category);

-- RLS Policies for file_uploads
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view files in their group" ON file_uploads;
CREATE POLICY "Users can view files in their group" ON file_uploads
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can upload files to their group" ON file_uploads;
CREATE POLICY "Users can upload files to their group" ON file_uploads
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own files" ON file_uploads;
CREATE POLICY "Users can delete their own files" ON file_uploads
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meetings (
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

-- Indexes for meetings
CREATE INDEX IF NOT EXISTS idx_meetings_group_id ON meetings(group_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);

-- RLS Policies for meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view meetings in their group" ON meetings;
CREATE POLICY "Users can view meetings in their group" ON meetings
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create meetings in their group" ON meetings;
CREATE POLICY "Users can create meetings in their group" ON meetings
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update meetings in their group" ON meetings;
CREATE POLICY "Users can update meetings in their group" ON meetings
  FOR UPDATE USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete meetings they created" ON meetings;
CREATE POLICY "Users can delete meetings they created" ON meetings
  FOR DELETE USING (
    created_by = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- AI CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::JSONB,
  context JSONB DEFAULT '{}'::JSONB,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_group_id ON ai_conversations(group_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at);

-- RLS Policies for ai_conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_conversations;
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own conversations" ON ai_conversations;
CREATE POLICY "Users can create their own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own conversations" ON ai_conversations;
CREATE POLICY "Users can update their own conversations" ON ai_conversations
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own conversations" ON ai_conversations;
CREATE POLICY "Users can delete their own conversations" ON ai_conversations
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('notification', 'privacy', 'appearance', 'preference')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Index for user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_setting_key ON user_settings(setting_key);

-- RLS Policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- ACTIVITY LOGS TABLE (for tracking user actions)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_group_id ON activity_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS Policies for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activity logs in their group" ON activity_logs;
CREATE POLICY "Users can view activity logs in their group" ON activity_logs
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
CREATE POLICY "Users can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables that need updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'All tables created successfully!';
  RAISE NOTICE 'Tables created: projects, tasks, file_uploads, meetings, ai_conversations, user_settings, activity_logs';
  RAISE NOTICE 'RLS policies applied to all tables';
  RAISE NOTICE 'Update triggers configured';
  RAISE NOTICE 'You can now use the Track Boss AI application!';
END $$;
