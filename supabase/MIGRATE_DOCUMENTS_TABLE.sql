-- ============================================
-- DOCUMENTS TABLE MIGRATION
-- ============================================
-- This script updates the existing documents table to match
-- the schema required by the Documents.tsx component
-- ============================================

-- Step 1: Add missing columns to documents table
-- ============================================

-- Add title column (rename from name or add new)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT;

-- Update title from name if it exists and title is null
UPDATE documents SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- Add description column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description TEXT;

-- Add file_name column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Update file_name from name if it exists and file_name is null
UPDATE documents SET file_name = name WHERE file_name IS NULL AND name IS NOT NULL;

-- Add file_path column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update file_path from file_url if it exists and file_path is null
UPDATE documents SET file_path = file_url WHERE file_path IS NULL AND file_url IS NOT NULL;

-- Add folder column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'general';

-- Set default value for existing rows
UPDATE documents SET folder = 'general' WHERE folder IS NULL;

-- Add download_count column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Set default value for existing rows
UPDATE documents SET download_count = 0 WHERE download_count IS NULL;

-- Add is_archived column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Set default value for existing rows
UPDATE documents SET is_archived = false WHERE is_archived IS NULL;

-- Add updated_at column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set default value for existing rows
UPDATE documents SET updated_at = created_at WHERE updated_at IS NULL;

-- Step 2: Handle old columns (remove NOT NULL or drop them)
-- ============================================

-- Option A: Make old columns nullable (safer - keeps old data accessible)
ALTER TABLE documents ALTER COLUMN name DROP NOT NULL;
ALTER TABLE documents ALTER COLUMN file_url DROP NOT NULL;

-- Option B: Drop old columns entirely (uncomment if you want to clean up)
-- Note: Only do this after verifying all data is migrated to new columns
-- ALTER TABLE documents DROP COLUMN IF EXISTS name;
-- ALTER TABLE documents DROP COLUMN IF EXISTS file_url;
-- ALTER TABLE documents DROP COLUMN IF EXISTS project_id;

-- Step 3: Make new required columns NOT NULL (after populating)
-- ============================================

-- Make title NOT NULL
ALTER TABLE documents ALTER COLUMN title SET NOT NULL;

-- Make file_name NOT NULL
ALTER TABLE documents ALTER COLUMN file_name SET NOT NULL;

-- Make file_path NOT NULL
ALTER TABLE documents ALTER COLUMN file_path SET NOT NULL;

-- Make file_size NOT NULL (if it's not already)
ALTER TABLE documents ALTER COLUMN file_size SET NOT NULL;

-- Make file_type NOT NULL (if it's not already)
ALTER TABLE documents ALTER COLUMN file_type SET NOT NULL;

-- Step 4: Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_documents_group_id ON documents(group_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);

-- Step 5: Enable Row Level Security if not already enabled
-- ============================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to recreate them
-- ============================================
DROP POLICY IF EXISTS "Users can view documents from their groups" ON documents;
DROP POLICY IF EXISTS "Users can upload documents to their groups" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete documents they uploaded or if admin" ON documents;

-- Step 7: Create RLS policies for documents table
-- ============================================
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

-- Step 8: Create function to update download count
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

-- Step 9: Create function to update timestamp
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

-- Step 10: Create view for document statistics
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

-- Step 11: Grant necessary permissions
-- ============================================
GRANT ALL ON documents TO authenticated;
GRANT SELECT ON document_stats TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify migration
-- ============================================

-- Check all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'documents';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Documents table migration completed successfully!';
  RAISE NOTICE 'All required columns have been added.';
  RAISE NOTICE 'RLS policies have been created.';
  RAISE NOTICE 'Helper functions and triggers are ready.';
END $$;

