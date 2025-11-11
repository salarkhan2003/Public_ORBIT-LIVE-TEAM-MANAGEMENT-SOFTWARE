-- ============================================
-- DOCUMENTS STORAGE AND SUPPORTING TABLES
-- ============================================
-- Run this AFTER running MIGRATE_DOCUMENTS_TABLE.sql
-- This sets up storage policies and optional supporting tables
-- ============================================

-- Step 1: Storage bucket policies
-- ============================================
-- Note: Storage bucket needs to be created via Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Create a new bucket named 'documents'
-- 3. Set it as private (not public)
-- 4. Then run this script

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can view documents from their groups" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents to their groups" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents in storage" ON storage.objects;

-- Create storage policies for the documents bucket
CREATE POLICY "Users can view documents from their groups"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.user_id = auth.uid()
    AND group_members.group_id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can upload documents to their groups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents in storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 2: Create folders table (optional, for organization)
-- ============================================
CREATE TABLE IF NOT EXISTS document_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folders_group_id ON document_folders(group_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON document_folders(parent_folder_id);

-- Enable RLS on folders
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;

-- Drop existing folder policies
DROP POLICY IF EXISTS "Users can view folders from their groups" ON document_folders;
DROP POLICY IF EXISTS "Users can create folders in their groups" ON document_folders;

-- Create folder policies
CREATE POLICY "Users can view folders from their groups"
ON document_folders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = document_folders.group_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create folders in their groups"
ON document_folders FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = document_folders.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Step 3: Create document sharing table (optional)
-- ============================================
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_download BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_document ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_shares_user ON document_shares(shared_with_user_id);

-- Step 4: Grant necessary permissions
-- ============================================
GRANT ALL ON document_folders TO authenticated;
GRANT ALL ON document_shares TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('documents', 'document_folders', 'document_shares')
ORDER BY table_name;

-- Check storage policies
SELECT policyname
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%documents%';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Storage policies and supporting tables created successfully!';
  RAISE NOTICE 'Remember to create the storage bucket named "documents" in Supabase Dashboard.';
END $$;

