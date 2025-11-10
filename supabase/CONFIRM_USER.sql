-- =============================================
-- DISABLE EMAIL CONFIRMATION (Development Mode)
-- =============================================
-- This allows users to sign up and login immediately
-- without email verification
-- Run this in Supabase SQL Editor
-- =============================================

-- This setting needs to be changed in Supabase Dashboard UI
-- But we can verify the current setup

SELECT
    '⚠️ EMAIL CONFIRMATION IS ENABLED' as notice,
    'You need to disable it in Supabase Dashboard' as action,
    'Go to: Authentication > Settings > Email Auth' as location;

-- Meanwhile, let's confirm the user manually
DO $$
DECLARE
    user_email TEXT := 'psalarkhan22@gmail.com';
BEGIN
    -- Mark the user as confirmed in auth.users
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE email = user_email
    AND email_confirmed_at IS NULL;

    IF FOUND THEN
        RAISE NOTICE '✅ User % has been confirmed manually!', user_email;
    ELSE
        RAISE NOTICE 'ℹ️ User % was already confirmed or not found', user_email;
    END IF;
END $$;

-- Verify the user is now confirmed
SELECT
    '✅ USER CONFIRMED!' as status,
    email,
    email_confirmed_at,
    confirmed_at,
    'You can now login!' as message
FROM auth.users
WHERE email = 'psalarkhan22@gmail.com';
