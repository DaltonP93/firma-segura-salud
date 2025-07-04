
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import NotificationItem, { Notification } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
}

const NotificationList = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
}: NotificationListProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-80 p-0">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {unreadCount} sin leer
          </p>
        )}
      </div>
      
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No hay notificaciones
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
              onMarkAsRead={onMarkAsRead}
              onRemove={onRemove}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
