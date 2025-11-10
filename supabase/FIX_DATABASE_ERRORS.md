# Fix Database Errors - Setup Instructions

## Problem
Your application is showing these errors:
- ❌ Failed to create project: Unknown error
- ❌ Failed to load documents
- ❌ Failed to create conversation
- ❌ Failed to update profile

## Cause
The required database tables don't exist yet in your Supabase database.

## Solution
Run the SQL migration script to create all required tables.

---

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. In the left sidebar, click **SQL Editor**

### 2. Run the Migration Script
1. Click **"+ New Query"** button
2. Open the file: `supabase/CREATE_ALL_TABLES.sql`
3. Copy ALL the contents of that file
4. Paste it into the SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

### 3. Verify Success
You should see a success message that says:
```
All tables created successfully!
Tables created: projects, tasks, file_uploads, meetings, ai_conversations, user_settings, activity_logs
```

### 4. Test Your Application
1. Refresh your application in the browser
2. Try creating a project - it should work now! ✅
3. Try uploading documents - it should work! ✅
4. Try using AI Assistant - it should work! ✅
5. Try updating your profile - it should work! ✅

---

## What This Script Creates

The migration creates these tables:

1. **projects** - For managing team projects
2. **tasks** - For task management
3. **file_uploads** - For document storage
4. **meetings** - For calendar and meetings
5. **ai_conversations** - For AI assistant chat history
6. **user_settings** - For user preferences
7. **activity_logs** - For tracking user actions

All tables include:
- ✅ Proper permissions (RLS policies)
- ✅ Relationships between tables
- ✅ Indexes for fast queries
- ✅ Automatic timestamps
- ✅ Data validation

---

## If You See Any Errors

If you get an error about missing tables (like `groups` or `users`), you need to run the other setup scripts first:

1. First run: `supabase/SETUP_DATABASE.sql`
2. Then run: `supabase/CREATE_ALL_TABLES.sql`

---

## Need Help?

If you encounter any issues:
1. Check the Supabase SQL Editor for error messages
2. Make sure you're logged into the correct Supabase project
3. Verify that the `groups` and `users` tables exist first
4. Check that you have admin permissions on your Supabase project

After running this script, ALL the errors in your application should be fixed! 🎉

