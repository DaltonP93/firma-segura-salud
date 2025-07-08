import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, FileText, User, Mail, Phone, Calendar } from 'lucide-react';

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

interface SignatureViewerProps {
  document: Document;
  onClose: () => void;
}

const SignatureViewer = ({ document, onClose }: SignatureViewerProps) => {
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Visor de Documento - {document.document_number}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Status */}
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(document.status)}>
            {getStatusText(document.status)}
          </Badge>
          {document.total_signers > 0 && (
            <Badge variant="outline">
              {document.completed_signers}/{document.total_signers} firmantes completados
            </Badge>
          )}
        </div>

        {/* Document Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{document.client_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{document.client_email}</span>
              </div>
              {document.client_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{document.client_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalles del Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Número:</span>
                <span className="ml-2">{document.document_number}</span>
              </div>
              <div>
                <span className="font-medium">Tipo de Plantilla:</span>
                <span className="ml-2">{document.template_type || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Tipo de Póliza:</span>
                <span className="ml-2">{document.policy_type || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Creado: {new Date(document.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        {document.total_signers > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progreso de Firmas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Firmantes completados</span>
                  <span>{document.completed_signers} de {document.total_signers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full transition-all flex items-center justify-center text-xs text-white font-medium" 
                    style={{ width: `${Math.max((document.completed_signers / document.total_signers) * 100, 10)}%` }}
                  >
                    {Math.round((document.completed_signers / document.total_signers) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Preview Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa del Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vista Previa del Documento
              </h3>
              <p className="text-gray-500 mb-4">
                El visor de PDF se implementará en la siguiente fase
              </p>
              <Button variant="outline">
                Descargar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button>
            Ir a Solicitud de Firma
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignatureViewer;