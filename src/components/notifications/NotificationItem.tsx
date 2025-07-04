
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, FileText, Users, Bell } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'document' | 'system' | 'user' | 'general';
  details?: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const getNotificationIcon = (category: string) => {
  switch (category) {
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'user':
      return <Users className="w-4 h-4" />;
    case 'system':
      return <Bell className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-blue-600 bg-blue-50';
  }
};

const NotificationItem = ({ notification, onClick, onMarkAsRead, onRemove }: NotificationItemProps) => {
  return (
    <div
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1 rounded-full ${getTypeColor(notification.type)}`}>
              {getNotificationIcon(notification.category)}
            </div>
            <h4 className="text-sm font-medium">{notification.title}</h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            <Badge variant="secondary" className="text-xs">
              {notification.category}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
          <p className="text-xs text-gray-400">{notification.time}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="h-6 w-6 p-0"
              title="Marcar como leída"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            className="h-6 w-6 p-0"
            title="Eliminar"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
