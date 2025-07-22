
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Contract } from '@/pages/Index';
import { documentsService } from '@/services/documentsService';

export const useContracts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: contracts = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching contracts...');
      const documents = await documentsService.fetchDocuments();
      console.log('Contracts fetched:', documents.length);
      return documents;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createDocument = async (contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>) => {
    if (!user) return;

    try {
      const data = await documentsService.createDocument(contractData, user.id);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el documento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDocumentStatus = async (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => {
    try {
      await documentsService.updateDocumentStatus(contractId, status);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el documento",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    contracts,
    loading,
    error,
    createDocument,
    updateDocumentStatus,
    refetch,
  };
};
