import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2, PlayCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { useGroup } from '../hooks/useGroup';
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { TaskModal } from '../components/Tasks/TaskModal';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { currentGroup } = useGroup();

  const fetchTasks = useCallback(async () => {
    if (!currentGroup) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(id, name, avatar),
          creator:created_by(id, name, avatar),
          projects(name)
        `)
        .eq('group_id', currentGroup.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
        setLoading(false);
        return;
      }
      setTasks(data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentGroup]);

  useEffect(() => {
    if (currentGroup) {
      fetchTasks();
    }
  }, [currentGroup, fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        toast.error('Failed to update task');
        return;
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success('Task status updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
        return;
      }

      setTasks(prev => prev.filter(t => t.id !== taskId));
      setDeletingTask(null);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'started':
        return <PlayCircle className="w-4 h-4 text-purple-600" />;
      case 'need_time':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'todo':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingAnimation variant="dots" size="md" text="Loading Tasks..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Ultra-Modern Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2 tracking-tight flex items-center space-x-2 sm:space-x-3"
            >
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0" />
              <span className="truncate">Task Manager</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 text-white/90 text-xs sm:text-sm md:text-base lg:text-lg font-medium"
            >
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-300 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="whitespace-nowrap">{tasks.length} Total</span>
              </div>
              <div className="w-0.5 h-4 sm:h-5 md:h-6 bg-white/30 hidden sm:block"></div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-300 flex-shrink-0" />
                <span className="font-bold whitespace-nowrap">{tasks.filter(t => t.status === 'done' || t.status === 'completed').length} Complete</span>
              </div>
              <div className="w-0.5 h-4 sm:h-5 md:h-6 bg-white/30 hidden sm:block"></div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-300 flex-shrink-0" />
                <span className="whitespace-nowrap">{tasks.filter(t => t.status === 'in_progress' || t.status === 'started').length} Active</span>
              </div>
            </motion.div>
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-green-600 rounded-xl sm:rounded-2xl hover:bg-green-50 transition-all shadow-xl font-bold text-sm sm:text-base md:text-lg whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span>New Task</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Filters with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.select
              whileHover={{ scale: 1.02 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium flex-1 sm:min-w-[150px] transition-all text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="todo">📋 To Do</option>
              <option value="started">🚀 Started</option>
              <option value="in_progress">⚡ In Progress</option>
              <option value="need_time">⏰ Need Time</option>
              <option value="completed">✅ Completed</option>
              <option value="done">✅ Done</option>
            </motion.select>

            <motion.select
              whileHover={{ scale: 1.02 }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium flex-1 sm:min-w-[150px] transition-all text-sm sm:text-base"
            >
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </motion.select>
          </div>
        </div>
      </motion.div>

      {/* Tasks List with Ultra-Modern Cards */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-600 dark:text-gray-400">Create your first task to get started!</p>
          </motion.div>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="relative group bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 transition-all overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Enhanced Status Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`mt-1 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shadow-md ${
                      task.status === 'done'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    {task.status === 'done' && <CheckCircle className="w-5 h-5 text-white" />}
                  </motion.button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className={`text-xl font-black ${
                        task.status === 'done'
                          ? 'line-through text-gray-400 dark:text-gray-600'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 text-xs rounded-xl font-bold shadow-sm ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority.toUpperCase()}
                      </motion.span>
                      <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                        {getStatusIcon(task.status)}
                      </motion.div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {task.assignee && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg"
                        >
                          <img
                            src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${task.assignee.name}&background=3B82F6&color=fff`}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700"/>
                          <span className="font-medium">{task.assignee.name}</span>
                        </motion.div>
                      )}
                      {task.deadline && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg"
                        >
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                        </motion.div>
                      )}
                      {task.projects && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg"
                        >
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">📁 {task.projects.name}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingTask(task)}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>

                  {task.status !== 'in_progress' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"
                    >
                      <PlayCircle className="w-5 h-5" />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeletingTask(task)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={showCreateModal || editingTask !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSuccess={fetchTasks}
      />

      {deletingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Task</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{deletingTask.title}"?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeletingTask(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTask(deletingTask.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
