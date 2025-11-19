import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Calendar, Users, Target, Edit, Trash2, Eye, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Project, GroupMember, User } from '../types';
import { useGroup } from '../hooks/useGroup';
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';
import { ProjectModal } from '../components/Projects/ProjectModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Extended Project type with creator relation
interface ProjectWithCreator extends Project {
  creator?: User;
}

export function Projects() {
  const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { currentGroup, groupMembers } = useGroup();

  const fetchProjects = useCallback(async () => {
    if (!currentGroup) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:created_by(id, name, avatar)
        `)
        .eq('group_id', currentGroup.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        return;
      }
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentGroup]);

  useEffect(() => {
    if (currentGroup) {
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      fetchProjects().finally(() => clearTimeout(timeout));
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('projects-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'projects',
            filter: `group_id=eq.${currentGroup.id}`
          }, 
          () => {
            fetchProjects();
          }
        )
        .subscribe();

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }
  }, [currentGroup, fetchProjects]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'started':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'need_time':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const updateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      ));
      
      toast.success('Project status updated');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const updateProjectProgress = async (projectId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ progress: newProgress })
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, progress: newProgress } : project
      ));
      
      toast.success('Progress updated');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setDeletingProject(null);
      toast.success('Project deleted');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingAnimation variant="pulse" size="md" text="Loading Projects..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white truncate">Projects 🎯</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
            Manage and track {projects.length} team projects
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center space-x-1.5 sm:space-x-2 hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg font-semibold text-sm sm:text-base whitespace-nowrap flex-shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>New Project</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 sm:px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        >
          <option value="all">All Status</option>
          <option value="started">🚀 Started</option>
          <option value="in_progress">⚡ In Progress</option>
          <option value="need_time">⏰ Need Time</option>
          <option value="completed">✅ Completed</option>
          <option value="active">🟢 Active</option>
          <option value="on_hold">⏸️ On Hold</option>
        </select>
      </div>

      {/* Projects Grid with Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>
                <span className={`px-3 py-1 text-xs rounded-full font-bold ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Project</span>
                  </button>
                  <button
                    onClick={() => updateProjectStatus(project.id, project.status === 'active' ? 'on_hold' : 'active')}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {project.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    <span>{project.status === 'active' ? 'Pause' : 'Resume'}</span>
                  </button>
                  <button
                    onClick={() => updateProjectStatus(project.id, 'completed')}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </button>
                  <button
                    onClick={() => setDeletingProject(project)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
            
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {project.description}
              </p>
            )}
            
            {/* Team Members */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex -space-x-2">
                {project.team_members?.slice(0, 3).map((memberId, index) => {
                  const member = groupMembers.find(m => m.user_id === memberId);
                  return member?.users ? (
                    <img
                      key={index}
                      src={member.users.avatar || `https://ui-avatars.com/api/?name=${member.users.name}&background=3B82F6&color=fff`}
                      alt={member.users.name}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      title={member.users.name}
                    />
                  ) : null;
                })}
                {project.team_members && project.team_members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      +{project.team_members.length - 3}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{project.team_members?.length || 0}</span>
              </div>
            </div>
            
            {/* Enhanced Progress with Controls */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateProjectProgress(project.id, Math.max(0, project.progress - 10))}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                  >
                    -
                  </button>
                  <span className="text-gray-900 dark:text-white font-bold min-w-[3rem] text-center">{project.progress}%</span>
                  <button
                    onClick={() => updateProjectProgress(project.id, Math.min(100, project.progress + 10))}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`}
                ></motion.div>
              </div>
            </div>

            {/* Deadline */}
            {project.deadline && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Due {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewingProject(project)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => setEditingProject(project)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </motion.div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Project?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{deletingProject.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeletingProject(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProject(deletingProject.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <ProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectModal
          isOpen={true}
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={fetchProjects}
        />
      )}

      {/* View Project Modal */}
      {viewingProject && (
        <ViewProjectModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          groupMembers={groupMembers}
        />
      )}
    </div>
  );
}


interface ViewProjectModalProps {
  project: ProjectWithCreator;
  onClose: () => void;
  groupMembers: GroupMember[];
}

function ViewProjectModal({ project, onClose, groupMembers }: ViewProjectModalProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'started':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'need_time':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <span className={`px-3 py-1 text-xs rounded-full font-bold ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                {project.description}
              </p>
            </div>
          )}

          {/* Team Members */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Team Members ({project.team_members?.length || 0})
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {project.team_members?.map((memberId, index) => {
                const member = groupMembers.find(m => m.user_id === memberId);
                return member?.users ? (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <img
                      src={member.users.avatar || `https://ui-avatars.com/api/?name=${member.users.name}&background=3B82F6&color=fff`}
                      alt={member.users.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.users.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.users?.title || 'Team Member'}
                      </p>
                    </div>
                  </div>
                ) : null;
              })}
              {(!project.team_members || project.team_members.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No team members assigned</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Progress
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-4 rounded-full transition-all ${getProgressColor(project.progress)}`}
                ></motion.div>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[3rem]">
                {project.progress}%
              </span>
            </div>
          </div>

          {/* Deadline */}
          {project.deadline && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Deadline
              </h3>
              <div className="flex items-center space-x-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{format(new Date(project.deadline), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
          )}

          {/* Created By */}
          {project.creator && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Created By
              </h3>
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                <img
                  src={project.creator.avatar || `https://ui-avatars.com/api/?name=${project.creator.name}&background=3B82F6&color=fff`}
                  alt={project.creator.name}
                  className="w-10 h-10 rounded-full"
                />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.creator.name}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
