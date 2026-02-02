import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, Mail, Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildWhatsAppLinks, buildSignatureMessage, copyWhatsAppLink, openWhatsApp } from '@/utils/whatsappHelper';
import type { SalesRequestWithDetails } from '../SalesRequestsList';

interface SendingPanelProps {
  request: SalesRequestWithDetails;
  documents: Array<{ id: string; name: string; ready: boolean }>;
}

const SendingPanel: React.FC<SendingPanelProps> = ({ request, documents }) => {
  const { toast } = useToast();
  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    documents.filter(d => d.ready).map(d => d.id)
  );
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const readyDocuments = documents.filter(d => d.ready);
  
  // Generate signing URL (placeholder - would be real URL in production)
  const signUrl = `${window.location.origin}/sign/${request.id}`;

  const message = buildSignatureMessage({
    clientName: request.client_name,
    requestNumber: request.request_number || 'N/A',
    signUrl,
    documents: readyDocuments.filter(d => selectedDocs.includes(d.id)).map(d => d.name)
  });

  const handleToggleDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleCopyLink = async () => {
    if (!request.client_phone) {
      toast({
        title: "Error",
        description: "El cliente no tiene teléfono registrado",
        variant: "destructive"
      });
      return;
    }

    const success = await copyWhatsAppLink(request.client_phone, message);
    if (success) {
      setCopied(true);
      toast({
        title: "Enlace copiado",
        description: "El enlace de WhatsApp ha sido copiado al portapapeles"
      });
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
  };

  const handleOpenWhatsApp = () => {
    if (!request.client_phone) {
      toast({
        title: "Error",
        description: "El cliente no tiene teléfono registrado",
        variant: "destructive"
      });
      return;
    }

    openWhatsApp(request.client_phone, message);
    toast({
      title: "WhatsApp abierto",
      description: "Se ha abierto WhatsApp con el mensaje prellenado"
    });
  };

  const handleSendEmail = () => {
    if (!request.client_email) {
      toast({
        title: "Error",
        description: "El cliente no tiene email registrado",
        variant: "destructive"
      });
      return;
    }

    // Abrir cliente de email
    const subject = encodeURIComponent(`Documentos de firma - ${request.request_number}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:${request.client_email}?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Email preparado",
      description: "Se ha abierto tu cliente de email con el mensaje"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Enviar al Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Documentos listos para enviar */}
        <div>
          <Label className="text-sm font-medium">Documentos a enviar</Label>
          <div className="mt-2 space-y-2">
            {readyDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay documentos listos para enviar. Marca al menos un documento como "Listo".
              </p>
            ) : (
              readyDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2 border rounded">
                  <Checkbox
                    id={doc.id}
                    checked={selectedDocs.includes(doc.id)}
                    onCheckedChange={() => handleToggleDoc(doc.id)}
                  />
                  <label htmlFor={doc.id} className="text-sm cursor-pointer flex-1">
                    {doc.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vista previa del mensaje */}
        <div>
          <Label className="text-sm font-medium">Vista previa del mensaje</Label>
          <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Teléfono</Label>
            <p className="font-medium">{request.client_phone || 'No registrado'}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="font-medium">{request.client_email || 'No registrado'}</p>
          </div>
        </div>

        {/* Acciones de envío */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleOpenWhatsApp}
            disabled={!request.client_phone || selectedDocs.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Abrir WhatsApp
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            disabled={!request.client_phone || selectedDocs.length === 0}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleSendEmail}
            disabled={!request.client_email || selectedDocs.length === 0}
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar Email
          </Button>
        </div>

        {/* Link directo */}
        <div className="pt-4 border-t">
          <Label className="text-xs text-muted-foreground">Link de firma</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input 
              readOnly 
              value={signUrl}
              className="text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(signUrl);
                toast({ title: "Copiado", description: "Link copiado al portapapeles" });
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(signUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendingPanel;
