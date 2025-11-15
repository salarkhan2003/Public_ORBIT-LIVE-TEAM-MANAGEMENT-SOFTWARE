import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationContainer } from '../components/Shared/NotificationPopup';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (
    userId: string,
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error',
    actionUrl?: string
  ) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  } = useNotifications();

  const [popupNotifications, setPopupNotifications] = useState<Notification[]>([]);

  // Show new notifications as popups
  useEffect(() => {
    const newUnread = notifications.filter(n => !n.read);

    // Only show notifications that weren't in the previous state
    const recentNew = newUnread.filter(n => {
      const createdTime = new Date(n.created_at).getTime();
      const now = Date.now();
      // Only show notifications created in the last 10 seconds
      return now - createdTime < 10000;
    });

    if (recentNew.length > 0) {
      setPopupNotifications(prev => {
        const existingIds = prev.map(p => p.id);
        const toAdd = recentNew.filter(n => !existingIds.includes(n.id));
        return [...prev, ...toAdd];
      });
    }
  }, [notifications]);

  const handleClosePopup = (id: string) => {
    setPopupNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleReadPopup = async (id: string) => {
    await markAsRead(id);
    handleClosePopup(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification
      }}
    >
      {children}
      <NotificationContainer
        notifications={popupNotifications}
        onClose={handleClosePopup}
        onRead={handleReadPopup}
      />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

