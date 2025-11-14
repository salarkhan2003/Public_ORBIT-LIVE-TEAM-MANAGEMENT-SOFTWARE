import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ActivityLog, Task, Project, Meeting } from '../types';
import { useGroup } from '../hooks/useGroup';
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { motion } from 'framer-motion';

interface DailyActivityItem {
  date: string;
  activities: number;
  tasks: number;
  meetings: number;
  completed_tasks: number;
}

interface TaskStatusItem {
  name: string;
  value: number;
  color: string;
}

interface TeamPerformanceItem {
  name: string;
  completed: number;
  total: number;
  completion_rate: number;
}

interface ProjectProgressItem {
  name: string;
  progress: number;
  status: string;
}

interface AnalyticsData {
  dailyActivity: DailyActivityItem[];
  taskStatusData: TaskStatusItem[];
  teamPerformance: TeamPerformanceItem[];
  projectProgress: ProjectProgressItem[];
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  activeProjects: number;
  totalMeetings: number;
  totalActivities: number;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_activityLogs, _setActivityLogs] = useState<ActivityLog[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tasks, _setTasks] = useState<Task[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_projects, _setProjects] = useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_meetings, _setMeetings] = useState<Meeting[]>([]);
  const { currentGroup, groupMembers } = useGroup();

  useEffect(() => {
    if (currentGroup) {
      fetchAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroup, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!currentGroup) return;

    setLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      // Fetch activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_id(id, name, avatar)
        `)
        .eq('group_id', currentGroup.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;
      _setActivityLogs(activityData || []);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(id, name),
          creator:created_by(id, name)
        `)
        .eq('group_id', currentGroup.id)
        .gte('created_at', startDate.toISOString());

      if (tasksError) throw tasksError;
      _setTasks(tasksData || []);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('group_id', currentGroup.id);

      if (projectsError) throw projectsError;
      _setProjects(projectsData || []);

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .eq('group_id', currentGroup.id)
        .gte('created_at', startDate.toISOString());

      if (meetingsError) throw meetingsError;
      _setMeetings(meetingsData || []);

      // Process analytics
      processAnalytics(activityData || [], tasksData || [], projectsData || [], meetingsData || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (activities: ActivityLog[], tasks: Task[], projects: Project[], meetings: Meeting[]) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Generate daily activity data
    const dailyActivity = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      
      const dayActivities = activities.filter(activity => 
        format(new Date(activity.created_at), 'MMM dd') === dateStr
      );
      
      const dayTasks = tasks.filter(task => 
        format(new Date(task.created_at), 'MMM dd') === dateStr
      );
      
      const dayMeetings = meetings.filter(meeting => 
        format(new Date(meeting.created_at), 'MMM dd') === dateStr
      );

      dailyActivity.push({
        date: dateStr,
        activities: dayActivities.length,
        tasks: dayTasks.length,
        meetings: dayMeetings.length,
        completed_tasks: dayTasks.filter(t => t.status === 'done').length,
      });
    }

    // Task status distribution
    const taskStatusData = [
      { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#ef4444' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
      { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
    ];

    // Team performance
    const teamPerformance = groupMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_to === member.user_id);
      const completedTasks = memberTasks.filter(t => t.status === 'done').length;
      const totalTasks = memberTasks.length;
      
      return {
        name: member.users?.name || 'Unknown',
        completed: completedTasks,
        total: totalTasks,
        completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });

    // Project progress
    const projectProgress = projects.map(project => ({
      name: project.name,
      progress: project.progress,
      status: project.status,
    }));

    setAnalytics({
      dailyActivity,
      taskStatusData,
      teamPerformance,
      projectProgress,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalMeetings: meetings.length,
      totalActivities: activities.length,
    });
  };

  const exportData = () => {
    const data = {
      analytics,
      timeRange,
      exportDate: new Date().toISOString(),
      group: currentGroup?.name,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${currentGroup?.name}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingAnimation variant="bars" size="md" text="Loading Analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Ultra-Modern Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-10 sm:-right-20 -top-10 sm:-top-20 w-32 h-32 sm:w-64 sm:h-64 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 sm:-left-20 -bottom-10 sm:-bottom-20 w-32 h-32 sm:w-64 sm:h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-2 sm:gap-3"
            >
              <BarChart3 className="w-7 h-7 sm:w-10 sm:h-10 flex-shrink-0" />
              <span className="truncate">Analytics Dashboard</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 text-white/90 text-xs sm:text-sm md:text-base lg:text-lg font-medium"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" />
                <span className="hidden sm:inline">Performance Insights</span>
                <span className="sm:hidden">Insights</span>
              </div>
              <div className="hidden sm:block w-px h-4 sm:h-6 bg-white/30"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
                <span>{analytics?.totalTasks || 0} Tasks</span>
              </div>
              <div className="hidden sm:block w-px h-4 sm:h-6 bg-white/30"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 flex-shrink-0" />
                <span>{groupMembers.length} <span className="hidden sm:inline">Team </span>Members</span>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.select
              whileHover={{ scale: 1.05 }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold focus:ring-2 focus:ring-white/50 focus:border-white/50 w-full sm:w-auto"
            >
              <option value="7d" className="text-gray-900">Last 7 Days</option>
              <option value="30d" className="text-gray-900">Last 30 Days</option>
              <option value="90d" className="text-gray-900">Last 90 Days</option>
            </motion.select>

            <motion.button
              onClick={exportData}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white text-cyan-600 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-cyan-50 transition-all shadow-xl font-bold text-xs sm:text-sm md:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">⬇️</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Analytics Content - Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
      >
        <BarChart3 className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed analytics and insights coming soon!
        </p>
      </motion.div>
    </div>
  );
}
