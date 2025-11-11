import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Plus, MessageSquare, Sparkles, Lightbulb, BarChart3, Calendar, Users, Target, Clock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIConversation, AIMessage } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { generateTaskSummary, parseNaturalLanguageCommand, generateWeeklyReport, generateProjectSuggestions, generateSmartResponse } from '../lib/gemini';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export function AIAssistant() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [teamData, setTeamData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentGroup, groupMembers } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (currentGroup && user) {
      fetchConversations();
      loadTeamData();
    }
  }, [currentGroup, user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (teamData && Object.keys(teamData).length > 0) {
      loadSuggestions();
    }
  }, [teamData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTeamData = async () => {
    if (!currentGroup || !user) return;

    try {
      const [tasksRes, projectsRes, meetingsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('group_id', currentGroup.id),
        supabase.from('projects').select('*').eq('group_id', currentGroup.id),
        supabase.from('meetings').select('*').eq('group_id', currentGroup.id)
      ]);

      const teamDataObj = {
        tasks: tasksRes.data || [],
        projects: projectsRes.data || [],
        meetings: meetingsRes.data || [],
        members: groupMembers,
        recentActivity: []
      };

      setTeamData(teamDataObj);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggestions = await generateProjectSuggestions('', teamData);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([
        "What tasks are assigned to me?",
        "Show me this week's deadlines", 
        "What's our team's progress?",
        "Create a new task",
        "Schedule a team meeting"
      ]);
    }
  };

  const fetchConversations = async () => {
    if (!currentGroup || !user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('group_id', currentGroup.id)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
      
      if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const createNewConversation = async () => {
    if (!currentGroup || !user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          group_id: currentGroup.id,
          title: 'New Conversation',
          messages: [],
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setActiveConversation(data);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversation?.id === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setActiveConversation(remaining.length > 0 ? remaining[0] : null);
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || !activeConversation || !user) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setLoading(true);
    setMessage('');

    try {
      // Add user message to conversation
      const updatedMessages = [...activeConversation.messages, userMessage];
      
      // Update local state immediately
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: updatedMessages
      } : null);

      // Generate AI response using enhanced Gemini integration
      let aiResponse = '';

      try {
        // First try to parse as a command
        const parsedCommand = await parseNaturalLanguageCommand(userMessage.content);
        
        if (parsedCommand.action !== 'other') {
          // Handle specific commands
          switch (parsedCommand.action) {
            case 'create_task':
              aiResponse = `I can help you create a task! Based on your request:

**Task Details:**
- Title: ${parsedCommand.title || 'New Task'}
- Description: ${parsedCommand.description || 'No description provided'}
- Priority: ${parsedCommand.priority || 'Medium'}
- Deadline: ${parsedCommand.deadline || 'Not specified'}

To create this task:
1. Go to the Tasks page
2. Click "New Task" 
3. Fill in the details above
4. Assign it to a team member

Would you like me to help you with anything else regarding this task?`;
              break;

            case 'create_project':
              aiResponse = `Great! I'll help you create a new project.

**Project Setup:**
- Name: ${parsedCommand.project_name || parsedCommand.title || 'New Project'}
- Description: ${parsedCommand.description || 'Project description needed'}

To create this project:
1. Navigate to the Projects page
2. Click "New Project"
3. Add team members and set deadlines
4. Break it down into specific tasks

Would you like suggestions for organizing this project?`;
              break;

            case 'create_meeting':
              aiResponse = `I'll help you schedule a meeting!

**Meeting Details:**
- Title: ${parsedCommand.title || 'Team Meeting'}
- Time: ${parsedCommand.meeting_time || 'Time to be determined'}

To schedule this meeting:
1. Go to the Calendar page
2. Click "New Meeting"
3. Set the date, time, and invite attendees
4. Add agenda items if needed

Should I suggest some agenda topics based on your current projects?`;
              break;

            case 'get_status':
              const statusSummary = await generateTaskSummary(teamData.tasks || []);
              aiResponse = `Here's your team's current status:

${statusSummary}

**Quick Stats:**
- Active Projects: ${teamData.projects?.filter((p: any) => p.status === 'active').length || 0}
- Total Tasks: ${teamData.tasks?.length || 0}
- Completed Tasks: ${teamData.tasks?.filter((t: any) => t.status === 'done').length || 0}
- Upcoming Meetings: ${teamData.meetings?.filter((m: any) => new Date(m.start_time) > new Date()).length || 0}

Need more details about any specific area?`;
              break;

            case 'get_analytics':
              const weeklyReport = await generateWeeklyReport(teamData.projects || [], teamData.tasks || []);
              aiResponse = weeklyReport;
              break;

            default:
              aiResponse = parsedCommand.response;
          }
        } else {
          // Use enhanced smart response for general queries
          aiResponse = await generateSmartResponse(userMessage.content, teamData);
        }
      } catch (error) {
        console.error('Error generating AI response:', error);
        // Fallback response
        aiResponse = `I understand you're asking about: "${userMessage.content}"

As your AI assistant, I can help you with:

**PROJECT MANAGEMENT:**
- Create and track projects
- Monitor team progress
- Set deadlines and milestones

**TASK ORGANIZATION:**
- Break down work into manageable tasks
- Assign responsibilities
- Track completion status

**TEAM COORDINATION:**
- Schedule meetings
- Share documents
- Monitor team performance

**ANALYTICS & INSIGHTS:**
- Generate progress reports
- Identify bottlenecks
- Suggest improvements

What specific area would you like help with?`;
      }

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      // Update conversation in database
      const { error } = await supabase
        .from('ai_conversations')
        .update({
          messages: finalMessages,
          title: finalMessages.length === 2 ? userMessage.content.slice(0, 50) + '...' : activeConversation.title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeConversation.id);

      if (error) throw error;

      // Update local state
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: finalMessages,
        title: finalMessages.length === 2 ? userMessage.content.slice(0, 50) + '...' : prev.title,
      } : null);

      // Update conversations list
      setConversations(prev => prev.map(c => 
        c.id === activeConversation.id 
          ? { ...c, messages: finalMessages, updated_at: new Date().toISOString() }
          : c
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    {
      icon: BarChart3,
      label: 'Team Progress',
      action: () => sendMessage('What is our team\'s current progress and status?'),
    },
    {
      icon: Calendar,
      label: 'Weekly Report',
      action: () => sendMessage('Generate a weekly report for our team'),
    },
    {
      icon: Target,
      label: 'Task Summary',
      action: () => sendMessage('Give me a summary of all current tasks'),
    },
    {
      icon: Users,
      label: 'Team Performance',
      action: () => sendMessage('How is our team performing this week?'),
    },
    {
      icon: Clock,
      label: 'Upcoming Deadlines',
      action: () => sendMessage('What deadlines are coming up?'),
    },
    {
      icon: Lightbulb,
      label: 'Productivity Tips',
      action: () => sendMessage('Give me productivity tips for our team'),
    },
  ];

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] p-6 space-y-6">
      {/* Ultra-Modern Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-white mb-2 tracking-tight flex items-center space-x-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Bot className="w-10 h-10" />
              </motion.div>
              <span>AI Assistant</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-6 text-white/90 text-lg font-medium"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>Powered by Gemini AI</span>
              </div>
              <div className="w-1 h-6 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-green-300" />
                <span>{conversations.length} Conversations</span>
              </div>
            </motion.div>
          </div>

          <motion.button
            onClick={createNewConversation}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-purple-50 transition-all shadow-xl font-bold text-lg"
          >
            <Plus className="w-6 h-6" />
            <span>New Chat</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area with Enhanced Design */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Conversations Sidebar with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-80 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                Chat History
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Smart AI Responses</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  activeConversation?.id === conversation.id 
                    ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className={`w-4 h-4 ${activeConversation?.id === conversation.id ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                      <h3 className={`text-sm font-bold truncate ${activeConversation?.id === conversation.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {conversation.title || 'New Conversation'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className={activeConversation?.id === conversation.id ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}>
                        💬 {conversation.messages.length} messages
                      </span>
                      <span className={activeConversation?.id === conversation.id ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}>
                        {format(new Date(conversation.updated_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className={`p-2 rounded-lg ${activeConversation?.id === conversation.id ? 'hover:bg-white/20' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    <Trash2 className={`w-4 h-4 ${activeConversation?.id === conversation.id ? 'text-white' : 'text-gray-400'}`} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
            
            {conversations.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Start chatting with AI!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Chat Area with Ultra-Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden"
        >
          {activeConversation ? (
            <>
              {/* Chat Header with Gradient */}
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      {activeConversation.title || 'AI Assistant'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Ask me anything about your projects, tasks, and team performance</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages with Enhanced Styling */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
                {activeConversation.messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-24 h-24 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    >
                      <Bot className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                      Welcome to AI Assistant! 🚀
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                      I'm here to help you manage your projects and tasks more efficiently.
                    </p>

                    {/* Quick Actions with Modern Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={action.action}
                          className="group p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-lg hover:shadow-2xl"
                        >
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <action.icon className="w-7 h-7 text-white" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {action.label}
                          </p>
                        </motion.button>
                      ))}
                    </div>

                    {/* Suggestions with Pills */}
                    {suggestions.length > 0 && (
                      <div className="max-w-3xl mx-auto">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          <span>Try asking:</span>
                        </h4>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {suggestions.map((suggestion, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => sendMessage(suggestion)}
                              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:from-purple-200 hover:to-fuchsia-200 dark:hover:from-purple-900/50 dark:hover:to-fuchsia-900/50 transition-all font-medium shadow-sm border border-purple-200 dark:border-purple-700"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeConversation.messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl px-6 py-4 rounded-2xl shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">AI Assistant</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      <div className={`text-xs mt-3 flex items-center space-x-2 ${
                        msg.role === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(msg.timestamp), 'HH:mm')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full"
                        ></motion.div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">AI is thinking...</span>
                        <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <div className="p-6 border-t-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="✨ Ask me about your projects, tasks, deadlines, or team performance..."
                      rows={1}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-medium transition-all"
                      style={{ minHeight: '56px', maxHeight: '120px' }}
                    />
                  </div>
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!message.trim() || loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-2xl hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:hover:scale-100"
                  >
                    <Send className="w-6 h-6" />
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center space-x-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Press Enter to send • Shift+Enter for new line</span>
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Bot className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                  Start a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                  Create a new conversation to get started with AI assistance
                </p>
                <motion.button
                  onClick={createNewConversation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-2xl hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-xl font-bold text-lg"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  New Conversation
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}