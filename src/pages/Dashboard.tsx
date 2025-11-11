import React from 'react';
import { FolderOpen, CheckSquare, Users, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { RealTimeStatsCard } from '../components/Dashboard/RealTimeStatsCard';
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

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-white mb-2 tracking-tight"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Welcome back, {user?.name}! 🚀
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/90 text-lg font-medium"
            >
              Managing <span className="font-bold text-yellow-300">{currentGroup?.name}</span> • Let's make today productive
            </motion.p>
          </div>

          <motion.button
            onClick={refreshData}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-lg text-white rounded-2xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/30 shadow-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Refresh</span>
          </motion.button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Real-time Stats Cards with Unique Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <RealTimeStatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={FolderOpen}
            color="blue"
            trend={{ value: stats.trends.projects, isPositive: stats.trends.projects > 0 }}
            loading={loading}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <RealTimeStatsCard
            title="Tasks Completed"
            value={stats.completedTasks}
            icon={CheckSquare}
            color="green"
            trend={{ value: stats.trends.tasks, isPositive: stats.trends.tasks > 0 }}
            loading={loading}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <RealTimeStatsCard
            title="Team Members"
            value={stats.teamMembers}
            icon={Users}
            color="orange"
            trend={{ value: stats.trends.members, isPositive: stats.trends.members > 0 }}
            loading={loading}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <RealTimeStatsCard
            title="Productivity"
            value={`${stats.productivity}%`}
            icon={TrendingUp}
            color="purple"
            trend={{ value: stats.trends.productivity, isPositive: stats.trends.productivity > 0 }}
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* AI Insights with Special Styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AIInsights />
      </motion.div>

      {/* Activity and Deadlines with Enhanced Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
          <RealTimeActivity activities={recentActivity} loading={loading} />
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
          <UpcomingDeadlines deadlines={upcomingDeadlines} loading={loading} />
        </motion.div>
      </motion.div>

      {/* Enhanced Quick Stats with Colorful Cards */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-8 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">
                Quick Performance Stats
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="text-center p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg"
              >
                <div className="text-4xl font-black text-white mb-2">
                  {stats.totalTasks}
                </div>
                <div className="text-sm text-white/80 font-medium">Total Tasks</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="text-center p-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg"
              >
                <div className="text-4xl font-black text-white mb-2">
                  {stats.completedTasks}
                </div>
                <div className="text-sm text-white/80 font-medium">Completed</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="text-center p-6 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-lg"
              >
                <div className="text-4xl font-black text-white mb-2">
                  {stats.totalTasks - stats.completedTasks}
                </div>
                <div className="text-sm text-white/80 font-medium">In Progress</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="text-center p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg"
              >
                <div className="text-4xl font-black text-white mb-2">
                  {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                </div>
                <div className="text-sm text-white/80 font-medium">Completion Rate</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}