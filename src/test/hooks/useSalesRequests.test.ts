
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSalesRequests } from '@/components/sales/hooks/useSalesRequests';
import { salesService } from '@/services/salesService';
import { mockSalesRequest, mockSalesRequestForm, mockBeneficiaries, mockUser } from '../utils/mockData';

// Mock the dependencies
vi.mock('@/services/salesService');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser })
}));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));
vi.mock('@/hooks/useSalesNotifications', () => ({
  useSalesNotifications: () => ({
    notifyRequestCreated: vi.fn(),
    notifyHealthDeclarationCompleted: vi.fn(),
    notifyDocumentGenerated: vi.fn(),
    notifyDocumentSentForSignature: vi.fn(),
    notifyStatusChanged: vi.fn()
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSalesRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch sales requests successfully', async () => {
    const mockFetchSalesRequests = vi.fn().mockResolvedValue([mockSalesRequest]);
    (salesService.fetchSalesRequests as any) = mockFetchSalesRequests;

    const { result } = renderHook(() => useSalesRequests(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.fetchSalesRequests();
    });

    expect(mockFetchSalesRequests).toHaveBeenCalled();
  });

  it('should create a new request successfully', async () => {
    const mockCreateSalesRequest = vi.fn().mockResolvedValue(mockSalesRequest);
    const mockUpdateSalesRequestStatus = vi.fn().mockResolvedValue(mockSalesRequest);
    (salesService.createSalesRequest as any) = mockCreateSalesRequest;
    (salesService.updateSalesRequestStatus as any) = mockUpdateSalesRequestStatus;

    const { result } = renderHook(() => useSalesRequests(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.createRequest(mockSalesRequestForm, mockBeneficiaries);
    });

    expect(mockCreateSalesRequest).toHaveBeenCalledWith(
      mockSalesRequestForm,
      mockBeneficiaries,
      mockUser.id
    );
    expect(mockUpdateSalesRequestStatus).toHaveBeenCalledWith(
      mockSalesRequest.id,
      'pending_health_declaration'
    );
  });

  it('should calculate stats correctly', () => {
    const { result } = renderHook(() => useSalesRequests(), {
      wrapper: createWrapper()
    });

    const stats = result.current.getStats();
    
    expect(stats).toEqual({
      total: 0,
      draft: 0,
      pending: 0,
      completed: 0
    });
  });
});
