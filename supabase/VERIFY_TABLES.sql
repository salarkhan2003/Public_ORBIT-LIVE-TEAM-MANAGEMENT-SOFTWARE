-- Quick verification script
-- Run this to confirm all tables were created successfully

SELECT
  table_name,
  CASE
    WHEN table_name IN ('projects', 'tasks', 'file_uploads', 'meetings', 'ai_conversations', 'user_settings', 'activity_logs')
    THEN '✅ Created'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('projects', 'tasks', 'file_uploads', 'meetings', 'ai_conversations', 'user_settings', 'activity_logs')
ORDER BY table_name;

-- If you see 7 rows with ✅ Created, everything is working!

