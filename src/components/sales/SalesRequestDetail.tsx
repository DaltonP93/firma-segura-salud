
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Eye, FileText, Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SalesRequestWithDetails } from './SalesRequestsList';

interface SalesRequestDetailProps {
  request: SalesRequestWithDetails;
  onEdit: (request: SalesRequestWithDetails) => void;
  onDelete: (request: SalesRequestWithDetails) => void;
  onBack: () => void;
}

const SalesRequestDetail: React.FC<SalesRequestDetailProps> = ({ request, onEdit, onDelete, onBack }) => {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'draft': return 'secondary';
      case 'pending_health_declaration': return 'secondary';
      case 'pending_signature': return 'secondary';
      case 'rejected': return 'destructive';
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
      default: return status;
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Hola ${request.client_name}, 

Tu solicitud de seguro ${request.request_number} está en progreso.

Para completar tu solicitud, necesitas:
1. Completar la declaración de salud
2. Revisar y firmar los documentos

${request.template_name ? `Plantilla: ${request.template_name}` : ''}

Para continuar, ingresa al sistema con tu número de solicitud: ${request.request_number}

¡Gracias por confiar en nosotros!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${request.client_phone?.replace(/\D/g, '')}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Abierto",
      description: "Se ha abierto WhatsApp con la información de la solicitud",
    });
  };

  const handleGenerateHealthDeclaration = () => {
    toast({
      title: "Generando Declaración",
      description: "Se está generando la declaración de salud...",
    });
    // Aquí iría la lógica para generar la declaración de salud
  };

  const handleGenerateContract = () => {
    toast({
      title: "Generando Contrato",
      description: "Se está generando el contrato basado en la plantilla...",
    });
    // Aquí iría la lógica para generar el contrato
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Detalles de la Solicitud</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              Cerrar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant={getStatusColor(request.status)}>
              {getStatusText(request.status)}
            </Badge>
            <span className="text-sm text-gray-600">
              Solicitud: {request.request_number}
            </span>
          </div>
          <div className="flex gap-2">
            {request.client_phone && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateHealthDeclaration}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Declaración
            </Button>
            {request.template_name && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateContract}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Contrato
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Client Information */}
        <div>
          <h3 className="font-semibold mb-4">Información del Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <p className="text-sm">{request.client_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-sm">{request.client_email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Teléfono</label>
              <p className="text-sm">{request.client_phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">DNI/Cédula</label>
              <p className="text-sm">{request.client_dni || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
              <p className="text-sm">{request.client_birth_date || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Dirección</label>
              <p className="text-sm">{request.client_address || 'No especificada'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Policy Information */}
        <div>
          <h3 className="font-semibold mb-4">Información de la Póliza</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Póliza</label>
              <p className="text-sm">{request.policy_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Plantilla</label>
              <p className="text-sm">{request.template_name || 'No asignada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Monto de Cobertura</label>
              <p className="text-sm">{request.coverage_amount ? `$${request.coverage_amount.toLocaleString()}` : 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Prima Mensual</label>
              <p className="text-sm">{request.monthly_premium ? `$${request.monthly_premium.toLocaleString()}` : 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Beneficiarios</label>
              <p className="text-sm">{request.beneficiaries_count} beneficiario(s)</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notes */}
        {request.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notas</h3>
            <p className="text-sm bg-gray-50 p-3 rounded">{request.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(request)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(request)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesRequestDetail;
