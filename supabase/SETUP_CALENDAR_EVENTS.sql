-- ================================================================
-- CALENDAR EVENTS TABLE SETUP
-- Complete calendar system with events, recurrence, and reminders
-- ================================================================

-- ================================================================
-- STEP 1: Create events table
-- ================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#3b82f6',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  assignees UUID[] DEFAULT ARRAY[]::UUID[],
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  reminder INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_events_group_id ON public.events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_assignees ON public.events USING GIN (assignees);

-- ================================================================
-- STEP 2: RLS Policies
-- ================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Users can view events in their workspace
DROP POLICY IF EXISTS "Users can view workspace events" ON public.events;
CREATE POLICY "Users can view workspace events"
ON public.events FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Users can create events in their workspace
DROP POLICY IF EXISTS "Users can create workspace events" ON public.events;
CREATE POLICY "Users can create workspace events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Users can update events in their workspace
DROP POLICY IF EXISTS "Users can update workspace events" ON public.events;
CREATE POLICY "Users can update workspace events"
ON public.events FOR UPDATE
TO authenticated
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Users can delete their own events or if they're admin
DROP POLICY IF EXISTS "Users can delete workspace events" ON public.events;
CREATE POLICY "Users can delete workspace events"
ON public.events FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members
    WHERE user_id = auth.uid()
    AND group_id = events.group_id
    AND role = 'admin'
  )
);

-- ================================================================
-- STEP 3: Notification triggers for calendar events
-- ================================================================

-- Notify assignees when event is created
CREATE OR REPLACE FUNCTION notify_event_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignee UUID;
  v_creator_name TEXT;
BEGIN
  -- Get creator name
  SELECT name INTO v_creator_name FROM users WHERE id = NEW.created_by;

  -- Notify each assignee
  IF NEW.assignees IS NOT NULL THEN
    FOREACH v_assignee IN ARRAY NEW.assignees
    LOOP
      IF v_assignee != NEW.created_by THEN
        -- Insert notification directly without action_url
        INSERT INTO public.notifications (user_id, title, message, type, read)
        VALUES (
          v_assignee,
          '📅 New Event: ' || NEW.title,
          v_creator_name || ' added you to an event on ' || to_char(NEW.start_time, 'Mon DD at HH:MI AM'),
          'info',
          false
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_created_notification ON events;
CREATE TRIGGER event_created_notification
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION notify_event_created();

-- Notify assignees when event is updated
CREATE OR REPLACE FUNCTION notify_event_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignee UUID;
  v_updater_name TEXT;
  v_changes TEXT := '';
BEGIN
  -- Get updater name
  SELECT name INTO v_updater_name FROM users WHERE id = auth.uid();

  -- Build change message
  IF NEW.start_time != OLD.start_time OR NEW.end_time != OLD.end_time THEN
    v_changes := 'Time changed to ' || to_char(NEW.start_time, 'Mon DD at HH:MI AM');
  ELSIF NEW.location != OLD.location THEN
    v_changes := 'Location changed to ' || COALESCE(NEW.location, 'TBD');
  ELSIF NEW.status != OLD.status THEN
    v_changes := 'Status changed to ' || NEW.status;
  ELSE
    v_changes := 'Details updated';
  END IF;

  -- Notify each assignee
  IF NEW.assignees IS NOT NULL THEN
    FOREACH v_assignee IN ARRAY NEW.assignees
    LOOP
      IF v_assignee != auth.uid() THEN
        -- Insert notification directly without action_url
        INSERT INTO public.notifications (user_id, title, message, type, read)
        VALUES (
          v_assignee,
          '📅 Event Updated: ' || NEW.title,
          v_updater_name || ' updated the event. ' || v_changes,
          'info',
          false
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_updated_notification ON events;
CREATE TRIGGER event_updated_notification
AFTER UPDATE ON events
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION notify_event_updated();

-- ================================================================
-- STEP 4: Grant permissions
-- ================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- ================================================================
-- Verification
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Calendar events system setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Features enabled:';
  RAISE NOTICE '  - Event creation and editing';
  RAISE NOTICE '  - Recurring events support';
  RAISE NOTICE '  - Event reminders';
  RAISE NOTICE '  - Multi-user assignments';
  RAISE NOTICE '  - Real-time notifications';
  RAISE NOTICE '';
  RAISE NOTICE '📅 Your calendar is ready to use!';
END $$;

