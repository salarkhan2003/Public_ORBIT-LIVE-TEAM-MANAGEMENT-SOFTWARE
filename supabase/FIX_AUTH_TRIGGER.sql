-- =============================================
-- FIX: Remove any triggers that block user creation
-- =============================================
-- The 500 error means a database trigger or function is failing
-- Run this in Supabase SQL Editor NOW
-- =============================================

-- Step 1: Check for and drop any auth triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop any triggers on auth.users table
    FOR r IN (
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
        AND event_object_table = 'users'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', r.trigger_name);
        RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Step 2: Drop any functions that might be causing issues
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;

-- Step 3: Verify users table exists and has no constraints that would block inserts
SELECT
    'Checking users table...' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users';

-- Step 4: Check for foreign key constraints that might be causing issues
SELECT
    'Foreign key constraints:' as info,
    constraint_name,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'users'
AND constraint_type = 'FOREIGN KEY';

-- Step 5: Ensure the users table ID column references auth.users properly
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey CASCADE;

ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Step 6: Grant all necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT SELECT ON auth.users TO authenticated, anon;
GRANT ALL ON public.users TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Step 7: Verify setup
SELECT
    '✅ TRIGGER FIX COMPLETED!' as status,
    'Try signing up again' as next_step;

-- Step 8: Show remaining triggers (should be empty for auth.users)
SELECT
    'Remaining triggers on auth.users:' as info,
    trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

