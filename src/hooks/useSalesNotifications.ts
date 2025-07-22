
import { useCallback } from 'react';
import { notificationsService } from '@/services/notificationsService';
import type { SalesRequestWithDetails } from '@/components/sales/SalesRequestsList';

export const useSalesNotifications = () => {
  const notifyRequestCreated = useCallback(async (request: SalesRequestWithDetails) => {
    await notificationsService.notifySalesRequestCreated(
      request.request_number,
      request.client_name
    );
  }, []);

  const notifyHealthDeclarationCompleted = useCallback(async (request: SalesRequestWithDetails) => {
    await notificationsService.notifyHealthDeclarationCompleted(
      request.request_number,
      request.client_name
    );
  }, []);

  const notifyDocumentGenerated = useCallback(async (
    request: SalesRequestWithDetails, 
    documentType: string
  ) => {
    await notificationsService.notifyDocumentGenerated(
      request.request_number,
      request.client_name,
      documentType
    );
  }, []);

  const notifyDocumentSentForSignature = useCallback(async (request: SalesRequestWithDetails) => {
    await notificationsService.notifyDocumentSentForSignature(
      request.request_number,
      request.client_name
    );
  }, []);

  const notifyDocumentSigned = useCallback(async (request: SalesRequestWithDetails) => {
    await notificationsService.notifyDocumentSigned(
      request.request_number,
      request.client_name
    );
  }, []);

  const notifyStatusChanged = useCallback(async (
    request: SalesRequestWithDetails, 
    newStatus: string
  ) => {
    await notificationsService.notifyRequestStatusChanged(
      request.request_number,
      request.client_name,
      newStatus
    );
  }, []);

  return {
    notifyRequestCreated,
    notifyHealthDeclarationCompleted,
    notifyDocumentGenerated,
    notifyDocumentSentForSignature,
    notifyDocumentSigned,
    notifyStatusChanged,
  };
};
