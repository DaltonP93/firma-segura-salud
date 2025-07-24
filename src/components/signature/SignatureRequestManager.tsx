import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileSignature, 
  Plus, 
  Send, 
  Eye, 
  Users,
  Calendar,
  Clock
} from 'lucide-react';

interface SignatureRequest {
  id: string;
  title: string;
  message: string;
  status: 'draft' | 'sent' | 'partially_signed' | 'completed' | 'expired' | 'cancelled';
  created_at: string;
  expires_at?: string;
  completed_at?: string;
  total_signers: number;
  completed_signers: number;
}

const SignatureRequestManager = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    message: '',
    expires_at: ''
  });

  const fetchSignatureRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('signature_requests')
        .select(`
          *,
          signers (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requestsWithCounts = (data || []).map(request => ({
        id: request.id,
        title: request.title,
        message: request.message || '',
        status: request.status as 'draft' | 'sent' | 'partially_signed' | 'completed' | 'expired' | 'cancelled',
        created_at: request.created_at,
        expires_at: request.expires_at,
        completed_at: request.completed_at,
        total_signers: request.signers?.length || 0,
        completed_signers: 0 // This would be calculated from signers with status 'signed'
      }));

      setRequests(requestsWithCounts);
    } catch (error) {
      console.error('Error fetching signature requests:', error);
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes de firma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // First create a document (required for signature requests)
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          document_number: `DOC-${Date.now()}`,
          client_name: 'Documento de Firma',
          client_email: 'example@email.com',
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (docError) throw docError;

      // Then create the signature request
      const { data, error } = await supabase
        .from('signature_requests')
        .insert({
          document_id: document.id,
          title: newRequest.title,
          message: newRequest.message,
          expires_at: newRequest.expires_at || null,
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Solicitud de firma creada exitosamente",
      });

      setNewRequest({ title: '', message: '', expires_at: '' });
      setShowCreateForm(false);
      fetchSignatureRequests();
    } catch (error) {
      console.error('Error creating signature request:', error);
      toast({
        title: "Error",
        description: "Error al crear la solicitud de firma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'sent': return 'secondary';
      case 'partially_signed': return 'outline';
      case 'expired': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviado';
      case 'partially_signed': return 'Parcialmente Firmado';
      case 'completed': return 'Completado';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  React.useEffect(() => {
    fetchSignatureRequests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FileSignature className="w-8 h-8" />
          Solicitudes de Firma
        </h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Solicitud de Firma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Contrato de Seguros - Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje para los firmantes</Label>
              <Textarea
                id="message"
                value={newRequest.message}
                onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Por favor revise y firme el documento adjunto..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Fecha de Expiración (Opcional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={newRequest.expires_at}
                onChange={(e) => setNewRequest(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateRequest}
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Solicitud'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Solicitudes ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando solicitudes...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay solicitudes de firma todavía
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        
                        {request.message && (
                          <p className="text-sm text-gray-600">{request.message}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {request.completed_signers}/{request.total_signers} firmantes
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Creado: {new Date(request.created_at).toLocaleDateString()}
                          </div>
                          {request.expires_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Expira: {new Date(request.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                        
                        {request.status === 'draft' && (
                          <Button variant="default" size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureRequestManager;
