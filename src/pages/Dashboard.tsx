import { FolderOpen, CheckSquare, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { RealTimeActivity } from '../components/Dashboard/RealTimeActivity';
import { UpcomingDeadlines } from '../components/Dashboard/UpcomingDeadlines';
import { AIInsights } from '../components/Dashboard/AIInsights';
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingAnimation variant="orbital" size="md" text="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header - ElevenLabs Clean Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
              {currentGroup?.name}
            </p>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
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
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
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
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
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
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
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
            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white flex-shrink-0" />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Performance Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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

