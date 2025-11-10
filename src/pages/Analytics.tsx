import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Target, Calendar, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { supabase } from '../lib/supabase';
import { ActivityLog, Task, Project, Meeting } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { currentGroup, groupMembers } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (currentGroup) {
      fetchAnalyticsData();
    }
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
      setActivityLogs(activityData || []);

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
      setTasks(tasksData || []);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('group_id', currentGroup.id);

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .eq('group_id', currentGroup.id)
        .gte('created_at', startDate.toISOString());

      if (meetingsError) throw meetingsError;
      setMeetings(meetingsData || []);

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-7 h-7 mr-3" />
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track team performance and project insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={exportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics?.totalTasks || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 font-medium">
                  {analytics?.completedTasks || 0} completed
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics?.activeProjects || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  of {analytics?.totalProjects || 0} total
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {groupMembers.length}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-blue-600 font-medium">
                  Active contributors
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Meetings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics?.totalMeetings || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-purple-600 font-medium">
                  This period
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="activities" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="tasks" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="meetings" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.taskStatusData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics?.taskStatusData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.teamPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" />
              <Bar dataKey="total" fill="#e5e7eb" name="Total Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Progress
          </h3>
          <div className="space-y-4">
            {analytics?.projectProgress?.map((project: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.status === 'completed' ? 'bg-green-600' :
                      project.status === 'active' ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            {(!analytics?.projectProgress || analytics.projectProgress.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No projects to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activityLogs.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <img
                  src={activity.user?.avatar || `https://ui-avatars.com/api/?name=${activity.user?.name}&background=3B82F6&color=fff`}
                  alt={activity.user?.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.user?.name}</span> {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          ))}
          
          {activityLogs.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}