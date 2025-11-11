import { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Download, Trash2, FileText, Image, Video, Archive, File, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  group_id: string;
  uploaded_by: string;
  folder: string;
  download_count: number;
  created_at: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { currentGroup } = useGroup();
  const { user } = useAuth();

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!currentGroup) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          uploader:uploaded_by(id, name, avatar)
        `)
        .eq('group_id', currentGroup.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [currentGroup]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setUploadTitle(file.name);
      setShowUploadModal(true);
    }
  };

  // Upload file to Supabase Storage
  const handleUpload = async () => {
    if (!selectedFile || !currentGroup || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = `${user.id}/${currentGroup.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Save metadata to database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          title: uploadTitle || selectedFile.name,
          description: uploadDescription,
          file_name: selectedFile.name,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          group_id: currentGroup.id,
          uploaded_by: user.id,
          folder: 'root',
        })
        .select(`
          *,
          uploader:uploaded_by(id, name, avatar)
        `)
        .single();

      if (docError) throw docError;

      setUploadProgress(100);

      // Update local state
      setDocuments(prev => [docData, ...prev]);

      toast.success('Document uploaded successfully!');

      // Reset form
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadProgress(0);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  // Download file
  const handleDownload = async (document: Document) => {
    try {
      // Download file from storage
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Increment download count
      await supabase.rpc('increment_download_count', {
        document_id: document.id
      });

      // Update local state
      setDocuments(prev => prev.map(doc =>
        doc.id === document.id
          ? { ...doc, download_count: doc.download_count + 1 }
          : doc
      ));

      toast.success('Document downloaded!');
    } catch (error: unknown) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  // Delete file
  const handleDelete = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));

      toast.success('Document deleted successfully!');
    } catch (error: unknown) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-8 h-8 text-orange-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.file_type.startsWith(typeFilter);
    return matchesSearch && matchesType;
  });


  // Calculate stats
  const stats = {
    total: documents.length,
    totalSize: documents.reduce((acc, doc) => acc + doc.file_size, 0),
    images: documents.filter(doc => doc.file_type.startsWith('image/')).length,
    videos: documents.filter(doc => doc.file_type.startsWith('video/')).length,
    pdfs: documents.filter(doc => doc.file_type.includes('pdf')).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Documents 📁</h1>
              <p className="text-white/90 text-lg">
                {stats.total} files • {formatFileSize(stats.totalSize)} total
              </p>
            </div>

            <label htmlFor="file-upload">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-purple-50 transition-all shadow-xl font-bold text-lg cursor-pointer"
              >
                <Upload className="w-6 h-6" />
                <span>Upload Document</span>
              </motion.div>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </label>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm">Images</p>
              <p className="text-2xl font-bold text-white">{stats.images}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm">Videos</p>
              <p className="text-2xl font-bold text-white">{stats.videos}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm">PDFs</p>
              <p className="text-2xl font-bold text-white">{stats.pdfs}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm">Storage</p>
              <p className="text-2xl font-bold text-white">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>

        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="application/pdf">PDFs</option>
            <option value="application">Documents</option>
          </select>
        </div>
      </motion.div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No documents found</h3>
          <p className="text-gray-600 dark:text-gray-400">Upload your first document to get started!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  {getFileIcon(document.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {document.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {document.file_name}
                  </p>
                </div>
              </div>

              {document.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Size: {formatFileSize(document.file_size)}</span>
                  <span>Downloads: {document.download_count}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <img
                    src={document.uploader?.avatar || `https://ui-avatars.com/api/?name=${document.uploader?.name}&background=random`}
                    alt={document.uploader?.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{document.uploader?.name}</span>
                  <span>•</span>
                  <span>{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleDownload(document)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all font-semibold shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>

                {(document.uploaded_by === user?.id) && (
                  <motion.button
                    onClick={() => handleDelete(document)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-xl transition-all shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Document</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadTitle('');
                  setUploadDescription('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Document title..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Add a description..."
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="font-semibold text-purple-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadTitle('');
                    setUploadDescription('');
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadTitle.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

