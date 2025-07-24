
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { salesService } from '@/services/salesService';

// Components
import SalesHeader from './components/SalesHeader';
import SalesStatsCards from './components/SalesStatsCards';
import SalesTabsNavigation from './components/SalesTabsNavigation';
import SalesRequestForm, { SalesRequest, Beneficiary } from './SalesRequestForm';
import SalesRequestsList from './SalesRequestsList';
import SalesRequestDetail from './SalesRequestDetail';
import HealthDeclarationForm from './HealthDeclarationForm';
import SalesSignatureIntegration from './SalesSignatureIntegration';

// Hooks
import { useSalesRequests } from './hooks/useSalesRequests';
import { useSalesManagerState } from './hooks/useSalesManagerState';
import { useSalesNotifications } from '@/hooks/useSalesNotifications';

const SalesManager = () => {
  const { toast } = useToast();
  const {
    requests,
    loading,
    fetchSalesRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getStats,
  } = useSalesRequests();

  const {
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
  } = useSalesManagerState();

  const {
    notifyRequestCreated,
    notifyHealthDeclarationCompleted,
    notifyDocumentGenerated,
    notifyDocumentSentForSignature,
    notifyStatusChanged,
  } = useSalesNotifications();

  const handleCreateRequest = async (requestData: SalesRequest, beneficiaries: Beneficiary[]) => {
    const newRequest = await createRequest(requestData, beneficiaries);
    if (newRequest) {
      // Send notification for new request
      await notifyRequestCreated(newRequest);
      handleProcessHealthDeclaration(newRequest);
    }
  };

  const handleUpdateRequest = async (requestData: SalesRequest, beneficiaries: Beneficiary[]) => {
    if (!editingRequest) return;
    await updateRequest(editingRequest.id, requestData, beneficiaries);
    resetEditingState();
  };

  const handleHealthDeclarationSubmit = async (answers: Record<string, any>) => {
    if (!healthDeclarationRequest) return;

    try {
      await salesService.createHealthDeclaration(healthDeclarationRequest.id, answers);
      
      // Send notification for completed health declaration
      await notifyHealthDeclarationCompleted(healthDeclarationRequest);
      
      toast({
        title: "Éxito",
        description: "Declaración guardada. Ahora puede gestionar documentos.",
      });

      // Refresh requests
      await fetchSalesRequests();
      
      // Redirect to documents section in detail view 
      const updatedRequest = {
        ...healthDeclarationRequest,
        status: 'pending_signature' as const
      };
      
      // Notify status change
      await notifyStatusChanged(updatedRequest, 'pending_signature');
      
      // Close health declaration and show request detail with documents tab
      resetHealthDeclarationState();
      handleViewRequest(updatedRequest);
    } catch (error) {
      console.error('Error saving health declaration:', error);
      toast({
        title: "Error",
        description: "Error al guardar la declaración de salud",
        variant: "destructive",
      });
    }
  };

  const handleSignatureSuccessWithRefresh = async () => {
    if (signatureRequest) {
      // Send notification for document sent for signature
      await notifyDocumentSentForSignature(signatureRequest);
    }
    
    handleSignatureSuccess();
    await fetchSalesRequests();
    toast({
      title: "Documento Enviado",
      description: "El documento ha sido enviado para firma exitosamente",
    });
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <SalesHeader onCreateNew={() => setActiveTab('create')} />

      {/* Stats Cards */}
      <SalesStatsCards stats={stats} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <SalesTabsNavigation
          viewingRequest={!!viewingRequest}
          editingRequest={!!editingRequest}
          healthDeclarationRequest={!!healthDeclarationRequest}
        />

        <TabsContent value="list" className="mt-6">
          <SalesRequestsList
            requests={requests}
            onViewRequest={handleViewRequest}
            onEditRequest={handleEditRequest}
            onProcessHealthDeclaration={handleProcessHealthDeclaration}
            onSendForSignature={handleSendForSignature}
            onDeleteRequest={deleteRequest}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <SalesRequestForm
            onSubmit={handleCreateRequest}
            onCancel={() => setActiveTab('list')}
          />
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {viewingRequest && (
            <SalesRequestDetail
              request={viewingRequest}
              onBack={resetViewingState}
              onEdit={(request) => {
                handleEditRequest(request);
                resetViewingState();
              }}
              onProcessHealthDeclaration={(request) => {
                handleProcessHealthDeclaration(request);
                resetViewingState();
              }}
              onSendForSignature={handleSendForSignature}
            />
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {editingRequest && (
            <SalesRequestForm
              onSubmit={handleUpdateRequest}
              onCancel={resetEditingState}
              initialData={editingRequest}
              isEditing={true}
            />
          )}
        </TabsContent>

        <TabsContent value="health-declaration" className="mt-6">
          {healthDeclarationRequest && (
            <HealthDeclarationForm
              salesRequest={healthDeclarationRequest}
              onSubmit={handleHealthDeclarationSubmit}
              onCancel={resetHealthDeclarationState}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Signature Integration Modal */}
      <Dialog open={signatureModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleSignatureCancel();
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar para Firma Digital</DialogTitle>
          </DialogHeader>
          {signatureRequest && (
            <SalesSignatureIntegration
              salesRequest={signatureRequest}
              onSuccess={handleSignatureSuccessWithRefresh}
              onCancel={handleSignatureCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesManager;
