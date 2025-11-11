import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, TrendingUp, Target, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { generateTaskSummary } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { useGroup } from '../../hooks/useGroup';

export function AIInsights() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    productivity: 0,
    completedTasks: 0,
    pendingReviews: 0,
    teamEfficiency: 0
  });

  const { currentGroup } = useGroup();

  useEffect(() => {
    if (currentGroup) {
      loadInsights();
    }
  }, [currentGroup]);

  const loadInsights = async () => {
    try {
      setLoading(true);

      // Fetch real data from database
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(name),
          creator:created_by(name),
          projects(name)
        `)
        .eq('group_id', currentGroup!.id);

      if (tasksError) throw tasksError;

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('group_id', currentGroup!.id);

      if (projectsError) throw projectsError;

      // Calculate real metrics
      const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
      const totalTasks = tasks?.length || 0;
      const pendingReviews = tasks?.filter(t => t.status === 'in_progress').length || 0;
      const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate team efficiency based on task completion rate
      const recentTasks = tasks?.filter(t => {
        const createdDate = new Date(t.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= weekAgo;
      }) || [];

      const recentCompleted = recentTasks.filter(t => t.status === 'done').length;
      const teamEfficiency = recentTasks.length > 0 ? Math.round((recentCompleted / recentTasks.length) * 100) : 0;

      setMetrics({
        productivity,
        completedTasks,
        pendingReviews,
        teamEfficiency
      });

      // Generate AI insights with real data
      const summary = await generateTaskSummary(tasks || []);
      setInsights(summary);
      
    } catch (error) {
      console.error('Error loading AI insights:', error);
      
      // Generate helpful insights even without data
      const fallbackInsights = `🚀 **WELCOME TO TRACKBOSS.AI**

**CURRENT STATUS:**
Your team workspace is ready! This is the perfect starting point for building something amazing.

**QUICK START GUIDE:**
1. **CREATE YOUR FIRST PROJECT** - Define your main objectives and break them into manageable projects
2. **ADD TEAM TASKS** - Create specific, actionable tasks with clear deadlines
3. **INVITE TEAM MEMBERS** - Use the join code to bring your team together
4. **UPLOAD DOCUMENTS** - Share important files and resources
5. **SCHEDULE MEETINGS** - Keep everyone aligned with regular check-ins

**AI ASSISTANT READY:**
I'm powered by Google Gemini and ready to help you:
• Analyze team performance and productivity
• Generate insights from your project data
• Suggest improvements and optimizations
• Answer questions about your workflow
• Create reports and summaries

**NEXT STEPS:**
- Click "New Project" to get started
- Explore the AI Assistant for personalized help
- Set up your team's first sprint or milestone

Ready to transform your team's productivity? Let's build something incredible together! 🎯`;
      
      setInsights(fallbackInsights);
      
      // Set fallback metrics
      setMetrics({
        productivity: 0,
        completedTasks: 0,
        pendingReviews: 0,
        teamEfficiency: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-600" />
          AI Insights
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini</span>
          </div>
          <button
            onClick={loadInsights}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">AI is analyzing your team data...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{metrics.productivity}%</span>
              </div>
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">Productivity</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-black text-green-600 dark:text-green-400">{metrics.completedTasks}</span>
              </div>
              <p className="text-xs font-semibold text-green-900 dark:text-green-300">Completed</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{metrics.pendingReviews}</span>
              </div>
              <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-300">In Progress</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{metrics.teamEfficiency}%</span>
              </div>
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">Efficiency</p>
            </div>
          </div>

          {/* Scrollable Insights Content - Reduced Height */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {insights.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h4 key={index} className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-2">
                      {line.replace(/\*\*/g, '')}
                    </h4>
                  );
                } else if (line.startsWith('🚀') || line.startsWith('📊') || line.startsWith('⚡')) {
                  return (
                    <p key={index} className="text-lg font-bold text-blue-600 dark:text-blue-400 my-2">
                      {line}
                    </p>
                  );
                } else if (line.trim()) {
                  return (
                    <p key={index} className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                      {line}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}