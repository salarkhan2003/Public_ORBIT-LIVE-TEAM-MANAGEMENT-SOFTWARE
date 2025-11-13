import { useState, useEffect } from 'react';
import { X, Upload, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useGroup } from '../../hooks/useGroup';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface DocType {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  group_id: string;
  uploaded_by: string;
}

interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocType | null;
  onSuccess: () => void;
}

export function DocumentEditModal({ isOpen, onClose, document, onSuccess }: DocumentEditModalProps): JSX.Element | null {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { currentGroup } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setDescription(document.description || '');
      setReplaceFile(null);
      setUploadProgress(0);
    }
  }, [document]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setReplaceFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Document title is required');
      return;
    }

    if (!document || !currentGroup || !user) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      let newFilePath = document.file_path;
      let newFileSize = document.file_size;
      let newFileType = document.file_type;
      let newFileName = document.file_name;

      // If replacing file, upload new one and delete old one
      if (replaceFile) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${replaceFile.name}`;
        const filePath = `${user.id}/${currentGroup.id}/${fileName}`;

        // Upload new file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, replaceFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;
        setUploadProgress(50);

        // Delete old file
        await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        newFilePath = uploadData.path;
        newFileSize = replaceFile.size;
        newFileType = replaceFile.type || 'application/octet-stream';
        newFileName = replaceFile.name;
        setUploadProgress(75);
      }

      // Update document metadata
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          file_name: newFileName,
          file_path: newFilePath,
          file_size: newFileSize,
          file_type: newFileType,
        })
        .eq('id', document.id);

      if (updateError) throw updateError;
      setUploadProgress(100);

      toast.success('Document updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current File Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Current File: {document.file_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(document.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Replace File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Replace File (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {replaceFile ? replaceFile.name : 'Choose new file (Max 50MB)'}
                </span>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
              </label>
              {replaceFile && (
                <button
                  type="button"
                  onClick={() => setReplaceFile(null)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {replaceFile && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                New file size: {(replaceFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

