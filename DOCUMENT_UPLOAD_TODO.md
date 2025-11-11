# 📄 DOCUMENT UPLOAD FIX - NEXT STEPS

**Status**: ⏳ **TO BE IMPLEMENTED**

---

## 🎯 Issue

Currently, the Documents page cannot upload files. Need to integrate Supabase Storage.

---

## ✅ Solution Required

### 1. Setup Supabase Storage Bucket
```sql
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Set up RLS policies
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view their team documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

### 2. Update Documents.tsx

**Add File Upload Function**:
```typescript
const handleFileUpload = async (file: File) => {
  try {
    // Upload to Supabase Storage
    const fileName = `${currentGroup.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save metadata to database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        group_id: currentGroup.id,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Document uploaded successfully!');
    fetchDocuments(); // Refresh list
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload document');
  }
};
```

**Add File Download Function**:
```typescript
const handleFileDownload = async (document: any) => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (error) throw error;

    // Create download link
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = document.title;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download document');
  }
};
```

### 3. Add File Input UI
```tsx
<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }}
  className="hidden"
  id="file-upload"
/>
<label
  htmlFor="file-upload"
  className="px-6 py-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700"
>
  Upload Document
</label>
```

---

## 📋 Implementation Steps

1. ✅ Team features complete (all democratic features)
2. ⏳ **Next**: Setup Supabase Storage bucket
3. ⏳ Add upload/download functions to Documents.tsx
4. ⏳ Add file input UI
5. ⏳ Test file uploads
6. ⏳ Test file downloads
7. ⏳ Add file preview (optional)

---

## 🎯 Expected Result

After implementation:
- Users can upload any file type
- Files stored in Supabase Storage
- Metadata saved to database
- Download files anytime
- Files organized by workspace
- Size limits enforced
- Progress indicators

---

## ⚠️ Note

The document upload feature requires Supabase Storage configuration which should be done in the Supabase dashboard or via SQL migrations.

**Current Status**: Team features ✅ COMPLETE, Document upload ⏳ PENDING

---

See Documents.tsx for current implementation that needs the upload functionality added.

