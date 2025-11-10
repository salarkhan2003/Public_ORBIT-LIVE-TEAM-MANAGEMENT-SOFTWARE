import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Users, Target, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Project, User } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { currentGroup, groupMembers } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (currentGroup) {
      fetchProjects();
      
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
        subscription.unsubscribe();
      };
    }
  }, [currentGroup]);

  const fetchProjects = async () => {
    if (!currentGroup) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:created_by(id, name, avatar)
        `)
        .eq('group_id', currentGroup.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

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
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track team projects
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
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
            
            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                ></div>
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
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
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

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={fetchProjects}
          groupMembers={groupMembers}
          currentGroup={currentGroup}
        />
      )}
    </div>
  );
}

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
  groupMembers: any[];
  currentGroup: any;
}

function CreateProjectModal({ onClose, onProjectCreated, groupMembers, currentGroup }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    team_members: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent' | 'emergency',
    status: 'active' as Project['status']
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentGroup) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          group_id: currentGroup.id,
          created_by: user.id,
          deadline: formData.deadline || null,
          progress: 0,
          team_members: formData.team_members
        });

      if (error) throw error;
      
      toast.success('Project created successfully');
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.includes(memberId)
        ? prev.team_members.filter(id => id !== memberId)
        : [...prev.team_members, memberId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-600 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Create New Project
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'medium', 'high', 'urgent', 'emergency'] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.priority === priority
                          ? getPriorityColor(priority)
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Team Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Assign Team Members
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                {groupMembers.map((member) => (
                  <div
                    key={member.user_id}
                    onClick={() => toggleTeamMember(member.user_id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.team_members.includes(member.user_id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.team_members.includes(member.user_id)}
                      onChange={() => toggleTeamMember(member.user_id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <img
                      src={member.users?.avatar || `https://ui-avatars.com/api/?name=${member.users?.name}&background=3B82F6&color=fff`}
                      alt={member.users?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.users?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.users?.title || member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.team_members.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {formData.team_members.length} team member{formData.team_members.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}