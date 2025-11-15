import React, { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Eye, EyeOff, LogOut, Users as UsersIcon, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User as UserType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useGroup } from '../hooks/useGroup';
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance' | 'workspace'>('profile');
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [settings, setSettings] = useState<Record<string, string | boolean | number>>({});
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentGroup, leaveGroup, refreshGroup } = useGroup();
  const navigate = useNavigate();

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string | boolean | number>);

      setSettings(settingsMap);
    } catch {
      console.error('Error fetching settings');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSettings();
      setProfileData(user);
      setLoading(false);
    }
  }, [user, fetchSettings]);

  const updateSetting = async (key: string, value: string | boolean | number, type: 'notifications' | 'privacy' | 'theme') => {
    if (!user) return;

    // Update UI immediately (optimistic update)
    const previousValue = settings[key];
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      // Map frontend types to database enum values
      const dbType = type === 'notifications' ? 'notification' :
                     type === 'privacy' ? 'privacy' :
                     type === 'theme' ? 'appearance' : 'preference';

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value, // Supabase will automatically convert to JSONB
          setting_type: dbType,
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        console.error('Error updating setting:', error);
        // Revert on error
        setSettings(prev => ({ ...prev, [key]: previousValue }));
        toast.error('Failed to update setting');
        return;
      }

      // Silent success - no toast needed for instant updates
    } catch (err) {
      console.error('Caught error updating setting:', err);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: previousValue }));
      toast.error('Failed to update setting');
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

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        setLoading(false);
        return;
      }

      toast.success('Profile updated successfully');
    } catch {
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

      if (error) {
        console.error('Error updating password:', error);
        toast.error('Failed to update password');
        setLoading(false);
        return;
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password updated successfully');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    setUploadingAvatar(true);
    toast.loading('Uploading avatar...', { id: 'avatar-upload' });

    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload avatar', { id: 'avatar-upload' });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to update profile', { id: 'avatar-upload' });
        return;
      }

      // Update local state
      setProfileData(prev => ({ ...prev, avatar: publicUrl }));
      toast.success('Avatar updated successfully!', { id: 'avatar-upload' });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar', { id: 'avatar-upload' });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingAnimation variant="pulse" size="md" text="Loading Settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
      {/* Stylish Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4">
              <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white truncate">Settings ⚙️</h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-base truncate">
                Customize your experience in real-time
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Settings Navigation - Stylish */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-64 lg:flex-shrink-0"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 sm:p-2">
            <nav className="space-y-1">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-102'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="truncate">{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8"
              >
                {/* Header */}
                <div className="flex items-center mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      Profile Information
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      Manage your personal information
                    </p>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Avatar Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="relative group flex-shrink-0">
                        <img
                          src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=gradient&color=fff`}
                          alt={profileData.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl ring-4 ring-white dark:ring-gray-700 shadow-xl group-hover:scale-105 transition-transform object-cover"
                        />
                        <div
                          onClick={handleAvatarClick}
                          className="absolute inset-0 bg-black/50 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          {uploadingAvatar ? (
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-white border-t-transparent" />
                          ) : (
                            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="text-center sm:text-left w-full sm:w-auto">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                          {profileData.name || 'Your Name'}
                        </h3>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <button
                          onClick={handleAvatarClick}
                          disabled={uploadingAvatar}
                          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {uploadingAvatar ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4" />
                              <span>Change Avatar</span>
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          JPG, GIF or PNG. 1MB max.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2 sm:mr-3"></span>
                      Personal Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">👤</span>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name || ''}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">📧</span>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email || ''}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">💼</span>
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={profileData.title || ''}
                          onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                          placeholder="Your role"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">🏢</span>
                          Department
                        </label>
                        <input
                          type="text"
                          value={profileData.department || ''}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                          placeholder="Your department"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">📱</span>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone || ''}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">📍</span>
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location || ''}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <span className="mr-2">✍️</span>
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio || ''}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-200 dark:border-gray-600">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-2 sm:mr-3"></span>
                      Change Password
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="mr-2">🔒</span>
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:scale-110 transition-transform min-w-[44px] justify-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <span className="mr-2">🔑</span>
                            New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                            placeholder="Enter new password"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <span className="mr-2">✅</span>
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={updatePassword}
                        disabled={loading || !passwordData.newPassword}
                        className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold flex items-center justify-center text-sm sm:text-base min-h-[44px]"
                      >
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        {loading ? 'Updating...' : 'Update Password'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={updateProfile}
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl font-bold text-base sm:text-lg flex items-center justify-center min-h-[44px]"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Workspace Settings */}
            {activeTab === 'workspace' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Workspace Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your workspace preferences
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentGroup ? (
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
                  ) : (
                    /* No workspace - Show join/create options */
                    <div className="space-y-6">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <UsersIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              No Workspace Connected
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              You're currently exploring ORBIT LIVE TEAM as a guest. Join or create a workspace to collaborate with your team and unlock all features.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                            <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Join Workspace
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Have a join code? Join an existing workspace and start collaborating with your team.
                          </p>
                          <button
                            onClick={() => {
                              localStorage.removeItem('skipWorkspace');
                              window.location.href = '/';
                            }}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <UsersIcon className="w-4 h-4" />
                            <span>Join Workspace</span>
                          </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                            <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Create Workspace
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Start fresh! Create a new workspace and invite your team members to join.
                          </p>
                          <button
                            onClick={() => {
                              localStorage.removeItem('skipWorkspace');
                              window.location.href = '/';
                            }}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <UsersIcon className="w-4 h-4" />
                            <span>Create Workspace</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>💡 Note:</strong> You can continue exploring the app as a guest, but some features require a workspace.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <div className="flex items-center mb-6 sm:mb-8">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-gray-600 shadow-md">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                      Email Notifications
                    </h3>
                    
                    {[
                      { key: 'email_tasks', label: 'Task assignments and updates', description: 'Get notified when tasks are assigned to you or updated', icon: '📋' },
                      { key: 'email_meetings', label: 'Meeting reminders', description: 'Receive reminders for upcoming meetings', icon: '📅' },
                      { key: 'email_projects', label: 'Project updates', description: 'Stay informed about project progress and changes', icon: '🎯' },
                      { key: 'email_weekly', label: 'Weekly summary', description: 'Get a weekly digest of your team\'s activity', icon: '📊' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={Boolean(settings[item.key])}
                          onChange={(e) => {
                            updateSetting(item.key, e.target.checked, 'notifications');
                          }}
                          className="mt-0.5 sm:mt-1 h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded transition-all cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={item.key} className="flex items-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                            <span className="mr-1.5 sm:mr-2 flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-gray-600 shadow-md">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                      Push Notifications
                    </h3>
                    
                    {[
                      { key: 'push_tasks', label: 'Task notifications', description: 'Instant notifications for task updates', icon: '🔔' },
                      { key: 'push_mentions', label: 'Mentions and comments', description: 'When someone mentions you or comments on your work', icon: '💬' },
                      { key: 'push_deadlines', label: 'Deadline reminders', description: 'Alerts for approaching deadlines', icon: '⏰' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={Boolean(settings[item.key])}
                          onChange={(e) => {
                            updateSetting(item.key, e.target.checked, 'notifications');
                          }}
                          className="mt-0.5 sm:mt-1 h-5 w-5 sm:h-6 sm:w-6 text-purple-600 focus:ring-2 focus:ring-purple-500 border-gray-300 rounded transition-all cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={item.key} className="flex items-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                            <span className="mr-1.5 sm:mr-2 flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
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
                          checked={Boolean(settings[item.key])}
                          onChange={async (e) => {
                            try {
                              await updateSetting(item.key, e.target.checked, 'privacy');
                              toast.success('Privacy setting updated');
                            } catch {
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
                          checked={Boolean(settings[item.key])}
                          onChange={async (e) => {
                            try {
                              await updateSetting(item.key, e.target.checked, 'privacy');
                              toast.success('Privacy setting updated');
                            } catch {
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      Appearance & Display
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      Customize your visual experience
                    </p>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Theme Selection */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-200 dark:border-gray-600">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
                      Choose Theme
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { value: 'light', label: 'Light', description: 'Clean and bright interface', icon: '☀️', gradient: 'from-yellow-400 to-orange-500' },
                        { value: 'dark', label: 'Dark', description: 'Easy on the eyes in low light', icon: '🌙', gradient: 'from-indigo-600 to-purple-700' },
                        { value: 'system', label: 'System', description: 'Follow your system preference', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
                      ].map((theme, index) => {
                        const isActive = (theme.value === 'dark' && isDark) || (theme.value === 'light' && !isDark);
                        return (
                          <motion.div
                            key={theme.value}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (theme.value === 'dark' && !isDark) toggleTheme();
                              if (theme.value === 'light' && isDark) toggleTheme();
                            }}
                            className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl cursor-pointer transition-all shadow-lg min-h-[120px] sm:min-h-[140px] ${
                              isActive
                                ? `bg-gradient-to-br ${theme.gradient} border-2 border-white shadow-2xl`
                                : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:shadow-xl'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              </div>
                            )}
                            <div className="text-center">
                              <div className={`text-3xl sm:text-4xl mb-2 sm:mb-3 ${isActive ? 'animate-bounce' : ''}`}>{theme.icon}</div>
                              <p className={`font-bold text-base sm:text-lg mb-1 sm:mb-2 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {theme.label}
                              </p>
                              <p className={`text-xs sm:text-sm ${isActive ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                                {theme.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-2 sm:mr-3"></span>
                      Display Options
                    </h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { key: 'compact_mode', label: 'Compact mode', description: 'Show more content in less space', icon: '🗜️' },
                        { key: 'show_avatars', label: 'Show user avatars', description: 'Display profile pictures throughout the app', icon: '👤' },
                        { key: 'animations', label: 'Enable animations', description: 'Smooth transitions and micro-interactions', icon: '✨' },
                      ].map((item, index) => (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-h-[44px]"
                        >
                          <input
                            type="checkbox"
                            id={item.key}
                            checked={Boolean(settings[item.key])}
                            onChange={(e) => {
                              updateSetting(item.key, e.target.checked, 'theme');
                            }}
                            className="mt-0.5 sm:mt-1 h-5 w-5 sm:h-6 sm:w-6 text-purple-600 focus:ring-2 focus:ring-purple-500 border-gray-300 rounded-lg transition-all cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={item.key} className="flex items-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                              <span className="mr-1.5 sm:mr-2 flex-shrink-0">{item.icon}</span>
                              <span className="truncate">{item.label}</span>
                            </label>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
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

