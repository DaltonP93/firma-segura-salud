
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Users, Bell, ExternalLink, Clock } from 'lucide-react';
import { Notification } from './NotificationItem';

interface NotificationDetailsProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const getNotificationIcon = (category: string) => {
  switch (category) {
    case 'document':
      return <FileText className="w-5 h-5" />;
    case 'user':
      return <Users className="w-5 h-5" />;
    case 'system':
      return <Bell className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

const NotificationDetails = ({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onAction 
}: NotificationDetailsProps) => {
  if (!notification) return null;

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-full border ${getTypeColor(notification.type)}`}>
              {getNotificationIcon(notification.category)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{notification.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {notification.category}
                </Badge>
              </div>
              {!notification.read && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">No leída</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Mensaje</h4>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </div>

          {notification.details && (
            <div>
              <h4 className="text-sm font-medium mb-2">Detalles</h4>
              <p className="text-sm text-gray-600">{notification.details}</p>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{notification.time}</span>
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              {!notification.read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onMarkAsRead(notification.id);
                  }}
                >
                  Marcar como leída
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {notification.actionUrl && notification.actionText && (
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {notification.actionText}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetails;
