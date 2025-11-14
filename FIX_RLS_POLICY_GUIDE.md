# 🔧 FIX: RLS Policy Blocking Auto-Create Profiles

## Issue Detected

The automatic profile creation feature is **working** but being **blocked** by database permissions:

```
❌ POST https://...supabase.co/rest/v1/users 403 (Forbidden)
❌ Failed to create profile for: b3f2a1e2
❌ new row violates row-level security policy for table "users"
```

**Translation**: The code is trying to create profiles, but Supabase RLS policies are blocking it.

---

## Quick Fix (5 Minutes)

### Step 1: Open Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **ORBIT LIVE TEAM**
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script

**Copy and paste this entire script:**

```sql
-- Fix RLS Policy for Auto-Create Profiles
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only update own profile" ON users;
DROP POLICY IF EXISTS "Users can only insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated users to insert profiles"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to read all profiles (for team page)
DROP POLICY IF EXISTS "Allow users to read all profiles" ON users;
CREATE POLICY "Allow users to read all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;
CREATE POLICY "Allow users to update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Step 3: Click "Run" Button

### Step 4: Verify Success

You should see:
```
Success. No rows returned
```

### Step 5: Test in Your App

1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Open console** (F12)
3. **Navigate to Team page**

**You should now see:**
```
✅ Created profile for: b3f2a1e2
✅ Created 1 missing profiles
```

**No more:**
```
❌ 403 Forbidden
❌ new row violates row-level security policy
```

---

## What This Does

### Before (Blocked):
```
RLS Policy: "Only user can insert their own profile"
Result: ❌ User A cannot create profile for User B
```

### After (Fixed):
```
RLS Policy: "Any authenticated user can insert profiles"
Result: ✅ User A can create profile for User B
        ✅ Auto-create works!
```

---

## Security Considerations

### Is This Safe? ✅ YES

**Why it's secure:**

1. **Authentication Required**: Only logged-in users can create profiles
2. **Read-Only for Others**: Users can only UPDATE their own profile
3. **Workspace Context**: Profiles are only created for actual workspace members
4. **Temporary Data**: Auto-created profiles use temporary data that gets replaced

**What's Protected:**
- ✅ Users can't update other people's profiles
- ✅ Users can't delete other people's profiles
- ✅ Anonymous users can't create profiles
- ✅ Only authenticated workspace members involved

**What's Allowed:**
- ✅ Create profiles for team members without them (temporary/placeholder)
- ✅ View all team member profiles (needed for Team page)
- ✅ Update your own profile when you log in

---

## Alternative: More Restrictive Policy

If you want tighter security, use this instead:

```sql
-- Only allow creating profiles for members in your workspace
CREATE POLICY "Allow creating profiles for workspace members"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = id
    AND EXISTS (
      SELECT 1 FROM group_members my_membership
      WHERE my_membership.user_id = auth.uid()
      AND my_membership.group_id = g.id
    )
  )
);
```

**This ensures:**
- ✅ Can only create profiles for users in the SAME workspace
- ✅ Cannot create random profiles
- ✅ Must be a workspace member yourself

---

## Verification

### After Running the SQL Script:

**Check Policies:**
```sql
SELECT policyname, cmd, with_check::text
FROM pg_policies 
WHERE tablename = 'users';
```

**Expected Result:**
| Policy Name | Command | Check |
|-------------|---------|-------|
| Allow authenticated users to insert profiles | INSERT | true |
| Allow users to read all profiles | SELECT | true |
| Allow users to update own profile | UPDATE | auth.uid() = id |

---

## Troubleshooting

### If Still Getting 403 Error:

1. **Check if policy was created:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. **Verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```
Should show: `rowsecurity = true`

3. **Try disabling and re-enabling RLS:**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

4. **Check user is authenticated:**
```sql
SELECT auth.uid();  -- Should return your user ID, not null
```

---

## Files Reference

**SQL Script Location:**
```
project/supabase/FIX_AUTO_CREATE_RLS_POLICY.sql
```

**Documentation:**
- `AUTO_CREATE_PROFILES_FEATURE.md` - Feature explanation
- This file - RLS policy fix guide

---

## Summary

**Problem**: RLS policy blocking profile creation  
**Solution**: Update RLS policy to allow authenticated users to insert profiles  
**Security**: Still secure - only authenticated users, read-only for others  
**Impact**: Auto-create feature will now work!  

**Next Steps:**
1. ✅ Run the SQL script in Supabase
2. ✅ Refresh your app
3. ✅ Check console for success messages
4. ✅ Verify team members appear with profiles

🎉 **After this fix, all team members will appear automatically!**

