import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

interface DetailedSalesRequest {
  id: string;
  request_number: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_dni?: string;
  client_birth_date?: string;
  client_address?: string;
  policy_type: string;
  insurance_plan_id?: string;
  template_id?: string;
  client_occupation?: string;
  client_income?: number;
  client_marital_status?: string;
  medical_exams_required?: boolean;
  agent_notes?: string;
  priority_level?: string;
  source?: string;
  status: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  beneficiaries?: any[];
}

interface SalesRequestDetailProps {
  request: DetailedSalesRequest | null;
  onEdit: (request: DetailedSalesRequest) => void;
  onDelete: (request: DetailedSalesRequest) => void;
  onClose: () => void;
}

const SalesRequestDetail: React.FC<SalesRequestDetailProps> = ({ request, onEdit, onDelete, onClose }) => {
  if (!request) {
    return <div className="text-center py-4">No se ha seleccionado ninguna solicitud.</div>;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending_health_declaration': return 'secondary';
      case 'pending_signature': return 'secondary';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Detalles de la Solicitud</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700 block">Nombre del Cliente</span>
            <span className="text-gray-500 block">{request.client_name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Email</span>
            <span className="text-gray-500 block">{request.client_email}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Teléfono</span>
            <span className="text-gray-500 block">{request.client_phone || 'No especificado'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">DNI</span>
            <span className="text-gray-500 block">{request.client_dni || 'No especificado'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Fecha de Nacimiento</span>
            <span className="text-gray-500 block">{request.client_birth_date || 'No especificada'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Dirección</span>
            <span className="text-gray-500 block">{request.client_address || 'No especificada'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Tipo de Póliza</span>
            <span className="text-gray-500 block">{request.policy_type}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Plan de Seguro</span>
            <span className="text-gray-500 block">{request.insurance_plan_id || 'No especificado'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Estado</span>
            <Badge variant={getStatusBadgeVariant(request.status)}>
              {getStatusText(request.status)}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 block">Notas</span>
          <p className="text-gray-500">{request.notes || 'No hay notas adicionales.'}</p>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit({
                ...request,
                insurance_plan_id: request.insurance_plan_id || '',
                status: request.status
              })}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(request)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesRequestDetail;
