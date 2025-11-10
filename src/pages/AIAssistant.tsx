import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Plus, MessageSquare, Sparkles, Lightbulb, BarChart3, Calendar, Users, Target, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIConversation, AIMessage } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { generateTaskSummary, parseNaturalLanguageCommand, generateWeeklyReport, generateProjectSuggestions, generateSmartResponse } from '../lib/gemini';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              AI Assistant
            </h2>
            <button
              onClick={createNewConversation}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                activeConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {conversation.title || 'New Conversation'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {conversation.messages.length} messages
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(conversation.updated_at), 'MMM dd, HH:mm')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Trash2 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No conversations yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeConversation.title || 'AI Assistant'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask me anything about your projects, tasks, and team performance
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {activeConversation.messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Welcome to AI Assistant!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    I'm here to help you manage your projects and tasks more efficiently.
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <action.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Try asking:
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => sendMessage(suggestion)}
                            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your projects, tasks, deadlines, or team performance..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!message.trim() || loading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new conversation to get started with AI assistance
              </p>
              <button
                onClick={createNewConversation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}