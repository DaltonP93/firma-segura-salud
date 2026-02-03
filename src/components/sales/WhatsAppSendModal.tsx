import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Check, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalesRequestWithDetails } from './SalesRequestsList';

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SalesRequestWithDetails | null;
}

const messageTemplates = [
  {
    id: 'signature_request',
    name: 'Solicitud de Firma',
    template: 'Hola {nombre}, su solicitud de seguro {numero} está lista para firmar. Por favor ingrese al siguiente enlace para completar el proceso: {enlace}',
  },
  {
    id: 'status_update',
    name: 'Actualización de Estado',
    template: 'Hola {nombre}, le informamos que el estado de su solicitud {numero} ha sido actualizado a: {estado}. Para más información contáctenos.',
  },
  {
    id: 'document_ready',
    name: 'Documento Listo',
    template: 'Hola {nombre}, los documentos de su póliza {tipo_poliza} ya están listos. Puede descargarlos desde el siguiente enlace: {enlace}',
  },
  {
    id: 'reminder',
    name: 'Recordatorio',
    template: 'Hola {nombre}, le recordamos que tiene pendiente completar su solicitud de seguro {numero}. ¿Necesita ayuda con algún paso?',
  },
  {
    id: 'custom',
    name: 'Mensaje Personalizado',
    template: '',
  },
];

const WhatsAppSendModal: React.FC<WhatsAppSendModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('signature_request');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (request && selectedTemplate !== 'custom') {
      const template = messageTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        const filledMessage = template.template
          .replace('{nombre}', request.client_name)
          .replace('{numero}', request.request_number)
          .replace('{estado}', getStatusText(request.status))
          .replace('{tipo_poliza}', request.policy_type)
          .replace('{enlace}', '[enlace de firma]');
        setMessage(filledMessage);
      }
    }
  }, [request, selectedTemplate]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending_health_declaration':
        return 'Pendiente Declaración de Salud';
      case 'pending_signature':
        return 'Pendiente de Firma';
      case 'completed':
        return 'Completado';
      case 'rejected':
        return 'Rechazado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'custom') {
      setMessage('');
    }
  };

  const getWhatsAppUrl = () => {
    if (!request?.client_phone) return '';
    const phone = request.client_phone.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getWhatsAppUrl());
      setCopied(true);
      toast({
        title: "Enlace copiado",
        description: "El enlace de WhatsApp ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppUrl();
    if (url) {
      window.open(url, '_blank');
      toast({
        title: "WhatsApp abierto",
        description: "Se ha abierto WhatsApp Web en una nueva pestaña",
      });
      onClose();
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Enviar por WhatsApp
          </DialogTitle>
          <DialogDescription>
            Envía un mensaje a {request.client_name} ({request.client_phone})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Plantilla de mensaje</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {messageTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="min-h-32 resize-none"
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinatario:</span>
                  <span className="font-medium">{request.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="font-medium">{request.client_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solicitud:</span>
                  <span className="font-medium">{request.request_number}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            disabled={!message || !request.client_phone}
            className="w-full sm:w-auto"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copiado' : 'Copiar Enlace'}
          </Button>
          <Button
            onClick={handleOpenWhatsApp}
            disabled={!message || !request.client_phone}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppSendModal;
