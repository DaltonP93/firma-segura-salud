import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Users, BarChart3, Send, Eye, CheckCircle, Bell, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SignatureService } from '@/services/signatureService';
import { documentsService } from '@/services/documentsService';
import SignatureRequestForm from './SignatureRequestForm';
import SignatureRequestsList from './SignatureRequestsList';
import SignatureViewer from './SignatureViewer';
import SignatureReminders from './SignatureReminders';
import SignatureMetricsDashboard from './SignatureMetricsDashboard';
import { Switch } from "@/components/ui/switch";

interface Document {
  id: string;
  document_number: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  template_type?: string;
  policy_type?: string;
  status: string;
  created_at: string;
  signature_request_id?: string;
  total_signers: number;
  completed_signers: number;
}

interface SignatureRequestData {
  title: string;
  message?: string;
  expiresAt?: Date;
  signers: Array<{
    name: string;
    email: string;
    phone?: string;
    role: 'signer' | 'beneficiary' | 'witness' | 'representative';
  }>;
  signatureFields: Array<{
    field_type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
    page_number: number;
    x_position: number;
    y_position: number;
    width: number;
    height: number;
    is_required: boolean;
    placeholder_text?: string;
  }>;
}

const SignatureManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signatureRequests, setSignatureRequests] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [enableWhatsApp, setEnableWhatsApp] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
      loadStatistics();
      
      // Set up periodic cleanup of expired tokens (every 30 minutes)
      const cleanupInterval = setInterval(async () => {
        try {
          const expiredCount = await SignatureService.cleanupExpiredTokens();
          if (expiredCount > 0) {
            console.log(`Cleaned up ${expiredCount} expired tokens`);
          }
        } catch (error) {
          console.error('Error cleaning expired tokens:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(cleanupInterval);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch documents
      const documentsData = await documentsService.fetchDocuments();
      setDocuments(documentsData);
      
      // Fetch signature requests
      const requestsData = await SignatureService.getUserSignatureRequests();
      setSignatureRequests(requestsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!user) return;
    
    try {
      const stats = await SignatureService.getSigningStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreateSignatureRequest = async (
    documentId: string,
    requestData: SignatureRequestData
  ) => {
    if (!user) return;

    try {
      // Create signature request
      const signatureRequest = await SignatureService.createSignatureRequest(
        documentId,
        requestData.title,
        user.id,
        requestData.message,
        requestData.expiresAt
      );

      // Add signers
      await SignatureService.addSigners(
        signatureRequest.id,
        requestData.signers
      );

      // Add signature fields
      await SignatureService.addSignatureFields(
        documentId,
        requestData.signatureFields
      );

      // Update document with signature request ID
      await documentsService.updateDocument(documentId, {
        signature_request_id: signatureRequest.id,
        total_signers: requestData.signers.length,
        status: 'pending_signature'
      });

      await fetchData();
      setActiveTab('list');
      
      toast({
        title: "Solicitud de Firma Creada",
        description: "La solicitud de firma ha sido creada exitosamente",
      });
    } catch (error) {
      console.error('Error creating signature request:', error);
      toast({
        title: "Error",
        description: "Error al crear la solicitud de firma",
        variant: "destructive",
      });
    }
  };

  const handleSendSignatureRequest = async (signatureRequestId: string) => {
    try {
      // Determine notification channels
      const channels: ('email' | 'whatsapp')[] = ['email'];
      if (enableWhatsApp) {
        channels.push('whatsapp');
      }

      // Send with multi-channel notifications
      await SignatureService.sendSignatureRequestWithNotifications(signatureRequestId, channels);
      await fetchData();
      
      const channelText = channels.length > 1 ? 'email y WhatsApp' : 'email';
      toast({
        title: "Solicitud Enviada",
        description: `La solicitud de firma ha sido enviada por ${channelText} a todos los firmantes`,
      });
    } catch (error) {
      console.error('Error sending signature request:', error);
      toast({
        title: "Error",
        description: "Error al enviar la solicitud de firma",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (document: Document) => {
    setViewingDocument(document);
    setActiveTab('viewer');
  };

  const getStats = () => {
    const totalDocuments = documents.length;
    const pendingSignatures = documents.filter(d => d.status === 'pending_signature').length;
    const inProgress = documents.filter(d => d.completed_signers > 0 && d.completed_signers < d.total_signers).length;
    const completed = documents.filter(d => d.status === 'completed').length;

    return {
      total: totalDocuments,
      pending: pendingSignatures,
      inProgress,
      completed,
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Sistema de Firmas Electrónicas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestione documentos y firmas digitales con seguimiento en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="whatsapp-notifications" 
              checked={enableWhatsApp}
              onCheckedChange={setEnableWhatsApp}
            />
            <label htmlFor="whatsapp-notifications" className="text-sm font-medium">
              Notificaciones WhatsApp
            </label>
          </div>
          <Button 
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Solicitud de Firma
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Send className="w-8 h-8 text-yellow-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list">Lista de Documentos</TabsTrigger>
          <TabsTrigger value="create">Crear Solicitud</TabsTrigger>
          <TabsTrigger value="reminders" className="gap-1">
            <Bell className="w-3 h-3" />
            Recordatorios
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1">
            <BarChart3 className="w-3 h-3" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="viewer" disabled={!viewingDocument}>
            Visor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <SignatureRequestsList
            documents={documents}
            signatureRequests={signatureRequests}
            onViewDocument={handleViewDocument}
            onSendRequest={handleSendSignatureRequest}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <SignatureRequestForm
            documents={documents}
            onSubmit={handleCreateSignatureRequest}
            onCancel={() => setActiveTab('list')}
          />
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <SignatureReminders />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <SignatureMetricsDashboard />
        </TabsContent>

        <TabsContent value="viewer" className="mt-6">
          {viewingDocument && (
            <SignatureViewer
              document={viewingDocument}
              onClose={() => {
                setViewingDocument(null);
                setActiveTab('list');
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignatureManager;