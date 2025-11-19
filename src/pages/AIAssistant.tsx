import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Trash2, Plus, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIConversation, AIMessage } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';
import { generateSmartResponse } from '../lib/gemini';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function AIAssistant() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false); // Start with false
  const [suggestions] = useState<string[]>([
    "What tasks are assigned to me?",
    "Show me this week's deadlines",
    "What's our team's progress?",
    "Create a new task",
    "Schedule a team meeting"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentGroup } = useGroup();
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!currentGroup || !user) {
      setLoadingConversations(false);
      return;
    }

    try {
      setLoadingConversations(true);
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('group_id', currentGroup.id)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
        return;
      }

      setConversations(data || []);

      if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentGroup, user, activeConversation]);

  useEffect(() => {
    if (currentGroup && user) {
      const timeout = setTimeout(() => setLoadingConversations(false), 3000);
      fetchConversations().finally(() => clearTimeout(timeout));
      return () => clearTimeout(timeout);
    } else {
      setLoadingConversations(false);
    }
  }, [currentGroup, user, fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = async () => {
    if (!currentGroup || !user) return;

    // Create optimistic conversation immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticConversation: AIConversation = {
      id: tempId,
      user_id: user.id,
      group_id: currentGroup.id,
      title: 'New Conversation',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update UI immediately
    setConversations(prev => [optimisticConversation, ...prev]);
    setActiveConversation(optimisticConversation);
    toast.success('Conversation created!');

    // Create in background
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

      if (error) {
        console.error('Error creating conversation:', error);
        // Revert optimistic update
        setConversations(prev => prev.filter(c => c.id !== tempId));
        setActiveConversation(null);
        toast.error('Failed to save conversation');
        return;
      }

      // Replace temp conversation with real one
      setConversations(prev => prev.map(c => c.id === tempId ? data : c));
      setActiveConversation(data);
    } catch {
      // Revert optimistic update
      setConversations(prev => prev.filter(c => c.id !== tempId));
      setActiveConversation(null);
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

      if (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
        return;
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversation?.id === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setActiveConversation(remaining.length > 0 ? remaining[0] : null);
      }
      
      toast.success('Conversation deleted');
    } catch {
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
      const updatedMessages = [...activeConversation.messages, userMessage];
      
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: updatedMessages
      } : null);

      const aiResponse = await generateSmartResponse(userMessage.content, {
        userName: user.name,
        groupName: currentGroup?.name || '',
      });

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];

      await supabase
        .from('ai_conversations')
        .update({
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeConversation.id);

      setActiveConversation(prev => prev ? {
        ...prev,
        messages: finalMessages
      } : null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingAnimation variant="spin" size="md" text="Loading AI Assistant..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-light-base to-light-elevated dark:from-dark-base dark:to-dark-elevated overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:flex md:w-64 lg:w-80 glass-card border-r border-gray-200 dark:border-dark-border flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-dark-border">
          <motion.button
            onClick={createNewConversation}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-neon-blue to-neon-cyan text-white rounded-xl sm:rounded-2xl font-semibold shadow-glow text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Conversation</span>
            </div>
          </motion.button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <AnimatePresence>
            {conversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveConversation(conv)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all ${
                  activeConversation?.id === conv.id
                    ? 'bg-gradient-to-br from-neon-blue/10 to-neon-cyan/10 border-2 border-neon-blue/30'
                    : 'glass-card hover:bg-gray-100 dark:hover:bg-dark-hover border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate flex-1">
                    {conv.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(conv.updated_at), 'MMM dd, h:mm a')}
                </p>
                {conv.messages.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">
                    {conv.messages[conv.messages.length - 1].content}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Chat Area - Luma Cinematic */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card border-b border-gray-200 dark:border-dark-border p-3 sm:p-4 md:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white dark:border-dark-card"></div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">ORBIT AI</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Your intelligent assistant</p>
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
              {activeConversation.messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full px-4"
                >
                  <div className="relative mb-6 sm:mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-glow"
                    >
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">
                    How can I help you today?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 sm:mb-8 max-w-md px-4">
                    Ask me anything about your tasks, projects, team, or let me help you automate workflows
                  </p>

                  {/* Suggestions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => sendMessage(suggestion)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-left p-4 glass-card rounded-2xl border border-gray-200 dark:border-dark-border hover:border-neon-blue dark:hover:border-neon-blue transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-neon-blue" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {suggestion}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {activeConversation.messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-3xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-neon-blue to-neon-cyan text-white shadow-glow'
                            : 'cinematic-card border border-gray-200 dark:border-dark-border'
                        } rounded-2xl p-5`}
                      >
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          {msg.content}
                        </p>
                        <p className={`text-xs mt-3 ${
                          msg.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </p>
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-purple">
                          <span className="text-white font-bold">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="cinematic-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border">
                    <div className="flex gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-neon-blue rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-neon-cyan rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-neon-magenta rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - ElevenLabs Clean */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card border-t border-gray-200 dark:border-dark-border p-6"
            >
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    disabled={loading}
                    rows={3}
                    className="w-full px-6 py-4 pr-14 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all resize-none font-medium"
                  />
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={loading || !message.trim()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-neon-blue to-neon-cyan text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-3xl flex items-center justify-center shadow-glow"
              >
                <MessageSquare className="w-16 h-16 text-white" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              No conversation selected
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Create a new conversation to start chatting with ORBIT AI
            </p>
            <motion.button
              onClick={createNewConversation}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-cyan text-white rounded-2xl font-semibold shadow-glow">
                <Plus className="w-5 h-5" />
                <span>New Conversation</span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

