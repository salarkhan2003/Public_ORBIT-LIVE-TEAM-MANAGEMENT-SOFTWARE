# 🔧 CALENDAR ERRORS - COMPLETE FIX

## Errors Fixed:

### 1. ❌ "column action_url of relation notifications does not exist"
### 2. ❌ "Could not find the table 'public.events' in the schema cache"

### ✅ ALL FIXED!

---

## 🚨 ROOT CAUSE

**The events table hasn't been created yet!**

You need to run the SQL setup script to create the calendar database tables.

---

## 🚀 COMPLETE FIX (3 Steps)

### Step 1: Open Supabase SQL Editor

**Go to:** https://supabase.com/dashboard/project/iclnquvhushnvjzzcjrs/sql/new

### Step 2: Copy & Run SQL Script

1. Open file: `supabase/SETUP_CALENDAR_EVENTS.sql`
2. Copy **ALL** content (Ctrl+A, Ctrl+C)
3. Paste into SQL Editor
4. Click **RUN** button
5. Wait for success message ✅

**What this creates:**
- `events` table with all fields
- RLS policies for security
- Notification triggers (fixed without action_url)
- Indexes for performance

### Step 3: Restart Dev Server

```bash
npm run dev
```

---

## ✅ Verification

After running the script, you should see in Supabase:

**Table Editor → Events table with columns:**
- id
- group_id
- created_by
- title
- description
- start_time
- end_time
- location
- all_day
- color
- priority
- status
- assignees
- project_id
- recurrence
- reminder
- created_at
- updated_at

---

## 🧪 Test After Fix

1. Refresh browser (F5)
2. Go to Calendar page
3. Should see empty calendar (not error!) ✅
4. Click any date to create event
5. Fill in details and save
6. Event appears on calendar! 🎉

---

## 🔍 What Was Fixed

### Issue 1: action_url Error

**Before (causing error):**
```sql
PERFORM create_notification(
  v_assignee,
  'Event title',
  'Message',
  'info',
  '/calendar'  -- This parameter doesn't exist!
);
```

**After (fixed):**
```sql
INSERT INTO public.notifications (user_id, title, message, type, read)
VALUES (
  v_assignee,
  'Event title',
  'Message',
  'info',
  false
);
```

### Issue 2: Table Not Found

**Solution:** Run the SQL script to create the table!

The calendar page now shows helpful setup instructions if the table doesn't exist.

---

## 🐛 Troubleshooting

### Still getting "table does not exist" error?

**Check:**
1. ✅ SQL script ran without errors
2. ✅ Check Supabase → Table Editor → Look for "events" table
3. ✅ Dev server restarted
4. ✅ Browser cache cleared (Ctrl+Shift+Delete)

**Debug in Supabase:**
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'events';

-- If table exists, check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'events';
```

### SQL script fails to run?

**Common issues:**
1. **create_notification function doesn't exist**
   - Solution: First run `SETUP_NOTIFICATIONS.sql` script
   - Or: Remove notification triggers temporarily

2. **groups table doesn't exist**
   - Solution: Make sure workspace setup is complete
   - Check for `groups` and `group_members` tables

3. **Syntax error**
   - Solution: Copy the ENTIRE script (don't copy partially)
   - Make sure no characters are missing

---

## 📋 Complete Setup Order

If you're setting up from scratch:

1. **Auth Setup** (users table)
2. **Workspace Setup** (groups, group_members)
3. **Notifications Setup** (notifications table) ← Run this first!
4. **Calendar Setup** (events table) ← Then run this!

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ No error messages on calendar page
2. ✅ Can click dates to open event modal
3. ✅ Can create events
4. ✅ Events appear on calendar
5. ✅ Can drag and drop events
6. ✅ Can switch between views (Month, Week, Day, List)
7. ✅ Events save to database
8. ✅ Real-time sync works

---

## 🎯 Quick Commands

**Check if events table exists:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'events'
);
```

**Count events in database:**
```sql
SELECT COUNT(*) FROM events;
```

**View all events:**
```sql
SELECT id, title, start_time, created_at FROM events ORDER BY start_time DESC LIMIT 10;
```

---

## 📞 Still Having Issues?

**Email:** orbitlive.info@gmail.com  
**Phone:** +91 7993547438

**Include:**
- Screenshot of error
- Screenshot of Supabase table list
- SQL script output/error message
- Browser console logs (F12)

---

## 🎉 Summary

**Problem:** Events table doesn't exist + notification error  
**Solution:** Run `SETUP_CALENDAR_EVENTS.sql` script  
**Result:** Calendar works perfectly! ✅

**Just run the SQL script and you're done!** 🚀📅

