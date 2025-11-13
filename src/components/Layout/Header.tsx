import { useState } from 'react';
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
    } catch {
      toast.error('Error signing out', { id: 'logout' });
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-b border-white/10 shadow-2xl sticky top-0 z-50 backdrop-blur-lg flex-shrink-0"
    >
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
          <motion.button
            onClick={onMenuClick}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/20 lg:hidden transition-all backdrop-blur-sm touch-manipulation flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </motion.button>

          <div className="relative hidden md:block flex-1 max-w-md lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-10 pr-4 py-2.5 w-full border border-white/20 rounded-xl bg-white/10 backdrop-blur-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Search button for mobile */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/20 md:hidden transition-all backdrop-blur-sm touch-manipulation"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-white" />
          </motion.button>

          {/* Theme toggle with enhanced animation */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm touch-manipulation"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-yellow-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications with badge */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/20 relative transition-all backdrop-blur-sm touch-manipulation hidden sm:flex"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-white"
            ></motion.span>
          </motion.button>

          {/* User menu with enhanced styling */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 p-1 sm:p-1.5 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm touch-manipulation"
              aria-label="User menu"
            >
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=FFF&color=4F46E5&bold=true`}
                alt={user?.name || 'User'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/40 object-cover shadow-lg flex-shrink-0"
              />
              <div className="hidden md:block text-left min-w-0">
                <span className="text-sm font-bold text-white block truncate max-w-[100px] lg:max-w-[120px]">
                  {user?.name}
                </span>
                <p className="text-xs text-white/70 truncate max-w-[100px] lg:max-w-[120px]">
                  {user?.title || user?.role}
                </p>
              </div>
            </motion.button>

            {/* User dropdown menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-500">
                      <p className="text-sm font-bold text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-white/80 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <motion.button
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 rounded-xl transition-all touch-manipulation"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile Settings</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all touch-manipulation disabled:opacity-50 mt-1"
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 dark:border-red-400"></div>
                            <span className="font-medium">Signing out...</span>
                          </>
                        ) : (
                          <>
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign out</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}