import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Calendar, User, Flag, FileText, Upload, Download, Trash2, File, CheckCircle, PlayCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useGroup } from '../../hooks/useGroup';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Task } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess: () => void;
}

export function TaskModal({ isOpen, onClose, task, onSuccess }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; url: string; size: number }>>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string; avatar?: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentGroup } = useGroup();
  const { user } = useAuth();

  const fetchMembers = useCallback(async () => {
    if (!currentGroup) return;

    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, users(id, name, email, avatar)')
      .eq('group_id', currentGroup.id);

    if (!error && data) {
      const membersList: Array<{ id: string; name: string; email: string; avatar?: string }> = [];
      data.forEach(m => {
        if (m.users && typeof m.users === 'object' && !Array.isArray(m.users)) {
          const user = m.users as { id: string; name: string; email: string; avatar?: string };
          membersList.push(user);
        }
      });
      setMembers(membersList);
    }
  }, [currentGroup]);

  const fetchProjects = useCallback(async () => {
    if (!currentGroup) return;

    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .eq('group_id', currentGroup.id)
      .eq('status', 'active');

    if (!error && data) {
      setProjects(data);
    }
  }, [currentGroup]);

  useEffect(() => {
    if (isOpen && currentGroup) {
      fetchMembers();
      fetchProjects();
    }
    
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDeadline(task.deadline || '');
      setAssignedTo(task.assigned_to || '');
      setProjectId(task.project_id || '');
      // Load existing documents for editing
      fetchTaskDocuments(task.id);
    } else {
      resetForm();
    }
  }, [isOpen, task, currentGroup, fetchMembers, fetchProjects]);

  const fetchTaskDocuments = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_documents')
        .select('*')
        .eq('task_id', taskId);

      if (!error && data) {
        setDocuments(data.map(doc => ({
          id: doc.id,
          name: doc.file_name,
          url: doc.file_url,
          size: doc.file_size || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDeadline('');
    setAssignedTo('');
    setProjectId('');
    setDocuments([]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentGroup) return;

    if (file.size > 10485760) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingDoc(true);
    toast.loading('Uploading document...', { id: 'doc-upload' });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `task-docs/${currentGroup.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setDocuments(prev => [...prev, {
        id: Date.now().toString(),
        name: file.name,
        url: publicUrl,
        size: file.size
      }]);

      toast.success('Document uploaded!', { id: 'doc-upload' });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document', { id: 'doc-upload' });
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadDoc = async (doc: { name: string; url: string }) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download document');
    }
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.success('Document removed');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!currentGroup || !user) return;

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        deadline: deadline || null,
        assigned_to: assignedTo || null,
        project_id: projectId || null,
        group_id: currentGroup.id,
        created_by: user.id,
      };

      let taskId = task?.id;

      if (task) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id);

        if (error) throw error;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) throw error;
        taskId = data.id;
      }

      // Save documents if any
      if (documents.length > 0 && taskId) {
        const docRecords = documents.map(doc => ({
          task_id: taskId,
          file_name: doc.name,
          file_url: doc.url,
          file_size: doc.size,
          uploaded_by: user.id,
        }));

        // Delete old documents if editing
        if (task) {
          await supabase
            .from('task_documents')
            .delete()
            .eq('task_id', taskId);
        }

        const { error: docError } = await supabase
          .from('task_documents')
          .insert(docRecords);

        if (docError) console.error('Error saving documents:', docError);
      }

      toast.success(task ? 'Task updated successfully!' : 'Task created successfully!');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Stylish Header */}
          <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {task ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {task ? 'Update task details' : 'Add a new task to your project'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="started">🚀 Started</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="need_time">⏰ Need Time</option>
                  <option value="completed">✅ Completed</option>
                  <option value="todo">📋 To Do</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Flag className="w-4 h-4 mr-2" />
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
            </div>

            {/* Deadline and Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Assign To (Optional)
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">👤 Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="">🎯 No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border-2 border-green-200 dark:border-gray-500">
              <label className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-4">
                <Upload className="w-5 h-5 mr-2" />
                Task Documents (Optional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploadingDoc ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                PDF, DOC, XLS, PPT, Images • Max 10MB
              </p>

              {/* Uploaded Documents List */}
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{task ? 'Update Task' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

