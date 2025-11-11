import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save, Eye, EyeOff, LogOut, Users as UsersIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserSettings, User as UserType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useGroup } from '../hooks/useGroup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance' | 'workspace'>('profile');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentGroup, leaveGroup, refreshGroup } = useGroup();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSettings();
      setProfileData(user);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSetting = async (key: string, value: any, type: UserSettings['setting_type']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value,
          setting_type: type,
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleExitWorkspace = async () => {
    try {
      setLoading(true);
      await leaveGroup();
      toast.success('Successfully left workspace');
      setShowExitConfirm(false);
      // Refresh to show group join screen
      await refreshGroup();
      navigate('/');
    } catch (error) {
      console.error('Error leaving workspace:', error);
      toast.error('Failed to leave workspace');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: UsersIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <SettingsIcon className="w-7 h-7 mr-3" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <img
                      src={profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.name}&background=3B82F6&color=fff`}
                      alt={profileData.name}
                      className="w-20 h-20 rounded-full"
                    />
                    <div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Change Avatar
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name || ''}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email || ''}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={profileData.title || ''}
                        onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profileData.department || ''}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location || ''}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <button
                        onClick={updatePassword}
                        disabled={loading || !passwordData.newPassword}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace Settings */}
            {activeTab === 'workspace' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Workspace Settings
                </h2>
                
                <div className="space-y-6">
                  {currentGroup && (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Current Workspace
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Workspace Name</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{currentGroup.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                            <p className="text-gray-900 dark:text-white">{currentGroup.description || 'No description'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Join Code</p>
                            <code className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-wider">
                              {currentGroup.join_code}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                          Danger Zone
                        </h3>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                                Exit Workspace
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Leave this workspace. You'll need a new join code to rejoin. Your data will remain but you'll lose access.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowExitConfirm(true)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Exit Workspace</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    
                    {[
                      { key: 'email_tasks', label: 'Task assignments and updates', description: 'Get notified when tasks are assigned to you or updated' },
                      { key: 'email_meetings', label: 'Meeting reminders', description: 'Receive reminders for upcoming meetings' },
                      { key: 'email_projects', label: 'Project updates', description: 'Stay informed about project progress and changes' },
                      { key: 'email_weekly', label: 'Weekly summary', description: 'Get a weekly digest of your team\'s activity' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={settings[item.key] || false}
                          onChange={async (e) => {
                            try {
                              await updateSetting(item.key, e.target.checked, 'notifications');
                              toast.success('Notification preference updated');
                            } catch (error) {
                              toast.error('Failed to update preference');
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </h3>
                    
                    {[
                      { key: 'push_tasks', label: 'Task notifications', description: 'Instant notifications for task updates' },
                      { key: 'push_mentions', label: 'Mentions and comments', description: 'When someone mentions you or comments on your work' },
                      { key: 'push_deadlines', label: 'Deadline reminders', description: 'Alerts for approaching deadlines' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={settings[item.key] || false}
                          onChange={async (e) => {
                            try {
                              await updateSetting(item.key, e.target.checked, 'notifications');
                              toast.success('Notification preference updated');
                            } catch (error) {
                              toast.error('Failed to update preference');
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Privacy & Security
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Profile Visibility
                    </h3>
                    
                    {[
                      { key: 'profile_public', label: 'Public profile', description: 'Make your profile visible to other team members' },
                      { key: 'show_email', label: 'Show email address', description: 'Display your email in your profile' },
                      { key: 'show_phone', label: 'Show phone number', description: 'Display your phone number in your profile' },
                      { key: 'show_activity', label: 'Show activity status', description: 'Let others see when you\'re online' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={settings[item.key] || false}
                          onChange={async (e) => {
                            try {
                              await updateSetting(item.key, e.target.checked, 'privacy');
                              toast.success('Privacy setting updated');
                            } catch (error) {
                              toast.error('Failed to update setting');
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                      Data & Analytics
                    </h3>
                    
                    {[
                      { key: 'analytics_tracking', label: 'Usage analytics', description: 'Help improve the platform by sharing usage data' },
                      { key: 'performance_tracking', label: 'Performance tracking', description: 'Track your productivity metrics' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={settings[item.key] || false}
                          onChange={async (e) => {
                            try {
                              await updateSetting(item.key, e.target.checked, 'privacy');
                              toast.success('Privacy setting updated');
                            } catch (error) {
                              toast.error('Failed to update setting');
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Appearance & Display
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Theme
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', description: 'Clean and bright interface' },
                        { value: 'dark', label: 'Dark', description: 'Easy on the eyes in low light' },
                        { value: 'system', label: 'System', description: 'Follow your system preference' },
                      ].map((theme) => (
                        <div
                          key={theme.value}
                          onClick={() => {
                            if (theme.value === 'dark' && !isDark) toggleTheme();
                            if (theme.value === 'light' && isDark) toggleTheme();
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            (theme.value === 'dark' && isDark) || (theme.value === 'light' && !isDark)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              (theme.value === 'dark' && isDark) || (theme.value === 'light' && !isDark)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {((theme.value === 'dark' && isDark) || (theme.value === 'light' && !isDark)) && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {theme.label}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {theme.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Display Options
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'compact_mode', label: 'Compact mode', description: 'Show more content in less space' },
                        { key: 'show_avatars', label: 'Show user avatars', description: 'Display profile pictures throughout the app' },
                        { key: 'animations', label: 'Enable animations', description: 'Smooth transitions and micro-interactions' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={item.key}
                            checked={settings[item.key] || false}
                            onChange={async (e) => {
                              try {
                                await updateSetting(item.key, e.target.checked, 'theme');
                                toast.success('Display setting updated');
                              } catch (error) {
                                toast.error('Failed to update setting');
                              }
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <label htmlFor={item.key} className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit Workspace Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Exit Workspace?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to leave "{currentGroup?.name}"? You'll need the join code to rejoin later.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExitWorkspace}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Exiting...' : 'Exit Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

