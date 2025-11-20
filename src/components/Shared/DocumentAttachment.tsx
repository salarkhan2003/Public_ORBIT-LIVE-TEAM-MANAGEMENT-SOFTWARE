import { useState, useEffect } from 'react';
import { Upload, X, FileText, Download, Trash2, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useGroup } from '../../hooks/useGroup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AttachedDocument {
  id: string;
  document_id: string;
  documents: {
    id: string;
    title: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    created_at: string;
  };
}

interface DocumentAttachmentProps {
  entityType: 'task' | 'project';
  entityId: string;
  canEdit?: boolean;
}

export function DocumentAttachment({ entityType, entityId, canEdit = true }: DocumentAttachmentProps) {
  const [attachments, setAttachments] = useState<AttachedDocument[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<Array<{id: string; title: string; file_name: string; file_type: string; file_size: number; created_at: string}>>([]);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocId, setSelectedDocId] = useState('');

  const { user } = useAuth();
  const { currentGroup } = useGroup();

  useEffect(() => {
    fetchAttachments();
    if (showAttachModal) {
      fetchAvailableDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, showAttachModal]);

  const fetchAttachments = async () => {
    const tableName = entityType === 'task' ? 'task_documents' : 'project_documents';
    const columnName = entityType === 'task' ? 'task_id' : 'project_id';

    const { data, error } = await supabase
      .from(tableName)
      .select(`
        id,
        document_id,
        documents (
          id,
          title,
          file_name,
          file_path,
          file_size,
          file_type,
          created_at
        )
      `)
      .eq(columnName, entityId);

    if (!error && data) {
      setAttachments(data);
    }
  };

  const fetchAvailableDocuments = async () => {
    if (!currentGroup) return;

    const { data, error } = await supabase
      .from('documents')
      .select('id, title, file_name, file_type, file_size, created_at')
      .eq('group_id', currentGroup.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAvailableDocuments(data);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setUploadTitle(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentGroup || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = `${user.id}/${currentGroup.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;
      setUploadProgress(50);

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          title: uploadTitle.trim() || selectedFile.name,
          file_name: selectedFile.name,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          group_id: currentGroup.id,
          uploaded_by: user.id,
          is_archived: false,
        })
        .select()
        .single();

      if (docError) throw docError;
      setUploadProgress(75);

      await attachDocument(docData.id);
      setUploadProgress(100);

      toast.success('Document uploaded and attached!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      fetchAttachments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const attachDocument = async (documentId: string) => {
    const tableName = entityType === 'task' ? 'task_documents' : 'project_documents';
    const columnName = entityType === 'task' ? 'task_id' : 'project_id';

    const { error } = await supabase
      .from(tableName)
      .insert({
        [columnName]: entityId,
        document_id: documentId,
      });

    if (error) throw error;
  };

  const handleAttachExisting = async () => {
    if (!selectedDocId) {
      toast.error('Please select a document');
      return;
    }

    try {
      await attachDocument(selectedDocId);
      toast.success('Document attached successfully!');
      setShowAttachModal(false);
      setSelectedDocId('');
      fetchAttachments();
    } catch (error) {
      console.error('Attach error:', error);
      toast.error('Failed to attach document');
    }
  };

  const handleDownload = async (doc: AttachedDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.documents.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.documents.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Document downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDetach = async (attachmentId: string) => {
    if (!confirm('Remove this document attachment?')) return;

    const tableName = entityType === 'task' ? 'task_documents' : 'project_documents';

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
      toast.success('Document detached');
      fetchAttachments();
    } catch (error) {
      console.error('Detach error:', error);
      toast.error('Failed to detach document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Attachments ({attachments.length})
        </h3>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAttachModal(true)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Attach Existing
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Upload New
            </button>
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No documents attached</p>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.documents.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.documents.file_size)} • {format(new Date(attachment.documents.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDetach(attachment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attach Existing Document Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Attach Existing Document
              </h3>
              <button
                onClick={() => setShowAttachModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a document...</option>
                {availableDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({formatFileSize(doc.file_size)})
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAttachModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAttachExisting}
                  disabled={!selectedDocId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Attach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload & Attach Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                disabled={uploading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload (Max 50MB)
                  </span>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                  />
                </label>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Document title"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setSelectedFile(null);
                      }}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || !uploadTitle.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload & Attach'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
