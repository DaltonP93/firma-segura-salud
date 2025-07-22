
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Calendar, MapPin } from 'lucide-react';
import type { SalesRequestWithDetails } from '../SalesRequestsList';

interface RequestOverviewCardProps {
  request: SalesRequestWithDetails;
}

const RequestOverviewCard: React.FC<RequestOverviewCardProps> = ({ request }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Número de Solicitud</label>
            <p className="text-sm font-mono">{request.request_number}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tipo de Póliza</label>
            <p className="text-sm">{request.policy_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
            <p className="text-sm">{formatDate(request.created_at)}</p>
          </div>
          {request.notes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Observaciones</label>
              <p className="text-sm mt-1">{request.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen del Titular */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Datos del Titular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{request.client_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">📧</span>
            <span className="text-sm">{request.client_email}</span>
          </div>
          {request.client_phone && (
            <div className="flex items-center gap-2">
              <span className="text-sm">📱</span>
              <span className="text-sm">{request.client_phone}</span>
            </div>
          )}
          {request.client_birth_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{formatDate(request.client_birth_date)}</span>
            </div>
          )}
          {request.client_address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{request.client_address}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestOverviewCard;
