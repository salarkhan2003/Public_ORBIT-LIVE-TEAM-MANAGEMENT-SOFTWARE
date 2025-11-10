import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGroup } from './useGroup';
import { useAuth } from './useAuth';

interface DashboardStats {
  activeProjects: number;
  completedTasks: number;
  totalTasks: number;
  teamMembers: number;
  productivity: number;
  trends: {
    projects: number;
    tasks: number;
    members: number;
    productivity: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  time: string;
  icon: string;
  color: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'task' | 'project';
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    completedTasks: 0,
    totalTasks: 0,
    teamMembers: 0,
    productivity: 0,
    trends: { projects: 0, tasks: 0, members: 0, productivity: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentGroup, groupMembers } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (currentGroup && user) {
      fetchDashboardData();
      
      // Set up real-time subscriptions
      const subscriptions = setupRealtimeSubscriptions();
      
      return () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroup, user]);

  const fetchDashboardData = async () => {
    if (!currentGroup) return;

    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        projectsData,
        tasksData,
        activityData,
        deadlinesData
      ] = await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchRecentActivity(),
        fetchUpcomingDeadlines()
      ]);

      // Calculate stats
      const activeProjects = projectsData.filter(p => p.status === 'active').length;
      const completedTasks = tasksData.filter(t => t.status === 'done').length;
      const totalTasks = tasksData.length;
      const teamMembers = groupMembers.length;
      
      // Calculate productivity (tasks completed / total tasks * 100)
      const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate trends from historical data (last 30 days comparison)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch historical stats for trend calculation
      const { data: historicalTasks } = await supabase
        .from('tasks')
        .select('id, status, created_at')
        .eq('group_id', currentGroup!.id)
        .lt('created_at', thirtyDaysAgo.toISOString());

      const { data: historicalProjects } = await supabase
        .from('projects')
        .select('id, status, created_at')
        .eq('group_id', currentGroup!.id)
        .lt('created_at', thirtyDaysAgo.toISOString());

      const historicalActiveProjects = (historicalProjects || []).filter(p => p.status === 'active').length;
      const historicalCompletedTasks = (historicalTasks || []).filter(t => t.status === 'done').length;
      const historicalTotalTasks = (historicalTasks || []).length;
      const historicalProductivity = historicalTotalTasks > 0
        ? Math.round((historicalCompletedTasks / historicalTotalTasks) * 100)
        : 0;

      const trends = {
        projects: activeProjects - historicalActiveProjects,
        tasks: completedTasks - historicalCompletedTasks,
        members: 0, // Would need historical membership data
        productivity: productivity - historicalProductivity
      };

      setStats({
        activeProjects,
        completedTasks,
        totalTasks,
        teamMembers,
        productivity,
        trends
      });

      setRecentActivity(activityData);
      setUpcomingDeadlines(deadlinesData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('group_id', currentGroup!.id);
    
    if (error) throw error;
    return data || [];
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, name, avatar),
        projects(name)
      `)
      .eq('group_id', currentGroup!.id);
    
    if (error) throw error;
    return data || [];
  };

  const fetchRecentActivity = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:user_id(id, name, avatar)
      `)
      .eq('group_id', currentGroup!.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    
    return (data || []).map(activity => ({
      id: activity.id,
      type: activity.action,
      title: getActivityTitle(activity.action),
      description: activity.description,
      user: {
        name: activity.user?.name || 'Unknown User',
        avatar: activity.user?.avatar
      },
      time: formatTimeAgo(activity.created_at),
      icon: getActivityIcon(activity.action),
      color: getActivityColor(activity.action)
    }));
  };

  const fetchUpcomingDeadlines = async () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch tasks with deadlines
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, name, avatar),
        projects(name)
      `)
      .eq('group_id', currentGroup!.id)
      .not('deadline', 'is', null)
      .gte('deadline', now.toISOString())
      .lte('deadline', nextWeek.toISOString())
      .order('deadline', { ascending: true });

    if (tasksError) throw tasksError;

    // Fetch projects with deadlines
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('group_id', currentGroup!.id)
      .not('deadline', 'is', null)
      .gte('deadline', now.toISOString())
      .lte('deadline', nextWeek.toISOString())
      .order('deadline', { ascending: true });

    if (projectsError) throw projectsError;

    const deadlines: UpcomingDeadline[] = [];

    // Add task deadlines
    (tasksData || []).forEach(task => {
      deadlines.push({
        id: task.id,
        title: task.title,
        dueDate: task.deadline,
        priority: task.priority,
        type: 'task',
        assignee: task.assignee ? {
          name: task.assignee.name,
          avatar: task.assignee.avatar
        } : undefined
      });
    });

    // Add project deadlines
    (projectsData || []).forEach(project => {
      deadlines.push({
        id: project.id,
        title: project.name,
        dueDate: project.deadline,
        priority: 'medium', // Projects don't have priority, default to medium
        type: 'project'
      });
    });

    // Sort by deadline
    deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return deadlines.slice(0, 5); // Return top 5 upcoming deadlines
  };

  const setupRealtimeSubscriptions = () => {
    const subscriptions = [];

    // Subscribe to tasks changes
    try {
      const tasksSubscription = supabase
        .channel(`dashboard-tasks-${currentGroup!.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tasks',
            filter: `group_id=eq.${currentGroup!.id}`
          }, 
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      // Subscribe to projects changes
      const projectsSubscription = supabase
        .channel(`dashboard-projects-${currentGroup!.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'projects',
            filter: `group_id=eq.${currentGroup!.id}`
          }, 
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      // Subscribe to activity logs
      const activitySubscription = supabase
        .channel(`dashboard-activity-${currentGroup!.id}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'activity_logs',
            filter: `group_id=eq.${currentGroup!.id}`
          }, 
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      subscriptions.push(tasksSubscription, projectsSubscription, activitySubscription);
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }

    return subscriptions;
  };

  const getActivityTitle = (action: string) => {
    switch (action) {
      case 'task_created': return 'Task created';
      case 'task_updated': return 'Task updated';
      case 'task_completed': return 'Task completed';
      case 'project_created': return 'Project created';
      case 'project_updated': return 'Project updated';
      case 'document_uploaded': return 'Document uploaded';
      case 'meeting_scheduled': return 'Meeting scheduled';
      case 'user_joined': return 'User joined';
      case 'user_left': return 'User left';
      default: return 'Activity';
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'task_created': return 'Plus';
      case 'task_updated': return 'Edit';
      case 'task_completed': return 'CheckCircle';
      case 'project_created': return 'FolderPlus';
      case 'project_updated': return 'FolderEdit';
      case 'document_uploaded': return 'Upload';
      case 'meeting_scheduled': return 'Calendar';
      case 'user_joined': return 'UserPlus';
      case 'user_left': return 'UserMinus';
      default: return 'Activity';
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'task_completed': return 'text-green-600';
      case 'task_created': return 'text-blue-600';
      case 'task_updated': return 'text-yellow-600';
      case 'project_created': return 'text-purple-600';
      case 'project_updated': return 'text-indigo-600';
      case 'document_uploaded': return 'text-orange-600';
      case 'meeting_scheduled': return 'text-teal-600';
      case 'user_joined': return 'text-green-600';
      case 'user_left': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  return {
    stats,
    recentActivity,
    upcomingDeadlines,
    loading,
    refreshData: fetchDashboardData
  };
}