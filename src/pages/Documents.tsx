import React, { useState, useEffect } from 'react';
import { Upload, Search, Filter, Download, Eye, Trash2, FileText, Image, Video, Archive, Plus, FolderOpen, File, Tag } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabase';
import { FileUpload, Project, Task } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function Documents() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { currentGroup } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (currentGroup) {
      fetchFiles();
      fetchProjects();
      fetchTasks();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('documents-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'file_uploads',
            filter: `group_id=eq.${currentGroup.id}`
          }, 
          () => {
            fetchFiles();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentGroup]);

  const fetchFiles = async () => {
    if (!currentGroup) return;

    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select(`
          *,
          uploader:uploaded_by(id, name, avatar),
          project:project_id(id, name)
        `)
        .eq('group_id', currentGroup.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!currentGroup) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('group_id', currentGroup.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    if (!currentGroup) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('group_id', currentGroup.id);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user || !currentGroup) return;

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            filename: fileName,
            original_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
            group_id: currentGroup.id,
            category: getCategoryFromMimeType(file.type),
            is_public: false,
            tags: []
          });

        if (dbError) {
          console.error('Database error:', dbError);
          // Try to delete the uploaded file if database insert fails
          await supabase.storage.from('documents').remove([filePath]);
          throw new Error(`Failed to save ${file.name} metadata: ${dbError.message}`);
        }
      }

      toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const getCategoryFromMimeType = (mimeType: string): FileUpload['category'] => {
    if (mimeType.startsWith('image/')) return 'media';
    if (mimeType.startsWith('video/')) return 'media';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'documentation';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'other';
    return 'other';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (file: FileUpload) => {
    try {
      const { data: downloadData, error } = await supabase.storage
        .from('documents')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(downloadData);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteFile = async (file: FileUpload) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    const matchesProject = projectFilter === 'all' || file.project_id === projectFilter;
    
    return matchesSearch && matchesCategory && matchesProject;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize team documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Quick Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Quick Upload'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Maximum file size: 50MB
        </p>
        {uploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="design">Design</option>
          <option value="development">Development</option>
          <option value="documentation">Documentation</option>
          <option value="media">Media</option>
          <option value="other">Other</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                  {getFileIcon(file.mime_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.original_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => downloadFile(file)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                {file.uploaded_by === user?.id && (
                  <button
                    onClick={() => deleteFile(file)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Category</span>
                <span className="capitalize">{file.category}</span>
              </div>
              
              {file.project && (
                <div className="flex items-center justify-between">
                  <span>Project</span>
                  <span>{file.project.name}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span>Uploaded by</span>
                <div className="flex items-center space-x-1">
                  <img
                    src={file.uploader?.avatar || `https://ui-avatars.com/api/?name=${file.uploader?.name}&background=3B82F6&color=fff&size=16`}
                    alt={file.uploader?.name}
                    className="w-4 h-4 rounded-full"
                  />
                  <span>{file.uploader?.name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Date</span>
                <span>{format(new Date(file.created_at), 'MMM dd, yyyy')}</span>
              </div>
            </div>

            {file.tags && file.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded flex items-center space-x-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {file.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      +{file.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredFiles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all' || projectFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload your first document to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onFileUploaded={fetchFiles}
          projects={projects}
          tasks={tasks}
          currentGroup={currentGroup}
        />
      )}
    </div>
  );
}

interface UploadModalProps {
  onClose: () => void;
  onFileUploaded: () => void;
  projects: Project[];
  tasks: Task[];
  currentGroup: any;
}

function UploadModal({ onClose, onFileUploaded, projects, tasks, currentGroup }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    category: 'other' as FileUpload['category'],
    description: '',
    tags: [] as string[],
    is_public: false
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => setFiles(acceptedFiles),
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    if (!user || !currentGroup || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            filename: fileName,
            original_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
            group_id: currentGroup.id,
            project_id: formData.project_id || null,
            category: formData.category,
            tags: formData.tags,
            is_public: formData.is_public,
          });

        if (dbError) {
          console.error('Database error:', dbError);
          // Try to delete the uploaded file if database insert fails
          await supabase.storage.from('documents').remove([filePath]);
          throw new Error(`Failed to save ${file.name} metadata: ${dbError.message}`);
        }
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
      onFileUploaded();
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Upload Documents
          </h2>
          
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select'}
            </p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                    </div>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to Project (Optional)
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FileUpload['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="documentation">Documentation</option>
                  <option value="media">Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe what this document is about..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Public Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                Make this document publicly accessible to all team members
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}