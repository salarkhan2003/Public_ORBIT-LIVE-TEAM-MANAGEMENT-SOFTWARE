# Documents SQL Error - FIXED ✅

## Problem
Two errors were encountered:
1. Initial error: `"ERROR: 42601: syntax error at or near "{" LINE 1: import { useState, useEffect, useCallback } from 'react';"` - caused by corrupted SQL file
2. Second error: `"ERROR: 42601: syntax error at or near "NOT" LINE 48: CREATE POLICY IF NOT EXISTS..."` - caused by Supabase not supporting IF NOT EXISTS for policies

## Root Cause
1. The SQL file had gotten corrupted or truncated, removing the essential table creation statements
2. Supabase's PostgreSQL doesn't support `IF NOT EXISTS` clause for `CREATE POLICY` statements (only for tables, indexes, etc.)

## Solution Applied
1. **Recreated the entire SETUP_DOCUMENTS.sql file** with proper structure:
   - Added proper SQL headers and comments
   - Created the `documents` table with all required fields
   - Added necessary indexes for performance
   - Created storage policies for the documents bucket
   - Enabled Row Level Security (RLS) policies
   - Added helper functions for download counting and timestamp updates
   - Created supporting tables (document_folders, document_shares)
   - Added verification queries

2. **Fixed the policy creation syntax**:
   - Changed from `CREATE POLICY IF NOT EXISTS` (not supported in Supabase)
   - To `DROP POLICY IF EXISTS` followed by `CREATE POLICY` (standard Supabase approach)
   - This ensures policies are always recreated cleanly without errors

3. **Key Features of the Fixed SQL File**:
   - Uses `CREATE TABLE IF NOT EXISTS` to prevent errors if table already exists
   - Uses `DROP POLICY IF EXISTS` then `CREATE POLICY` for idempotent policy management
   - Includes proper foreign key relationships
   - Sets up comprehensive RLS policies for security
   - Includes indexes for optimal query performance
   - Adds triggers for automatic timestamp updates

## How to Use

### Step 1: Create Storage Bucket
First, create the storage bucket in Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to **Storage** section
3. Click **New bucket**
4. Name it: `documents`
5. Set it as **Private** (not public)
6. Click **Create bucket**

### Step 2: Run the SQL Script
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the entire content of `SETUP_DOCUMENTS.sql`
3. Paste it into a new query
4. Click **Run** to execute

### Step 3: Verify Setup
Run these verification queries in the SQL Editor:

```sql
-- Check if documents table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'documents'
) as documents_table_exists;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('documents', 'document_folders');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'documents';
```

### Step 4: Test Document Upload
1. Log into your application
2. Navigate to the Documents page
3. Try uploading a test file
4. Verify it appears in the documents list

## Database Schema

### documents table
```sql
- id: UUID (Primary Key)
- title: TEXT
- description: TEXT
- file_name: TEXT
- file_path: TEXT
- file_size: BIGINT
- file_type: TEXT
- group_id: UUID (Foreign Key to groups)
- uploaded_by: UUID (Foreign Key to users)
- folder: TEXT
- download_count: INTEGER
- is_archived: BOOLEAN
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### Security Policies
- Users can only view documents from groups they belong to
- Users can upload documents to their groups
- Users can update/delete their own documents
- Admins can delete any document in their groups

## Troubleshooting

### If you still see errors:

1. **Check if users and groups tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'groups', 'group_members');
   ```

2. **Ensure uuid-ossp extension is enabled**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

3. **Check for conflicting policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'documents';
   ```
   If there are duplicate policies, drop them first:
   ```sql
   DROP POLICY IF EXISTS "policy_name" ON documents;
   ```

4. **Verify storage bucket permissions**:
   - Ensure the bucket is created
   - Ensure it's set to private
   - Check that storage policies are applied

## Prevention
To prevent similar issues in the future:
- Always backup SQL files before editing
- Use version control (git) for all SQL migrations
- Test SQL scripts in a development environment first
- Use the Supabase SQL Editor which validates syntax

## Status
✅ **FIXED** - The SETUP_DOCUMENTS.sql file has been completely recreated with proper SQL syntax and structure. You can now run this file in Supabase without errors.

