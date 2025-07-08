import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  Mail, 
  Eye, 
  Download,
  Activity,
  AlertCircle
} from 'lucide-react';
import { SignatureService } from '@/services/signatureService';
import { useToast } from '@/hooks/use-toast';

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

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

const DocumentViewer = ({ document, onClose }: DocumentViewerProps) => {
  const { toast } = useToast();
  const [signatureRequest, setSignatureRequest] = useState<any>(null);
  const [signers, setSigners] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentDetails();
  }, [document.id]);

  const loadDocumentDetails = async () => {
    try {
      setLoading(true);
      
      if (document.signature_request_id) {
        // Load signature request details
        const requestData = await SignatureService.getSignatureRequestWithDetails(
          document.signature_request_id
        );
        
        if (requestData) {
          setSignatureRequest(requestData);
          setSigners(requestData.signers || []);
        }
        
        // Load document events
        const eventsData = await SignatureService.getDocumentEvents(document.id);
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error loading document details:', error);
      toast({
        title: "Error",
        description: "Error al cargar los detalles del documento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_signature': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending_signature': return 'Pendiente de Firma';
      case 'sent': return 'Enviado';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'expired': return 'Expirado';
      default: return 'Desconocido';
    }
  };

  const getSignerStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'opened': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'signed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'sent': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'opened': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'signed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatEventType = (eventType: string) => {
    switch (eventType) {
      case 'created': return 'Documento creado';
      case 'sent': return 'Enviado para firma';
      case 'opened': return 'Documento abierto';
      case 'signed': return 'Documento firmado';
      case 'completed': return 'Proceso completado';
      case 'declined': return 'Firma rechazada';
      case 'expired': return 'Documento expirado';
      case 'reminded': return 'Recordatorio enviado';
      default: return eventType;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Document Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">{document.document_number}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {document.template_type} - {document.policy_type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(document.status)}>
                {getStatusText(document.status)}
              </Badge>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Información del Cliente
              </h4>
              <div className="space-y-1">
                <p className="font-medium">{document.client_name}</p>
                <p className="text-sm text-muted-foreground">{document.client_email}</p>
                {document.client_phone && (
                  <p className="text-sm text-muted-foreground">{document.client_phone}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Progreso de Firmas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {document.completed_signers} de {document.total_signers} firmantes
                  </span>
                </div>
                {document.total_signers > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${(document.completed_signers / document.total_signers) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Fecha de Creación
              </h4>
              <p className="text-sm">
                {new Date(document.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          {signers.length > 0 && (
            <TabsTrigger value="signers">Firmantes ({signers.length})</TabsTrigger>
          )}
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Información del Documento</CardTitle>
            </CardHeader>
            <CardContent>
              {signatureRequest ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Título de la Solicitud</h4>
                    <p className="text-muted-foreground">{signatureRequest.title}</p>
                  </div>
                  
                  {signatureRequest.message && (
                    <div>
                      <h4 className="font-medium mb-2">Mensaje</h4>
                      <p className="text-muted-foreground">{signatureRequest.message}</p>
                    </div>
                  )}
                  
                  {signatureRequest.expires_at && (
                    <div>
                      <h4 className="font-medium mb-2">Fecha de Expiración</h4>
                      <p className="text-muted-foreground">
                        {new Date(signatureRequest.expires_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Documento sin solicitud de firma
                  </h3>
                  <p className="text-muted-foreground">
                    Este documento aún no tiene una solicitud de firma asociada.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {signers.length > 0 && (
          <TabsContent value="signers">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Firmantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signers.map((signer, index) => (
                    <div 
                      key={signer.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getSignerStatusIcon(signer.status)}
                          <span className="font-medium">{signer.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{signer.email}</p>
                          <p>Rol: {signer.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {getStatusText(signer.status)}
                        </Badge>
                        {signer.signed_at && (
                          <p className="text-xs text-muted-foreground">
                            Firmado: {new Date(signer.signed_at).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando actividad...</p>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="mt-0.5">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{formatEventType(event.event_type)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {event.signers && (
                          <p className="text-sm text-muted-foreground">
                            {event.signers.name} ({event.signers.email})
                          </p>
                        )}
                        {event.event_data && Object.keys(event.event_data).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(event.event_data)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Sin actividad registrada
                  </h3>
                  <p className="text-muted-foreground">
                    No hay eventos registrados para este documento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Descargar PDF
        </Button>
        {signatureRequest && signatureRequest.status === 'draft' && (
          <Button>
            <Mail className="w-4 h-4 mr-2" />
            Enviar para Firma
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;