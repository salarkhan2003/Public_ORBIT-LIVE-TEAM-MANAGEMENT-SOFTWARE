-- =====================================================
-- COMPLETE FIX FOR AUTHENTICATION & WORKSPACE ISSUES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Fix Users table RLS policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow public user creation during signup" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to INSERT their profile during signup (CRITICAL FIX)
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Fix Groups table RLS policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON groups;

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view groups (needed for join code)
CREATE POLICY "Anyone can view groups"
ON groups FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = group_owner_id);

-- Allow group owners to update their groups
CREATE POLICY "Group owners can update their groups"
ON groups FOR UPDATE
TO authenticated
USING (auth.uid() = group_owner_id);

-- 3. Fix Group Members table RLS policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Allow users to view members of their groups
CREATE POLICY "Users can view group members"
ON group_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Allow users to join groups
CREATE POLICY "Users can join groups"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to remove themselves from groups
CREATE POLICY "Users can leave groups"
ON group_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 4. Ensure users table has correct structure
-- =====================================================
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();

-- Make sure email is unique
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- 5. Create trigger to auto-create user profile on signup (OPTIONAL BACKUP)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Fix any orphaned auth users without profiles
-- =====================================================
INSERT INTO users (id, email, name, role, title, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'developer',
  'Team Member',
  au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Grant necessary permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON groups TO authenticated;
GRANT ALL ON group_members TO authenticated;

-- 8. Create index for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_join_code ON groups(join_code);

-- 9. Verify the fixes
-- =====================================================
SELECT
  'Users table' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'users' AND privilege_type = 'SELECT') as has_select_privilege
FROM users
UNION ALL
SELECT
  'Groups table' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'groups' AND privilege_type = 'SELECT') as has_select_privilege
FROM groups
UNION ALL
SELECT
  'Group Members table' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.table_privileges
   WHERE table_name = 'group_members' AND privilege_type = 'SELECT') as has_select_privilege
FROM group_members;

-- =====================================================
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run the script
-- 4. Check the verification results at the bottom
-- 5. Test authentication and workspace features
-- =====================================================

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ All authentication and workspace fixes applied successfully!';
  RAISE NOTICE '✅ You can now test:';
  RAISE NOTICE '   1. Google OAuth login';
  RAISE NOTICE '   2. Email/password signup';
  RAISE NOTICE '   3. Workspace persistence after logout';
  RAISE NOTICE '   4. User profile creation';
END $$;

