import React from 'react';
import { FolderOpen, CheckSquare, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { RealTimeStatsCard } from '../components/Dashboard/RealTimeStatsCard';
import { RealTimeActivity } from '../components/Dashboard/RealTimeActivity';
import { UpcomingDeadlines } from '../components/Dashboard/UpcomingDeadlines';
import { AIInsights } from '../components/Dashboard/AIInsights';
import { useDashboard } from '../hooks/useDashboard';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { stats, recentActivity, upcomingDeadlines, loading, refreshData } = useDashboard();
  const { currentGroup } = useGroup();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}! Here's what's happening with {currentGroup?.name}.
          </p>
        </div>
        
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeStatsCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderOpen}
          color="blue"
          trend={{ 
            value: stats.trends.projects, 
            isPositive: stats.trends.projects > 0 
          }}
          loading={loading}
        />
        <RealTimeStatsCard
          title="Tasks Completed"
          value={stats.completedTasks}
          icon={CheckSquare}
          color="green"
          trend={{ 
            value: stats.trends.tasks, 
            isPositive: stats.trends.tasks > 0 
          }}
          loading={loading}
        />
        <RealTimeStatsCard
          title="Team Members"
          value={stats.teamMembers}
          icon={Users}
          color="orange"
          trend={{ 
            value: stats.trends.members, 
            isPositive: stats.trends.members > 0 
          }}
          loading={loading}
        />
        <RealTimeStatsCard
          title="Productivity"
          value={`${stats.productivity}%`}
          icon={TrendingUp}
          color="purple"
          trend={{ 
            value: stats.trends.productivity, 
            isPositive: stats.trends.productivity > 0 
          }}
          loading={loading}
        />
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Activity and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeActivity 
          activities={recentActivity} 
          loading={loading}
        />
        
        <UpcomingDeadlines 
          deadlines={upcomingDeadlines}
          loading={loading}
        />
      </div>

      {/* Additional Stats */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completedTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.totalTasks - stats.completedTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}