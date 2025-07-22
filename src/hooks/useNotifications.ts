
import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '@/services/notificationsService';
import type { Notification } from '@/components/notifications/NotificationItem';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const userNotifications = await notificationsService.getUserNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Set up an interval to refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Listen for localStorage changes (notifications from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        fetchNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [fetchNotifications]);

  const removeNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.removeNotification(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: fetchNotifications,
  };
};
