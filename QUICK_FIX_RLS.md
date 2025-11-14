# ⚡ QUICK FIX - RLS Policy Issue

## The Error You're Seeing

```
❌ 403 (Forbidden)
❌ new row violates row-level security policy for table "users"
❌ Failed to create profile for: b3f2a1e2
```

---

## The Fix (Copy & Paste)

### 1️⃣ Open Supabase SQL Editor

Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **SQL Editor**

### 2️⃣ Paste This Script

```sql
-- Fix RLS for Auto-Create Profiles
DROP POLICY IF EXISTS "Users can only insert own profile" ON users;

CREATE POLICY "Allow authenticated users to insert profiles"
ON users FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to read all profiles"
ON users FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow users to update own profile"
ON users FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 3️⃣ Click "RUN"

### 4️⃣ Refresh Your App

**Press**: `Ctrl + Shift + R`

---

## What You'll See After Fix

### Before (Blocked):
```
❌ 403 Forbidden
❌ Failed to create profile
⚠️ Could not create profiles
```

### After (Working):
```
✅ Created profile for: b3f2a1e2
✅ Created 1 missing profiles
✅ Team member appears with info
```

---

## Why This Happened

**Your RLS policy was too restrictive:**
- Old: "Users can ONLY insert their OWN profile"
- Problem: Can't create profiles for other team members

**New policy:**
- New: "Authenticated users can insert profiles"
- Solution: Can create placeholder profiles for team members

**Still Secure:**
- ✅ Must be logged in
- ✅ Can only update YOUR OWN profile
- ✅ Cannot delete profiles

---

## That's It!

Run the SQL → Refresh browser → Auto-create works! 🎉

**Full Guide**: See `FIX_RLS_POLICY_GUIDE.md` for detailed explanation

