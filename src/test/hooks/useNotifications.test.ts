
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationsService } from '@/services/notificationsService';
import { mockNotification } from '../utils/mockData';

// Mock the notifications service
vi.mock('@/services/notificationsService');

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationsService.getUserNotifications).mockResolvedValue([mockNotification]);
  });

  it('should fetch notifications on mount', async () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual(mockNotification);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notification as read', async () => {
    vi.mocked(notificationsService.markAsRead).mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead(mockNotification.id);
    });

    expect(notificationsService.markAsRead).toHaveBeenCalledWith(mockNotification.id);
  });

  it('should mark all notifications as read', async () => {
    vi.mocked(notificationsService.markAllAsRead).mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(notificationsService.markAllAsRead).toHaveBeenCalled();
  });

  it('should remove notification', async () => {
    vi.mocked(notificationsService.removeNotification).mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeNotification(mockNotification.id);
    });

    expect(notificationsService.removeNotification).toHaveBeenCalledWith(mockNotification.id);
  });
});
