import React, { useState } from 'react';
import { Users, Plus, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';
import { useGroup } from '../../hooks/useGroup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function GroupJoin() {
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { joinGroup, createGroup } = useGroup();
  const navigate = useNavigate();

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoading(true);
    try {
      await joinGroup(joinCode.toUpperCase());
      toast.success('Successfully joined workspace!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      const group = await createGroup(groupName, groupDescription);
      setCreatedGroup(group);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (createdGroup?.join_code) {
      await navigator.clipboard.writeText(createdGroup.join_code);
      setCopied(true);
      toast.success('Join code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked, navigating to dashboard...');
    // Force a re-render of the entire app by reloading
    window.location.href = '/dashboard';
  };

  // Show success screen after workspace is created
  if (createdGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                🎉 Workspace Created!
              </h2>
              <p className="text-green-100">
                Your team workspace is ready to use
              </p>
            </div>

            {/* Workspace Info */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {createdGroup.name}
                </h3>
                {createdGroup.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {createdGroup.description}
                  </p>
                )}
              </div>

              {/* Join Code Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Share this code with your team:
                </label>
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wider">
                          {createdGroup.join_code}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Team Join Code
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                      title="Copy join code"
                    >
                      {copied ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Copy className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Anyone with this code can join your workspace. Share it with your team members via email, chat, or any messaging app.
                </p>
              </div>

              {/* Get Started Button */}
              <button
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span className="text-lg">Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can find your join code later in Settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join ORBIT LIVE TEAM
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with your team and start collaborating
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Demo Access:</strong> Use join code <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded font-mono">DEMO01</code> to access the demo workspace
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                !isCreating
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Join ORBIT LIVE TEAM
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                isCreating
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Create Workspace
            </button>
          </div>

          <div className="p-6">
            {!isCreating ? (
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Join Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || joinCode.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Join ORBIT LIVE TEAM</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="ORBIT LIVE TEAM Workspace"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Describe your team and goals..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !groupName.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create ORBIT LIVE TEAM Workspace</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact your team administrator for the join code.
          </p>
        </div>
      </div>
    </div>
  );
}