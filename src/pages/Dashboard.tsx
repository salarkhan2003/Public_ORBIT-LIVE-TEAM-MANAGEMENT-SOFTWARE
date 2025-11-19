import { FolderOpen, CheckSquare, Users, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { RealTimeActivity } from '../components/Dashboard/RealTimeActivity';
import { UpcomingDeadlines } from '../components/Dashboard/UpcomingDeadlines';
import { AIInsights } from '../components/Dashboard/AIInsights';
import { WorkspaceTour } from '../components/Onboarding/WorkspaceTour';
import { useDashboard } from '../hooks/useDashboard';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Dashboard() {
  const { stats, recentActivity, upcomingDeadlines, loading, refreshData } = useDashboard();
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(12);

  // Show tour on first workspace entry
  useEffect(() => {
    if (currentGroup && user) {
      const tourCompleted = localStorage.getItem('workspaceTourCompleted');
      if (!tourCompleted) {
        // Small delay to let page load
        setTimeout(() => {
          setShowTour(true);
        }, 1000);
      }
    }
  }, [currentGroup, user]);

  useEffect(() => {
    if (!loading) return;
    setLoadingProgress(12);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + Math.random() * 8;
        return next >= 96 ? 96 : next;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060a] text-white flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 blur-3xl opacity-30 animate-pulse" />
          <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden p-8 sm:p-12">
            <motion.div
              className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl"
              animate={{ scale: [1.1, 0.9, 1.1] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-lg border border-white/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Preparing Dashboard</p>
                  <h1 className="text-2xl sm:text-3xl font-black">Aligning Your Workspace</h1>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Synchronizing insights</p>
                  <p className="text-sm font-semibold text-white/80">{Math.round(loadingProgress)}%</p>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300"
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Live Signals', value: 'Realtime', trend: '+6 updates' },
                  { label: 'AI Briefing', value: 'Queued', trend: 'Ready in secs' }
                ].map(card => (
                  <div key={card.label} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                    <p className="text-white/50 text-xs">{card.label}</p>
                    <p className="text-lg font-semibold">{card.value}</p>
                    <p className="text-[11px] text-emerald-300/80 mt-1">{card.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showTour && <WorkspaceTour onComplete={() => setShowTour(false)} />}
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
    </>
  );
}

