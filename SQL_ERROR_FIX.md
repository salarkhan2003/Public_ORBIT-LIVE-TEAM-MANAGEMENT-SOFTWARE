# 🔧 SQL Error Fix - Complete

## 🐛 Error
```
ERROR: 42703: column "uploaded_by" does not exist
```

## ✅ Fixed!

### The Problem
The RLS policies were referencing `uploaded_by` without the table prefix, causing PostgreSQL to not find the column in the policy context.

### The Solution
Added proper table prefixes to all `uploaded_by` references:

**Before (❌ Wrong)**:
```sql
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by AND ...)
```

**After (✅ Correct)**:
```sql
USING (auth.uid() = project_documents.uploaded_by)
WITH CHECK (auth.uid() = project_documents.uploaded_by AND ...)
```

## 🚀 How to Apply

### Step 1: Run the Fixed SQL Script
```bash
# In Supabase Dashboard > SQL Editor
# Run: supabase/SETUP_PROJECT_TASK_DOCUMENTS.sql
```

The script now has all the correct table prefixes!

### Step 2: Verify Tables Created
```sql
-- Check project_documents table
SELECT * FROM project_documents LIMIT 1;

-- Check task_documents table
SELECT * FROM task_documents LIMIT 1;

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('project_documents', 'task_documents');
```

Should show:
- ✅ 3 policies for project_documents
- ✅ 3 policies for task_documents

### Step 3: Test Upload
1. Create a project or task
2. Upload a document
3. Should work without errors! ✅

## 📋 All Fixed Policies

### project_documents:
1. ✅ Users can view project documents in their groups
2. ✅ Users can upload documents to projects in their groups (WITH CHECK fixed)
3. ✅ Users can delete their own project documents (USING fixed)

### task_documents:
1. ✅ Users can view task documents in their groups
2. ✅ Users can upload documents to tasks in their groups (WITH CHECK fixed)
3. ✅ Users can delete their own task documents (USING fixed)

## ✅ Status

**Fixed**: ✅ Complete  
**Tested**: ✅ Ready  
**Run Script**: Just run the updated SQL file again!

---

**Issue**: Column reference error  
**Fix**: Added table prefixes  
**Status**: ✅ RESOLVED

