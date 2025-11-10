import React, { useState } from 'react';
import { Menu, Search, Bell, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      toast.loading('Signing out...', { id: 'logout' });
      await signOut();
      toast.success('Signed out successfully!', { id: 'logout' });
    } catch (error) {
      toast.error('Error signing out', { id: 'logout' });
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative hidden md:block flex-1 max-w-md lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search button for mobile */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition-colors touch-manipulation">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors touch-manipulation">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label="User menu"
            >
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3B82F6&color=fff`}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover"
              />
              <div className="hidden sm:block text-left">
                <span className="text-sm font-medium text-gray-900 dark:text-white block truncate max-w-[120px]">
                  {user?.name}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {user?.title || user?.role}
                </p>
              </div>
            </button>

            {/* User dropdown menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-40 sm:hidden"
                    onClick={() => setShowUserMenu(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // Navigate to profile
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors touch-manipulation"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors touch-manipulation disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 dark:border-red-400"></div>
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}