# 🚀 QUICK START - Documents Feature Setup

## ⚡ Fast Track (5 Minutes)

### Step 1: Create Storage Bucket (30 seconds)
1. Open your Supabase project dashboard
2. Go to **Storage** (left sidebar)
3. Click **New bucket**
4. Enter name: `documents`
5. Toggle **Private** (NOT public)
6. Click **Create**

### Step 2: Run SQL Script (2 minutes)
1. Go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open file: `project/supabase/SETUP_DOCUMENTS.sql` (in your code editor)
4. Copy **ALL** the content (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **RUN** button (▶)
7. Wait for "Success" message

### Step 3: Verify (1 minute)
Run this quick check:
```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'documents') as table_created,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'documents') as policies_created,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'documents') as bucket_exists;
```

Expected result:
- table_created: 1 ✅
- policies_created: 4 ✅
- bucket_exists: 1 ✅

### Step 4: Test in App (1 minute)
1. Open your application
2. Login
3. Go to Documents page
4. Upload a test file
5. Should work! 🎉

---

## ❌ Common Issues & Quick Fixes

### Issue: "relation 'groups' does not exist"
**Fix:** Run your main database setup first (CREATE_ALL_TABLES.sql or SETUP_DATABASE.sql)

### Issue: "bucket 'documents' does not exist"
**Fix:** Create the storage bucket first (see Step 1)

### Issue: Policy already exists
**Fix:** The script handles this automatically with DROP POLICY IF EXISTS

### Issue: Upload fails in app
**Fix:** Check that:
- Storage bucket is created and set to Private
- RLS policies are active (run verification query)
- User is logged in and part of a group

---

## 📋 What Gets Created

- ✅ `documents` table (stores file metadata)
- ✅ `document_folders` table (for organization)
- ✅ `document_shares` table (for sharing)
- ✅ `document_stats` view (for analytics)
- ✅ 4 RLS policies on documents table
- ✅ 4 Storage policies on documents bucket
- ✅ 2 Helper functions (increment_download_count, update_updated_at)
- ✅ 1 Trigger (auto-update timestamps)
- ✅ 6 Indexes (for performance)

---

## 🔐 Security Built-in

- Users can only see documents from their groups
- Users can only upload to groups they're members of
- Users can only edit/delete their own documents
- Admins/Owners can delete any document in their groups
- Storage is private with policy-based access

---

## 📝 Need More Details?

See `DOCUMENTS_SQL_FIXED.md` for:
- Full documentation
- Troubleshooting steps
- Database schema details
- Security explanations

---

**Status:** ✅ Ready to use - No more SQL errors!

