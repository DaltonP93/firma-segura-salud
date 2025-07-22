
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { salesService } from '@/services/salesService';
import type { SalesRequestWithDetails } from '../SalesRequestsList';
import type { SalesRequest, Beneficiary } from '../SalesRequestForm';

export const useSalesRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SalesRequestWithDetails[]>([]);

  useEffect(() => {
    if (user) {
      fetchSalesRequests();
    }
  }, [user]);

  const fetchSalesRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await salesService.fetchSalesRequests();
      console.log('Fetched sales requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching sales requests:', error);
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes de venta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: SalesRequest, beneficiaries: Beneficiary[]) => {
    if (!user) return;

    try {
      setLoading(true);
      const newRequest = await salesService.createSalesRequest(requestData, beneficiaries, user.id);
      
      // Update status to pending health declaration
      await salesService.updateSalesRequestStatus(newRequest.id, 'pending_health_declaration');
      
      toast({
        title: "Éxito",
        description: "Solicitud creada. Completar declaración jurada.",
      });

      // Refresh the list
      await fetchSalesRequests();
      
      return {
        ...newRequest,
        beneficiaries_count: beneficiaries.length
      } as SalesRequestWithDetails;
    } catch (error) {
      console.error('Error creating sales request:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (requestId: string, requestData: SalesRequest, beneficiaries: Beneficiary[]) => {
    if (!user) return;

    try {
      await salesService.updateSalesRequest(requestId, requestData);
      await fetchSalesRequests();
      toast({
        title: "Solicitud Actualizada",
        description: "La solicitud ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error updating sales request:', error);
      throw error;
    }
  };

  const deleteRequest = async (request: SalesRequestWithDetails) => {
    if (!confirm('¿Está seguro de que desea eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);  
      await salesService.deleteSalesRequest(request.id);
      
      toast({
        title: "Éxito",
        description: "Solicitud eliminada correctamente",
      });

      // Refresh the list
      await fetchSalesRequests();
    } catch (error) {
      console.error('Error deleting sales request:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const stats = {
      total: requests.length,
      draft: requests.filter(r => r.status === 'draft').length,
      pending: requests.filter(r => r.status === 'pending_health_declaration' || r.status === 'pending_signature').length,
      completed: requests.filter(r => r.status === 'completed').length,
    };
    return stats;
  };

  return {
    requests,
    loading,
    fetchSalesRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getStats,
  };
};
