import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Notification } from '../../types';
import { useNavigate } from 'react-router-dom';

interface NotificationPopupProps {
  notification: Notification;
  onClose: () => void;
  onRead: (id: string) => void;
}

export function NotificationPopup({ notification, onClose, onRead }: NotificationPopupProps) {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    onRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    handleClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getGradient = () => {
    switch (notification.type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 0 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        y: isExiting ? -50 : 0,
        x: 0
      }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-l-4 ${getBorderColor()} overflow-hidden cursor-pointer group`}
      onClick={handleClick}
    >
      {/* Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        className={`h-1 bg-gradient-to-r ${getGradient()}`}
      />

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="flex-shrink-0"
          >
            {getIcon()}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white pr-2 line-clamp-1">
                {notification.title}
              </h4>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {notification.message}
            </p>

            {/* Action Link */}
            {notification.action_url && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Just now
              </span>
              {!notification.read && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${getGradient()} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}
      />
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  onRead: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose, onRead }: NotificationContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 3).map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationPopup
              notification={notification}
              onClose={() => onClose(notification.id)}
              onRead={onRead}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

