-- ================================================================
-- NOTIFICATION SYSTEM - COMPLETE SETUP
-- Automatic notifications for tasks, projects, team members, etc.
-- ================================================================

-- ================================================================
-- STEP 1: Ensure notifications table exists
-- ================================================================

-- Drop table if exists to recreate with proper schema
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ================================================================
-- STEP 2: RLS Policies for notifications
-- ================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow system to insert notifications for any user
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- ================================================================
-- STEP 3: Helper function to create notifications
-- ================================================================

-- Drop all existing versions of the function with CASCADE
DROP FUNCTION IF EXISTS create_notification CASCADE;

-- Create the notification helper function
CREATE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- ================================================================
-- STEP 4: Trigger for task assignments
-- ================================================================

CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_title TEXT;
  v_assigner_name TEXT;
BEGIN
  -- Get task title
  SELECT title INTO v_task_title FROM tasks WHERE id = NEW.id;

  -- Get assigner name
  SELECT name INTO v_assigner_name FROM users WHERE id = NEW.assigned_to;

  -- Create notification for assignee
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != OLD.assigned_to THEN
    PERFORM create_notification(
      NEW.assigned_to,
      '📋 New Task Assigned',
      'You have been assigned to task: ' || v_task_title,
      'info',
      '/tasks'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_assignment_notification ON tasks;
CREATE TRIGGER task_assignment_notification
AFTER UPDATE OF assigned_to ON tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to)
EXECUTE FUNCTION notify_task_assigned();

-- ================================================================
-- STEP 5: Trigger for task status changes
-- ================================================================

CREATE OR REPLACE FUNCTION notify_task_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_title TEXT;
  v_creator_id UUID;
  v_status_icon TEXT;
