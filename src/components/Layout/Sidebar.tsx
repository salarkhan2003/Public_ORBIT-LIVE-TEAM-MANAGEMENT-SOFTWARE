import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  FileText,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  Bot,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Assistant', href: '/ai', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed on mobile, Static on desktop */}
      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static
          inset-y-0 left-0 z-50
          w-64 sm:w-72
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          shadow-2xl lg:shadow-none
          flex flex-col
          transition-transform duration-300 ease-in-out lg:transition-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                ORBIT LIVE
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Team Management
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation - scrollable area */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 overscroll-contain">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - pinned to bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 ORBIT LIVE TEAM
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Developed by <span className="font-medium text-blue-600 dark:text-blue-400">Salarkhan Patan</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}