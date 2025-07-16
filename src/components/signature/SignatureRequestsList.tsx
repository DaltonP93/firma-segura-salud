import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Eye, FileText, Clock, CheckCircle, Users } from 'lucide-react';

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

interface SignatureRequestsListProps {
  documents: Document[];
  signatureRequests: any[];
  onViewDocument: (document: Document) => void;
  onSendRequest: (signatureRequestId: string) => void;
  loading: boolean;
}

const SignatureRequestsList = ({ 
  documents, 
  signatureRequests, 
  onViewDocument, 
  onSendRequest, 
  loading 
}: SignatureRequestsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Helper function to safely check string inclusion
  const safeStringIncludes = (str: string | null | undefined, searchTerm: string): boolean => {
    if (!str) {
      console.warn('SignatureRequestsList: Found null/undefined string value:', str);
      return false;
    }
    return str.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = safeStringIncludes(document.client_name, searchTerm) ||
                         safeStringIncludes(document.client_email, searchTerm) ||
                         safeStringIncludes(document.document_number, searchTerm);
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_signature': return 'bg-yellow-100 text-yellow-800';
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
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'expired': return 'Expirado';
      default: return 'Desconocido';
    }
  };

  const getProgressText = (document: Document) => {
    if (document.total_signers === 0) return 'Sin firmantes';
    return `${document.completed_signers}/${document.total_signers} firmantes`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando documentos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl text-primary">Documentos y Solicitudes de Firma</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar por nombre, email o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="pending_signature">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? 'No hay documentos' : 'No se encontraron documentos'}
            </h3>
            <p className="text-gray-500">
              {documents.length === 0 
                ? 'Cree su primer documento en la pestaña "Crear Solicitud"'
                : 'Intente ajustar los filtros de búsqueda'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {document.document_number}
                      </h3>
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusText(document.status)}
                      </Badge>
                      {document.total_signers > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {getProgressText(document)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                      <p><strong>Cliente:</strong> {document.client_name}</p>
                      <p><strong>Email:</strong> {document.client_email}</p>
                      <p><strong>Tipo:</strong> {document.template_type || 'N/A'}</p>
                      <p><strong>Póliza:</strong> {document.policy_type || 'N/A'}</p>
                      <p><strong>Teléfono:</strong> {document.client_phone || 'N/A'}</p>
                      <p><strong>Creado:</strong> {new Date(document.created_at).toLocaleDateString()}</p>
                    </div>

                    {/* Progress Bar for Multi-Signer Documents */}
                    {document.total_signers > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progreso de Firmas</span>
                          <span>{Math.round((document.completed_signers / document.total_signers) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${(document.completed_signers / document.total_signers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDocument(document)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Documento
                    </Button>
                    
                    {document.status === 'draft' && !document.signature_request_id && (
                      <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        <Clock className="w-3 h-3" />
                        Listo para Solicitud
                      </Badge>
                    )}
                    
                    {document.status === 'pending_signature' && document.signature_request_id && (
                      <Button
                        size="sm"
                        onClick={() => onSendRequest(document.signature_request_id!)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4" />
                        Enviar Solicitud
                      </Button>
                    )}
                    
                    {document.status === 'completed' && (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-600 px-3 py-1">
                        <CheckCircle className="w-3 h-3" />
                        Firmado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignatureRequestsList;