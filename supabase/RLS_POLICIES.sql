-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This migration enables RLS and creates secure policies
-- for all tables in the ORBIT LIVE application
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Users can read all profiles, but only update their own

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all user profiles (needed for team pages)
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. GROUPS (WORKSPACES) TABLE
-- =====================================================
-- Users can only see groups they're members of

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view groups they're members of
CREATE POLICY "Users can view their groups"
ON groups FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update groups they own
CREATE POLICY "Owners can update their groups"
ON groups FOR UPDATE
TO authenticated
USING (group_owner_id = auth.uid())
WITH CHECK (group_owner_id = auth.uid());

-- Policy: Authenticated users can create groups
CREATE POLICY "Users can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (group_owner_id = auth.uid());

-- Policy: Owners can delete their groups
CREATE POLICY "Owners can delete their groups"
ON groups FOR DELETE
TO authenticated
USING (group_owner_id = auth.uid());

-- =====================================================
-- 3. GROUP_MEMBERS TABLE
-- =====================================================
-- Members can view other members in their group

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of their groups
CREATE POLICY "Users can view group members"
ON group_members FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Group owners and admins can add members
CREATE POLICY "Admins can add members"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  -- User is admin or owner of the group
  EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = group_members.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
  OR
  -- User is adding themselves (joining via code)
  user_id = auth.uid()
);

-- Policy: Admins can update member roles
CREATE POLICY "Admins can update members"
ON group_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = group_members.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = group_members.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- Policy: Admins can remove members, users can remove themselves
CREATE POLICY "Admins can remove members"
ON group_members FOR DELETE
TO authenticated
USING (
  -- User is admin/owner
  EXISTS (
    SELECT 1
    FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('admin', 'owner')
  )
  OR
  -- User is removing themselves
  user_id = auth.uid()
);

-- =====================================================
-- 4. PROJECTS TABLE
-- =====================================================
-- Users can only access projects in their workspace

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects in their groups
CREATE POLICY "Users can view group projects"
ON projects FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Group members can create projects
CREATE POLICY "Members can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

-- Policy: Project creators and admins can update
CREATE POLICY "Creators and admins can update projects"
ON projects FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = projects.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Project creators and admins can delete
CREATE POLICY "Creators and admins can delete projects"
ON projects FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = projects.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- =====================================================
-- 5. TASKS TABLE
-- =====================================================
-- Users can only access tasks in their workspace

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks in their groups
CREATE POLICY "Users can view group tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Group members can create tasks
CREATE POLICY "Members can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

-- Policy: Task creators, assignees, and admins can update
CREATE POLICY "Authorized users can update tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = tasks.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Task creators and admins can delete
CREATE POLICY "Creators and admins can delete tasks"
ON tasks FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = tasks.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- =====================================================
-- 6. DOCUMENTS TABLE
-- =====================================================
-- Users can only access documents in their workspace

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents in their groups
CREATE POLICY "Users can view group documents"
ON documents FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Group members can upload documents
CREATE POLICY "Members can upload documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
  AND uploaded_by = auth.uid()
);

-- Policy: Document uploaders and admins can update
CREATE POLICY "Uploaders and admins can update documents"
ON documents FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = documents.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Document uploaders and admins can delete
CREATE POLICY "Uploaders and admins can delete documents"
ON documents FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = documents.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- =====================================================
-- 7. MEETINGS TABLE
-- =====================================================
-- Users can only access meetings in their workspace

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view meetings in their groups
CREATE POLICY "Users can view group meetings"
ON meetings FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Group members can create meetings
CREATE POLICY "Members can create meetings"
ON meetings FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

-- Policy: Meeting creators and admins can update
CREATE POLICY "Creators and admins can update meetings"
ON meetings FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = meetings.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Meeting creators and admins can delete
CREATE POLICY "Creators and admins can delete meetings"
ON meetings FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = meetings.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- =====================================================
-- Users can only see their own notifications

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: System can create notifications for users
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- 9. ACTIVITY_LOGS TABLE
-- =====================================================
-- Users can view activity in their workspace

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activity in their groups
CREATE POLICY "Users can view group activity"
ON activity_logs FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: System can log activities
CREATE POLICY "System can create activity logs"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- =====================================================
-- 10. AI_CONVERSATIONS TABLE
-- =====================================================
-- Users can only see their own AI conversations

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own AI conversations
CREATE POLICY "Users can view own conversations"
ON ai_conversations FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can create AI conversations
CREATE POLICY "Users can create conversations"
ON ai_conversations FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations"
ON ai_conversations FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
ON ai_conversations FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- 11. USER_SETTINGS TABLE
-- =====================================================
-- Users can only manage their own settings

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can create their own settings
CREATE POLICY "Users can create own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
ON user_settings FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to test your RLS policies
-- =====================================================

-- Test 1: User can see their own profile
-- Should return 1 row
/*
SELECT COUNT(*) FROM users WHERE id = auth.uid();
*/

-- Test 2: User can only see groups they're in
-- Should only return user's groups
/*
SELECT * FROM groups;
*/

-- Test 3: User can only see tasks in their workspace
-- Should only return workspace tasks
/*
SELECT * FROM tasks;
*/

-- Test 4: User cannot see other users' notifications
-- Should only return own notifications
/*
SELECT * FROM notifications WHERE user_id != auth.uid();
-- Should return 0 rows
*/

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. These policies assume your schema has the columns mentioned
-- 2. Adjust table/column names to match your actual schema
-- 3. Test thoroughly before deploying to production
-- 4. Monitor performance - add indexes if queries are slow
-- 5. Review policies regularly for security
-- =====================================================