BEGIN
  SELECT title, created_by INTO v_task_title, v_creator_id FROM tasks WHERE id = NEW.id;

  -- Determine status icon
  v_status_icon := CASE NEW.status
    WHEN 'completed' THEN '✅'
    WHEN 'in-progress' THEN '🔄'
    WHEN 'blocked' THEN '⛔'
    ELSE '📝'
  END;

  -- Notify task creator if status changed and they're not the one who changed it
  IF NEW.status IS DISTINCT FROM OLD.status AND v_creator_id != auth.uid() THEN
    PERFORM create_notification(
      v_creator_id,
      v_status_icon || ' Task Status Updated',
      'Task "' || v_task_title || '" status changed to: ' || NEW.status,
      CASE NEW.status
        WHEN 'completed' THEN 'success'
        WHEN 'blocked' THEN 'warning'
        ELSE 'info'
      END,
      '/tasks'
    );
  END IF;

  -- Also notify assignee if different from creator
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != v_creator_id AND NEW.assigned_to != auth.uid() THEN
    PERFORM create_notification(
      NEW.assigned_to,
      v_status_icon || ' Task Status Updated',
      'Task "' || v_task_title || '" status changed to: ' || NEW.status,
      CASE NEW.status
        WHEN 'completed' THEN 'success'
        WHEN 'blocked' THEN 'warning'
        ELSE 'info'
      END,
      '/tasks'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_status_notification ON tasks;
CREATE TRIGGER task_status_notification
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION notify_task_status_change();

-- ================================================================
-- STEP 6: Trigger for new team members
-- ================================================================

CREATE OR REPLACE FUNCTION notify_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_name TEXT;
  v_new_member_name TEXT;
  v_member RECORD;
BEGIN
  -- Get group name
  SELECT name INTO v_group_name FROM groups WHERE id = NEW.group_id;

  -- Get new member name
  SELECT name INTO v_new_member_name FROM users WHERE id = NEW.user_id;

  -- Notify all existing members except the new one
  FOR v_member IN
    SELECT DISTINCT user_id
    FROM group_members
    WHERE group_id = NEW.group_id
    AND user_id != NEW.user_id
  LOOP
    PERFORM create_notification(
      v_member.user_id,
      '👋 New Team Member',
      v_new_member_name || ' joined workspace: ' || v_group_name,
      'success',
      '/team'
    );
  END LOOP;

  -- Welcome notification for new member
  PERFORM create_notification(
    NEW.user_id,
    '🎉 Welcome to ' || v_group_name,
    'You have successfully joined the workspace. Start collaborating with your team!',
    'success',
    '/dashboard'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS new_member_notification ON group_members;
CREATE TRIGGER new_member_notification
AFTER INSERT ON group_members
FOR EACH ROW
EXECUTE FUNCTION notify_new_member();

-- ================================================================
-- STEP 7: Trigger for member leaving
-- ================================================================

CREATE OR REPLACE FUNCTION notify_member_left()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_name TEXT;
  v_member_name TEXT;
  v_member RECORD;
BEGIN
  -- Get group and member names
  SELECT name INTO v_group_name FROM groups WHERE id = OLD.group_id;
  SELECT name INTO v_member_name FROM users WHERE id = OLD.user_id;

  -- Notify all remaining members
  FOR v_member IN
    SELECT DISTINCT user_id
    FROM group_members
    WHERE group_id = OLD.group_id
    AND user_id != OLD.user_id
  LOOP
    PERFORM create_notification(
      v_member.user_id,
      '👋 Member Left',
      v_member_name || ' left workspace: ' || v_group_name,
      'info',
      '/team'
    );
  END LOOP;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS member_left_notification ON group_members;
CREATE TRIGGER member_left_notification
BEFORE DELETE ON group_members
FOR EACH ROW
EXECUTE FUNCTION notify_member_left();

-- ================================================================
-- STEP 8: Trigger for project updates
-- ================================================================

CREATE OR REPLACE FUNCTION notify_project_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member RECORD;
  v_update_type TEXT;
BEGIN
  -- Determine update type
  IF TG_OP = 'INSERT' THEN
    v_update_type := 'created';

    -- Notify all workspace members about new project
    FOR v_member IN
      SELECT DISTINCT gm.user_id
      FROM group_members gm
      WHERE gm.group_id = NEW.group_id
      AND gm.user_id != auth.uid()
    LOOP
      PERFORM create_notification(
        v_member.user_id,
        '🚀 New Project Created',
        'Project "' || NEW.name || '" has been created',
        'info',
        '/projects'
      );
    END LOOP;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Status changed
    FOR v_member IN
      SELECT DISTINCT gm.user_id
      FROM group_members gm
      WHERE gm.group_id = NEW.group_id
      AND gm.user_id != auth.uid()
    LOOP
      PERFORM create_notification(
        v_member.user_id,
        '📊 Project Status Changed',
        'Project "' || NEW.name || '" status: ' || NEW.status,
        CASE NEW.status
          WHEN 'completed' THEN 'success'
          WHEN 'on-hold' THEN 'warning'
          ELSE 'info'
        END,
        '/projects'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_update_notification ON projects;
CREATE TRIGGER project_update_notification
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_project_update();

-- ================================================================
-- STEP 9: Trigger for document uploads
-- ================================================================

CREATE OR REPLACE FUNCTION notify_document_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member RECORD;
  v_uploader_name TEXT;
BEGIN
  -- Get uploader name
  SELECT name INTO v_uploader_name FROM users WHERE id = NEW.uploaded_by;

  -- Notify workspace members
  FOR v_member IN
    SELECT DISTINCT gm.user_id
    FROM group_members gm
    WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.uploaded_by
  LOOP
    PERFORM create_notification(
      v_member.user_id,
      '📄 New Document Uploaded',
      v_uploader_name || ' uploaded: ' || NEW.name,
      'info',
      '/documents'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS document_upload_notification ON documents;
CREATE TRIGGER document_upload_notification
AFTER INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION notify_document_upload();

-- ================================================================
-- STEP 10: Grant permissions
-- ================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- ================================================================
-- Verification
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Notification system setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Features enabled:';
  RAISE NOTICE '  - Task assignments';
  RAISE NOTICE '  - Task status changes';
  RAISE NOTICE '  - New team members';
  RAISE NOTICE '  - Members leaving';
  RAISE NOTICE '  - Project updates';
  RAISE NOTICE '  - Document uploads';
  RAISE NOTICE '';
  RAISE NOTICE '🔔 Real-time notifications will appear automatically!';
END $$;

