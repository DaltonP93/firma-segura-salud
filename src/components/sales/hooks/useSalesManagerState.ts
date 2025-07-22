
import { useState } from 'react';
import type { SalesRequestWithDetails } from '../SalesRequestsList';

export const useSalesManagerState = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingRequest, setEditingRequest] = useState<SalesRequestWithDetails | null>(null);
  const [viewingRequest, setViewingRequest] = useState<SalesRequestWithDetails | null>(null);
  const [healthDeclarationRequest, setHealthDeclarationRequest] = useState<SalesRequestWithDetails | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureRequest, setSignatureRequest] = useState<SalesRequestWithDetails | null>(null);

  const handleEditRequest = (request: SalesRequestWithDetails) => {
    setEditingRequest(request);
    setActiveTab('edit');
  };

  const handleViewRequest = (request: SalesRequestWithDetails) => {
    setViewingRequest(request);
    setActiveTab('view');
  };

  const handleProcessHealthDeclaration = (request: SalesRequestWithDetails) => {
    setHealthDeclarationRequest(request);
    setActiveTab('health-declaration');
  };

  const handleSendForSignature = (request: SalesRequestWithDetails) => {
    setSignatureRequest(request);
    setSignatureModalOpen(true);
  };

  const handleSignatureSuccess = () => {
    setSignatureModalOpen(false);
    setSignatureRequest(null);
  };

  const handleSignatureCancel = () => {
    setSignatureModalOpen(false);
    setSignatureRequest(null);
  };

  const resetEditingState = () => {
    setEditingRequest(null);
    setActiveTab('list');
  };

  const resetViewingState = () => {
    setViewingRequest(null);
    setActiveTab('list');
  };

  const resetHealthDeclarationState = () => {
    setHealthDeclarationRequest(null);
    setActiveTab('list');
  };

  return {
    activeTab,
    setActiveTab,
    editingRequest,
    viewingRequest,
    healthDeclarationRequest,
    signatureModalOpen,
    signatureRequest,
    handleEditRequest,
    handleViewRequest,
    handleProcessHealthDeclaration,
    handleSendForSignature,
    handleSignatureSuccess,
    handleSignatureCancel,
    resetEditingState,
    resetViewingState,
    resetHealthDeclarationState,
  };
};
