import React from 'react';
import { FolderOpen, CheckSquare, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { RealTimeActivity } from '../components/Dashboard/RealTimeActivity';
import { UpcomingDeadlines } from '../components/Dashboard/UpcomingDeadlines';
import { AIInsights } from '../components/Dashboard/AIInsights';
import { useDashboard } from '../hooks/useDashboard';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { stats, recentActivity, upcomingDeadlines, loading, refreshData } = useDashboard();
  const { currentGroup } = useGroup();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800 border-t-gray-900 dark:border-t-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header - ElevenLabs Clean Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentGroup?.name}
            </p>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh</span>
          </button>
        </motion.div>

        {/* Stats Grid - Clean & Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: 'Active Projects',
              value: stats.activeProjects,
              icon: FolderOpen,
              trend: stats.trends.projects,
            },
            {
              title: 'Tasks Completed',
              value: stats.completedTasks,
              icon: CheckSquare,
              trend: stats.trends.tasks,
            },
            {
              title: 'Team Members',
              value: stats.teamMembers,
              icon: Users,
              trend: stats.trends.members,
            },
            {
              title: 'Productivity',
              value: `${stats.productivity}%`,
              icon: TrendingUp,
              trend: stats.trends.productivity,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {stat.trend !== 0 && (
                  <span className={`text-xs font-medium ${
                    stat.trend > 0 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <AIInsights />
        </motion.div>

        {/* Activity Grid - Two Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div>
            <RealTimeActivity activities={recentActivity} loading={loading} />
          </div>

          <div>
            <UpcomingDeadlines deadlines={upcomingDeadlines} loading={loading} />
          </div>
        </motion.div>

        {/* Performance Overview - Clean Minimalist */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  label: 'Total Tasks',
                  value: stats.totalTasks,
                },
                {
                  label: 'Completed',
                  value: stats.completedTasks,
                },
                {
                  label: 'In Progress',
                  value: stats.totalTasks - stats.completedTasks,
                },
                {
                  label: 'Success Rate',
                  value: `${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%`,
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

