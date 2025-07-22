
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

const SalesNotificationToasts = () => {
  const { toast } = useToast();
  const { notifications } = useNotifications();

  useEffect(() => {
    // Show toast for new unread notifications
    const recentNotifications = notifications.filter(n => 
      !n.read && 
      new Date().getTime() - new Date(n.time).getTime() < 5000 // Last 5 seconds
    );

    recentNotifications.forEach(notification => {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    });
  }, [notifications, toast]);

  return null; // This component doesn't render anything visible
};

export default SalesNotificationToasts;
