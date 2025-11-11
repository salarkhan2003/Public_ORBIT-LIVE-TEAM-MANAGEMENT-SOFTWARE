-- ============================================
-- DOCUMENT MANAGEMENT SETUP FOR SUPABASE
-- ============================================
-- This script sets up the complete document management system
-- including storage buckets, tables, RLS policies, and functions.
-- ============================================

-- Step 1: Enable UUID extension if not already enabled
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create the documents table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder TEXT DEFAULT 'general',
  download_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_group_id ON documents(group_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);

-- Step 3: Storage bucket policies
-- ============================================
-- Note: Storage bucket needs to be created via Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Create a new bucket named 'documents'
-- 3. Set it as private (not public)
-- 4. The policies below will handle access control

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

-- Step 4: Enable Row Level Security on documents table
-- ============================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view documents from their groups" ON documents;
DROP POLICY IF EXISTS "Users can upload documents to their groups" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete documents they uploaded or if admin" ON documents;

-- Create RLS policies for documents table
CREATE POLICY "Users can view documents from their groups"
ON documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = documents.group_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their groups"
ON documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = documents.group_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete documents they uploaded or if admin"
ON documents FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = documents.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role IN ('admin', 'owner')
  )
);

-- Step 5: Create function to update download count
-- ============================================
CREATE OR REPLACE FUNCTION increment_download_count(document_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE documents
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create view for document statistics
-- ============================================
CREATE OR REPLACE VIEW document_stats AS
SELECT
  group_id,
  COUNT(*) as total_documents,
  SUM(file_size) as total_storage_used,
  AVG(file_size) as avg_file_size,
  SUM(download_count) as total_downloads,
  COUNT(DISTINCT uploaded_by) as unique_uploaders,
  MAX(created_at) as last_upload_date
FROM documents
WHERE is_archived = false
GROUP BY group_id;

-- Step 8: Create folders table (optional, for organization)
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

-- Step 9: Create document sharing table (optional)
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

-- Step 10: Grant necessary permissions
-- ============================================
GRANT ALL ON documents TO authenticated;
GRANT ALL ON document_folders TO authenticated;
GRANT ALL ON document_shares TO authenticated;
GRANT SELECT ON document_stats TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify setup
-- ============================================

-- Check if documents table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'documents'
) as documents_table_exists;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('documents', 'document_folders');

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================
-- 1. Create the 'documents' storage bucket in Supabase Dashboard
-- 2. Run this SQL script in the SQL Editor
-- 3. Verify all tables and policies were created successfully
-- 4. Test document upload/download functionality
-- ============================================

