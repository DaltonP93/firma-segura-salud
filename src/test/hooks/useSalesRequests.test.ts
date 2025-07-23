
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalesRequests } from '@/components/sales/hooks/useSalesRequests';
import { salesService } from '@/services/salesService';
import { mockSalesRequest, mockSalesRequestForm, mockBeneficiaries, mockUser } from '../utils/mockData';

// Mock the dependencies
vi.mock('@/services/salesService');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock('@/hooks/useSalesNotifications', () => ({
  useSalesNotifications: () => ({
    notifyRequestCreated: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSalesRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salesService.fetchSalesRequests).mockResolvedValue([mockSalesRequest]);
  });

  it('should fetch sales requests on mount', async () => {
    const { result } = renderHook(() => useSalesRequests(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.requests).toHaveLength(1);
    expect(result.current.requests[0]).toEqual(mockSalesRequest);
    expect(salesService.fetchSalesRequests).toHaveBeenCalledTimes(1);
  });

  it('should create a new request successfully', async () => {
    const newRequest = { ...mockSalesRequest, id: 'new-request' };
    vi.mocked(salesService.createSalesRequest).mockResolvedValue(newRequest);
    vi.mocked(salesService.updateSalesRequestStatus).mockResolvedValue(newRequest);

    const { result } = renderHook(() => useSalesRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const createdRequest = await result.current.createRequest(mockSalesRequestForm, mockBeneficiaries);

    expect(salesService.createSalesRequest).toHaveBeenCalledWith(
      mockSalesRequestForm,
      mockBeneficiaries,
      mockUser.id
    );
    expect(salesService.updateSalesRequestStatus).toHaveBeenCalledWith(
      newRequest.id,
      'pending_health_declaration'
    );
    expect(createdRequest).toBeDefined();
  });

  it('should calculate stats correctly', async () => {
    const requests = [
      { ...mockSalesRequest, status: 'draft' },
      { ...mockSalesRequest, id: '2', status: 'pending_health_declaration' },
      { ...mockSalesRequest, id: '3', status: 'completed' },
    ];
    
    vi.mocked(salesService.fetchSalesRequests).mockResolvedValue(requests as any);

    const { result } = renderHook(() => useSalesRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stats = result.current.getStats();
    
    expect(stats.total).toBe(3);
    expect(stats.draft).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.completed).toBe(1);
  });
});
