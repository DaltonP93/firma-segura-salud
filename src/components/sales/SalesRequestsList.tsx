
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Phone,
  Mail,
  CreditCard,
  Trash2
} from 'lucide-react';
import type { SalesRequest } from './SalesRequestForm';

export interface SalesRequestWithDetails extends SalesRequest {
  id: string;
  request_number: string;
  created_at: string;
  updated_at: string;
  beneficiaries_count?: number;
}

interface SalesRequestsListProps {
  requests: SalesRequestWithDetails[];
  onViewRequest: (request: SalesRequestWithDetails) => void;
  onEditRequest: (request: SalesRequestWithDetails) => void;
  onProcessHealthDeclaration: (request: SalesRequestWithDetails) => void;
  onSendForSignature: (request: SalesRequestWithDetails) => void;
  onDeleteRequest: (request: SalesRequestWithDetails) => void;
  loading?: boolean;
}

const statusConfig = {
  draft: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-800',
    icon: Edit
  },
  pending_health_declaration: {
    label: 'Pendiente Declaración',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle
  },
  pending_signature: {
    label: 'Pendiente Firma',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rechazado',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  }
};

const SalesRequestsList: React.FC<SalesRequestsListProps> = ({
  requests,
  onViewRequest,
  onEditRequest,
  onProcessHealthDeclaration,
  onSendForSignature,
  onDeleteRequest,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>('all');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPolicyType = policyTypeFilter === 'all' || request.policy_type === policyTypeFilter;
    
    return matchesSearch && matchesStatus && matchesPolicyType;
  });

  const uniquePolicyTypes = Array.from(new Set(requests.map(r => r.policy_type)));

  const formatCurrency = (amount?: number) => {
    return amount ? new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount) : 'N/A';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-600">Cargando solicitudes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Solicitudes de Venta ({requests.length})
          </CardTitle>
          <CardDescription>
            Gestione las solicitudes de venta y su procesamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, email o número de solicitud..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={policyTypeFilter} onValueChange={setPolicyTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por póliza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {uniquePolicyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitudes */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {requests.length === 0 ? 'No hay solicitudes' : 'No se encontraron solicitudes'}
            </h3>
            <p className="text-gray-500">
              {requests.length === 0 
                ? 'Cree su primera solicitud de venta'
                : 'Intente ajustar los filtros de búsqueda'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusIcon = statusConfig[request.status || 'draft'].icon;
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.client_name}
                        </h3>
                        <Badge className={statusConfig[request.status || 'draft'].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[request.status || 'draft'].label}
                        </Badge>
                        <Badge variant="outline">
                          {request.request_number}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {request.client_email}
                        </div>
                        {request.client_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {request.client_phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {request.beneficiaries_count || 0} beneficiarios
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span>
                          <strong>Creado:</strong> {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRequest(request)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </Button>
                      
                      {request.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditRequest(request)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                      )}
                      
                      {request.status === 'pending_health_declaration' && (
                        <Button
                          size="sm"
                          onClick={() => onProcessHealthDeclaration(request)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Declaración Salud
                        </Button>
                      )}
                      
                      {request.status === 'pending_signature' && (
                        <Button
                          size="sm"
                          onClick={() => onSendForSignature(request)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Enviar para Firma
                        </Button>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteRequest(request)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesRequestsList;
