
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Send, 
  Users, 
  Calendar,
  Download,
  Share2,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SalesRequestWithDetails {
  id: string;
  request_number: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_dni?: string;
  client_birth_date?: string;
  client_address?: string;
  policy_type: string;
  coverage_amount?: number;
  monthly_premium?: number;
  status: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected' | 'cancelled';
  notes?: string;
  template_id?: string;
  template_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  beneficiaries_count: number;
}

interface SalesRequestsListProps {
  requests: SalesRequestWithDetails[];
  onViewRequest: (request: SalesRequestWithDetails) => void;
  onEditRequest: (request: SalesRequestWithDetails) => void;
  onProcessHealthDeclaration: (request: SalesRequestWithDetails) => void;
  onSendForSignature: (request: SalesRequestWithDetails) => void;
  onDeleteRequest: (request: SalesRequestWithDetails) => void;
  loading: boolean;
}

const SalesRequestsList = ({
  requests,
  onViewRequest,
  onEditRequest,
  onProcessHealthDeclaration,
  onSendForSignature,
  onDeleteRequest,
  loading
}: SalesRequestsListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending_signature': return 'secondary';
      case 'pending_health_declaration': return 'outline';
      case 'rejected': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending_health_declaration': return 'Pendiente Declaración';
      case 'pending_signature': return 'Pendiente Firma';
      case 'completed': return 'Completado';
      case 'rejected': return 'Rechazado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleDownloadSignedPDF = async (request: SalesRequestWithDetails) => {
    // This will be implemented to download the signed PDF
    try {
      // Placeholder for signed PDF download functionality
      toast({
        title: "Descarga en desarrollo",
        description: "La funcionalidad de descarga del PDF firmado estará disponible pronto",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al descargar el documento firmado",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = async (request: SalesRequestWithDetails) => {
    try {
      const message = `Hola ${request.client_name}, su solicitud de seguro ${request.request_number} está lista. Estado: ${getStatusText(request.status)}`;
      const whatsappUrl = `https://wa.me/${request.client_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "WhatsApp Abierto",
        description: "Se ha abierto WhatsApp con el mensaje predefinido",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al abrir WhatsApp",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-500">Cargando solicitudes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Solicitudes de Venta ({requests.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por nombre, número o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="pending_health_declaration">Pendiente Declaración</SelectItem>
              <SelectItem value="pending_signature">Pendiente Firma</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron solicitudes con los filtros aplicados'
              : 'No hay solicitudes de venta todavía'
            }
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{request.client_name}</h3>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>📋 {request.request_number}</div>
                        <div>📧 {request.client_email}</div>
                        <div>🏥 {request.policy_type}</div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {request.beneficiaries_count} beneficiario(s)
                        </div>
                      </div>

                      {request.template_name && (
                        <div className="text-sm text-blue-600">
                          📄 Plantilla: {request.template_name}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Creado: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditRequest(request)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>

                      {request.status === 'draft' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onProcessHealthDeclaration(request)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Declaración
                        </Button>
                      )}

                      {request.status === 'pending_signature' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onSendForSignature(request)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Enviar Firma
                        </Button>
                      )}

                      {request.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadSignedPDF(request)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar PDF
                        </Button>
                      )}

                      {request.client_phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareWhatsApp(request)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteRequest(request)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesRequestsList;
