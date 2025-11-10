import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, TrendingUp, AlertTriangle, Target, Users, Calendar, FileText, RefreshCw } from 'lucide-react';
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
              <div key={i} className="animate-pulse">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Generated Insights */}
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {insights}
              </div>
            </div>
          </div>
          
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Productivity
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {metrics.productivity}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Tasks Done
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {metrics.completedTasks}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {metrics.pendingReviews}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Team Efficiency
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {metrics.teamEfficiency}%
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={loadInsights}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              <span>Refresh Insights</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
              <Calendar className="w-4 h-4" />
              <span>Schedule Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}