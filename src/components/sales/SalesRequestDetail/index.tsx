import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Users, 
  FileText, 
  Send, 
  Clock,
  Shield
} from 'lucide-react';
import ClientInfoTab from './ClientInfoTab';
import BeneficiariesTab from './BeneficiariesTab';
import DocumentsTab from './DocumentsTab';
import SendingPanel from './SendingPanel';
import type { SalesRequestWithDetails } from '../SalesRequestsList';

interface SalesRequestDetailIndexProps {
  request: SalesRequestWithDetails;
  onEdit: (request: SalesRequestWithDetails) => void;
  onDelete: (request: SalesRequestWithDetails) => void;
  onBack: () => void;
}

const SalesRequestDetailIndex: React.FC<SalesRequestDetailIndexProps> = ({ 
  request, 
  onEdit, 
  onDelete, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState('client');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'draft': return 'bg-muted-foreground';
      case 'pending_health_declaration': return 'bg-amber-500';
      case 'pending_signature': return 'bg-sky-500';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending_health_declaration': return 'Pendiente Declaración';
      case 'pending_signature': return 'Pendiente Firma';
      case 'completed': return 'Completado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  // Mock documents for sending panel (would come from API)
  const mockDocuments = [
    { id: '1', name: 'Contrato de Seguro', ready: true },
    { id: '2', name: 'Declaración Jurada de Salud', ready: true },
    { id: '3', name: 'Anexo de Beneficiarios', ready: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">{request.client_name}</h1>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Solicitud: {request.request_number} • 
                  Creada: {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(request)}>
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive"
                onClick={() => onDelete(request)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Póliza</p>
                <p className="font-medium">{request.policy_type || 'No especificado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cobertura</p>
                <p className="font-medium">
                  {request.coverage_amount 
                    ? `$${request.coverage_amount.toLocaleString()}`
                    : 'No especificada'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prima Mensual</p>
                <p className="font-medium">
                  {request.monthly_premium 
                    ? `$${request.monthly_premium.toLocaleString()}`
                    : 'No especificada'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Beneficiarios</p>
                <p className="font-medium">{request.beneficiaries_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="client" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Cliente</span>
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Beneficiarios</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="mt-4">
          <ClientInfoTab request={request} />
        </TabsContent>

        <TabsContent value="beneficiaries" className="mt-4">
          <BeneficiariesTab requestId={request.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsTab requestId={request.id} clientName={request.client_name} />
        </TabsContent>

        <TabsContent value="send" className="mt-4">
          <SendingPanel request={request} documents={mockDocuments} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesRequestDetailIndex;
