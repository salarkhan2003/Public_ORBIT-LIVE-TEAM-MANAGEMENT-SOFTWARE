# 📋 QUICK FIX CHECKLIST - Documents Error

## ❌ Error: `null value in column "name" of relation "documents" violates not-null constraint`

## ⚠️ IMPORTANT: Migration Script Updated!

**If you already ran the migration script before, you need to run it again!**

The script has been updated to fix the "name" column NOT NULL constraint issue.

## ✅ Solution: Run 2 Scripts

---

### ☐ STEP 1: Create Storage Bucket (30 sec)
**Location:** Supabase Dashboard → Storage → New bucket
- Name: `documents`
- Privacy: **Private** ⚠️
- Click: Create

---

### ☐ STEP 2: Run Migration (2 min)
**Location:** Supabase SQL Editor

**File:** `project/supabase/MIGRATE_DOCUMENTS_TABLE.sql`

**Action:**
1. Copy entire file content
2. Paste in SQL Editor
3. Click RUN ▶
4. Wait for success message

---

### ☐ STEP 3: Run Storage Setup (1 min)
**Location:** Supabase SQL Editor

**File:** `project/supabase/SETUP_DOCUMENTS_STORAGE.sql`

**Action:**
1. Copy entire file content
2. Paste in SQL Editor (new query)
3. Click RUN ▶
4. Wait for success message

---

### ☐ STEP 4: Verify (30 sec)
**Location:** Supabase SQL Editor

**Run this:**
```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'documents' AND column_name = 'folder') as has_folder,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'documents') as policies,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'documents') as bucket
;
```

**Expected:** has_folder=1, policies=4, bucket=1

---

### ☐ STEP 5: Test Upload (1 min)
**Location:** Your Application

**Action:**
1. Open app
2. Go to Documents page
3. Click Upload
4. Select file
5. Upload

**Expected:** ✅ Success!

---

## 📁 Files You Need

1. `supabase/MIGRATE_DOCUMENTS_TABLE.sql` - **Run first**
2. `supabase/SETUP_DOCUMENTS_STORAGE.sql` - **Run second**

## 📖 Full Docs

- `DOCUMENTS_MIGRATION_GUIDE.md` - Detailed guide
- `ACTION_ITEMS_DOCUMENTS_FIX.md` - Action items
- `SQL_ERROR_RESOLUTION_COMPLETE.md` - Error history

---

## ⏱️ Total Time: 5 minutes

---

## ✅ Done?

Check off each step above. When all are checked, your Documents feature will be working perfectly!

---

**Status:** Ready to execute
**Risk:** None (safe migration)
**Data:** Preserved and migrated
**Rollback:** Not needed (but possible)

---

**GO!** 🚀

