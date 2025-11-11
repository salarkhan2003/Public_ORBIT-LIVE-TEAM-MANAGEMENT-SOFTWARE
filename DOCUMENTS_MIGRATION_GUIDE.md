# 🔧 DOCUMENTS TABLE MIGRATION GUIDE

## Your Situation

You already have a `documents` table created by `SETUP_DATABASE.sql`, but it's missing columns needed by the Documents.tsx component.

**Existing Schema:**
- `id`, `group_id`, `project_id`, `name`, `file_url`, `file_type`, `file_size`, `uploaded_by`, `created_at`

**Required Schema:**
- `id`, `group_id`, `title`, `description`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_by`, `folder`, `download_count`, `is_archived`, `created_at`, `updated_at`

## Solution: Migration Approach

We'll **ADD the missing columns** to your existing table instead of recreating it.

---

## Step-by-Step Instructions

### 1️⃣ Create Storage Bucket (30 seconds)
1. Open Supabase Dashboard
2. Go to **Storage** (left sidebar)
3. Click **New bucket**
4. Name: `documents`
5. Set to **Private** (not public)
6. Click **Create bucket**

### 2️⃣ Run Migration Script (2 minutes)

**Open Supabase SQL Editor and run this script:**

📁 **File:** `project/supabase/MIGRATE_DOCUMENTS_TABLE.sql`

This script will:
- ✅ Add missing columns (`title`, `description`, `file_name`, `file_path`, `folder`, `download_count`, `is_archived`, `updated_at`)
- ✅ Migrate data from old columns (`name` → `title`, `file_url` → `file_path`)
- ✅ Set default values for new columns
- ✅ Create indexes for performance
- ✅ Enable RLS and create policies
- ✅ Add helper functions and triggers

**To run:**
1. Copy entire content of `MIGRATE_DOCUMENTS_TABLE.sql`
2. Paste into Supabase SQL Editor
3. Click **RUN** ▶
4. Wait for success message

### 3️⃣ Run Storage Setup Script (1 minute)

**Still in SQL Editor, run the second script:**

📁 **File:** `project/supabase/SETUP_DOCUMENTS_STORAGE.sql`

This script will:
- ✅ Create storage policies for the documents bucket
- ✅ Create supporting tables (`document_folders`, `document_shares`)
- ✅ Set up permissions

**To run:**
1. Copy entire content of `SETUP_DOCUMENTS_STORAGE.sql`
2. Paste into SQL Editor (new query)
3. Click **RUN** ▶
4. Wait for success message

### 4️⃣ Verify Everything (1 minute)

Run these verification queries in SQL Editor:

```sql
-- 1. Check all required columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- 2. Check RLS policies (should see 4 policies)
SELECT policyname
FROM pg_policies
WHERE tablename = 'documents';

-- 3. Check storage bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'documents';

-- 4. Check supporting tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('documents', 'document_folders', 'document_shares')
ORDER BY table_name;
```

**Expected Results:**
- ✅ `documents` table has 15 columns including `folder`, `download_count`, `is_archived`
- ✅ 4 RLS policies on documents table
- ✅ 1 storage bucket named 'documents' (public = false)
- ✅ 3 tables exist

### 5️⃣ Test in Your App (1 minute)

1. Open your application
2. Log in
3. Navigate to **Documents** page
4. Try uploading a test file
5. Should work without errors! 🎉

---

## What Gets Migrated

### Existing Data Mapping
Your existing documents will be automatically migrated:

| Old Column | → | New Column |
|-----------|---|------------|
| `name` | → | `title` (same value) |
| `name` | → | `file_name` (same value) |
| `file_url` | → | `file_path` (same value) |

### New Columns Added
All existing documents will get these new fields:

- `description`: NULL (can be updated later)
- `folder`: 'general' (default)
- `download_count`: 0
- `is_archived`: false
- `updated_at`: same as created_at

---

## Troubleshooting

### Error: "relation 'group_members' does not exist"
**Solution:** Make sure your main database setup (groups, users, group_members tables) is complete first.

### Error: "permission denied for table documents"
**Solution:** The script includes GRANT statements. If still failing, check you're using the correct Supabase service role key.

### Error: "bucket 'documents' does not exist" (when uploading)
**Solution:** Create the storage bucket in Supabase Dashboard (Step 1).

### Upload Still Fails
Check these:
1. Storage bucket 'documents' exists and is **Private**
2. All verification queries pass
3. You're logged in to the app
4. You're a member of at least one group
5. Browser console for specific error messages

---

## File Summary

### Migration Scripts (Run in Order)
1. **MIGRATE_DOCUMENTS_TABLE.sql** - Updates existing table schema
2. **SETUP_DOCUMENTS_STORAGE.sql** - Adds storage policies and supporting tables

### Documentation
- **SQL_ERROR_RESOLUTION_COMPLETE.md** - Complete error history and fixes
- **DOCUMENTS_QUICK_START.md** - Original quick start (for fresh setup)
- **DOCUMENTS_SQL_FIXED.md** - Detailed technical documentation

### Original Script (Optional)
- **SETUP_DOCUMENTS.sql** - Complete fresh setup (only use if starting from scratch)

---

## Important Notes

⚠️ **Data Safety:** The migration script uses `ADD COLUMN IF NOT EXISTS` and updates, so it's **safe to run** even if some columns already exist.

⚠️ **Backup First:** If you have important data, consider backing up the documents table first:
```sql
CREATE TABLE documents_backup AS SELECT * FROM documents;
```

✅ **Idempotent:** All scripts are safe to run multiple times. They use `IF NOT EXISTS`, `DROP POLICY IF EXISTS`, etc.

---

## Status After Migration

✅ All required columns present
✅ RLS policies active
✅ Storage policies configured
✅ Helper functions ready
✅ Triggers active
✅ Indexes optimized
✅ **Ready for document uploads!**

---

**Need Help?** Check the verification queries above to diagnose issues, or review error messages in Supabase SQL Editor.

