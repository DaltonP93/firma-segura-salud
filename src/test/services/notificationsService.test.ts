
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationsService } from '@/services/notificationsService';
import { mockNotification } from '../utils/mockData';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('NotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('createNotification', () => {
    it('should create a notification and store it in localStorage', async () => {
      const existingNotifications = [mockNotification];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingNotifications));

      const newNotificationData = {
        title: 'Test Notification',
        message: 'Test message',
        type: 'success' as const,
        category: 'system' as const,
      };

      const result = await notificationsService.createNotification(newNotificationData);

      expect(result).toMatchObject({
        title: 'Test Notification',
        message: 'Test message',
        type: 'success',
        category: 'system',
        read: false,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notifications',
        expect.stringContaining('"title":"Test Notification"')
      );
    });
  });

  describe('getUserNotifications', () => {
    it('should return notifications from localStorage', async () => {
      const notifications = [mockNotification];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(notifications));

      const result = await notificationsService.getUserNotifications();

      expect(result).toEqual(notifications);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('notifications');
    });

    it('should return empty array when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await notificationsService.getUserNotifications();

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notifications = [mockNotification, { ...mockNotification, id: 'notification-2' }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(notifications));

      await notificationsService.markAsRead(mockNotification.id);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notifications',
        expect.stringContaining('"read":true')
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const notifications = [
        mockNotification,
        { ...mockNotification, id: 'notification-2', read: false },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(notifications));

      await notificationsService.markAllAsRead();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const updatedNotifications = JSON.parse(setItemCall[1]);
      
      expect(updatedNotifications.every((n: any) => n.read === true)).toBe(true);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification from localStorage', async () => {
      const notifications = [
        mockNotification,
        { ...mockNotification, id: 'notification-2' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(notifications));

      await notificationsService.removeNotification(mockNotification.id);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const updatedNotifications = JSON.parse(setItemCall[1]);
      
      expect(updatedNotifications).toHaveLength(1);
      expect(updatedNotifications[0].id).toBe('notification-2');
    });
  });
});
