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
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setUploadTitle(file.name);
      setShowUploadModal(true);
    }
  };

  // Upload file
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
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setUploadProgress(50);

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          title: uploadTitle.trim() || selectedFile.name,
          description: uploadDescription.trim() || null,
          file_name: selectedFile.name,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          group_id: currentGroup.id,
          uploaded_by: user.id,
          is_archived: false,
          download_count: 0,
        })
        .select(`
          *,
          uploader:uploaded_by(id, name, avatar)
        `)
        .single();

      if (docError) throw docError;
      setUploadProgress(100);

      setDocuments(prev => [docData, ...prev]);
      toast.success('Document uploaded successfully!');

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
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await supabase.rpc('increment_download_count', {
        document_id: document.id
      });

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
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast.success('Document deleted successfully!');
    } catch (error: unknown) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  // Get file icon
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-dark-base via-dark-elevated to-dark-base">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neon-blue/30 border-t-neon-blue"></div>
          <div className="absolute inset-0 rounded-full bg-neon-blue/20 blur-xl animate-pulse-glow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-base via-light-elevated to-light-base dark:from-dark-base dark:via-dark-elevated dark:to-dark-base transition-colors duration-300">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="cinematic-card p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neon-blue/20 to-neon-magenta/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-neon-orange/20 to-neon-cyan/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
                  >
                    Documents
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-600 dark:text-gray-300 flex items-center gap-3"
                  >
                    <span className="font-semibold text-neon-blue">{stats.total} files</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-neon-magenta">{formatFileSize(stats.totalSize)}</span>
                  </motion.p>
                </div>

                <motion.label
                  htmlFor="file-upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-cyan text-white rounded-2xl font-semibold shadow-glow transition-all">
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                  />
                </motion.label>
              </div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
              >
                {[
                  { label: 'Images', value: stats.images, icon: '🖼️', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Videos', value: stats.videos, icon: '🎥', color: 'from-purple-500 to-pink-500' },
                  { label: 'PDFs', value: stats.pdfs, icon: '📄', color: 'from-orange-500 to-red-500' },
                  { label: 'Storage', value: formatFileSize(stats.totalSize), icon: '💾', color: 'from-green-500 to-emerald-500' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="glass-card p-4 md:p-6 rounded-2xl group hover:shadow-glow transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                    <p className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all font-medium backdrop-blur-sm"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent font-medium min-w-[150px] backdrop-blur-sm"
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center py-24 cinematic-card rounded-3xl"
          >
            <div className="relative inline-block">
              <Upload className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-2xl animate-pulse-glow"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No documents found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Upload your first document to get started</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document, index) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/0 to-neon-magenta/0 group-hover:from-neon-blue/10 group-hover:to-neon-magenta/10 rounded-3xl blur-xl transition-all duration-500"></div>

                <div className="relative cinematic-card p-6 rounded-3xl h-full flex flex-col hover:shadow-glow-lg transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/0 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">
                      {getFileIcon(document.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-neon-blue transition-colors">
                        {document.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {document.file_name}
                      </p>
                    </div>
                  </div>

                  {document.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
                      {document.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-4 pt-4 border-t border-gray-200/50 dark:border-dark-border/50">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        {formatFileSize(document.file_size)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {document.download_count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <img
                        src={document.uploader?.avatar || `https://ui-avatars.com/api/?name=${document.uploader?.name}&background=random`}
                        alt={document.uploader?.name}
                        className="w-6 h-6 rounded-full ring-2 ring-white/50 dark:ring-dark-border"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{document.uploader?.name}</span>
                      <span className="text-gray-400">•</span>
                      <span>{format(new Date(document.created_at), 'MMM dd')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleDownload(document)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-neon-blue to-neon-cyan text-white hover:shadow-glow rounded-xl transition-all font-semibold text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </motion.button>

                    {(document.uploaded_by === user?.id) && (
                      <motion.button
                        onClick={() => handleDelete(document)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 bg-gradient-to-r from-red-500/90 to-pink-500/90 hover:from-red-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-sm hover:shadow-glow-pink"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => {
              if (!uploading) {
                setShowUploadModal(false);
                setSelectedFile(null);
                setUploadTitle('');
                setUploadDescription('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="cinematic-card max-w-lg w-full p-8 rounded-3xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Upload Document</h2>
                <button
                  onClick={() => {
                    if (!uploading) {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                      setUploadTitle('');
                      setUploadDescription('');
                    }
                  }}
                  disabled={uploading}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="relative p-5 glass-card rounded-2xl border-2 border-neon-blue/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-magenta/5"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 bg-white/10 dark:bg-black/20 rounded-xl">
                      {getFileIcon(selectedFile.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all font-medium backdrop-blur-sm"
                    placeholder="Enter document title..."
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all font-medium resize-none backdrop-blur-sm"
                    placeholder="Add a description..."
                    disabled={uploading}
                  />
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                      <span className="text-neon-blue">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-magenta rounded-full"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                      setUploadTitle('');
                      setUploadDescription('');
                    }}
                    disabled={uploading}
                    className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-all font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !uploadTitle.trim()}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-neon-blue to-neon-cyan text-white rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

