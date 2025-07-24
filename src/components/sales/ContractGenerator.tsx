
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { templatesService } from '@/services/templatesService';
import ContractStatusCard from './components/ContractStatusCard';
import ContractGenerationCard from './components/ContractGenerationCard';
import type { SalesRequestWithDetails } from './SalesRequestsList';
import type { Template } from '@/pages/Index';

interface ContractGeneratorProps {
  salesRequest: SalesRequestWithDetails;
  onContractGenerated?: () => void;
  onSendForSignature?: (request: SalesRequestWithDetails) => void;
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({
  salesRequest,
  onContractGenerated,
  onSendForSignature
}) => {
  const { toast } = useToast();
  const [contractContent, setContractContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [contractGenerated, setContractGenerated] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const templatesData = await templatesService.fetchTemplates();
      setTemplates(templatesData);
      
      // Si la solicitud ya tiene un template asignado, seleccionarlo
      if (salesRequest.template_id) {
        setSelectedTemplate(salesRequest.template_id);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Error al cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const generateContract = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Plantilla Requerida",
        description: "Por favor seleccione una plantilla para generar el contrato",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      
      // Generar contrato basado en la plantilla seleccionada
      const defaultContract = `
${template?.name || 'CONTRATO DE SEGURO'}

DATOS DEL TITULAR:
- Nombre: ${salesRequest.client_name}
- Email: ${salesRequest.client_email}
- Teléfono: ${salesRequest.client_phone || 'No especificado'}
- DNI/Cédula: ${salesRequest.client_dni || 'No especificado'}
- Fecha de Nacimiento: ${salesRequest.client_birth_date || 'No especificada'}
- Dirección: ${salesRequest.client_address || 'No especificada'}

INFORMACIÓN DE LA PÓLIZA:
- Tipo de Póliza: ${salesRequest.policy_type}
- Número de Solicitud: ${salesRequest.request_number}
- Fecha de Solicitud: ${new Date(salesRequest.created_at).toLocaleDateString('es-ES')}
- Plantilla Utilizada: ${template?.name || 'Sin plantilla'}

COBERTURA Y PRIMAS:
- Monto de Cobertura: ${salesRequest.coverage_amount ? `$${salesRequest.coverage_amount.toLocaleString()}` : 'A definir'}
- Prima Mensual: ${salesRequest.monthly_premium ? `$${salesRequest.monthly_premium.toLocaleString()}` : 'A definir'}

BENEFICIARIOS:
${salesRequest.beneficiaries_count ? 
  `Se han designado ${salesRequest.beneficiaries_count} beneficiario(s) según se detalla en el anexo.` :
  'No se han designado beneficiarios específicos.'
}

TÉRMINOS Y CONDICIONES:
${template?.content || `
El presente contrato establece los términos y condiciones del seguro contratado por el titular arriba mencionado.

1. COBERTURA
   La póliza cubre los riesgos especificados en las condiciones particulares según el tipo de póliza seleccionado.

2. VIGENCIA
   El contrato tendrá vigencia desde la fecha de firma y pago de la primera prima.

3. OBLIGACIONES DEL ASEGURADO
   - Pagar las primas en las fechas acordadas
   - Notificar cualquier cambio en las condiciones del riesgo
   - Proporcionar información veraz y completa

4. PROCESO DE RECLAMOS
   En caso de siniestro, el asegurado deberá notificar dentro de los plazos establecidos.
`}

DECLARACIÓN DE SALUD:
${salesRequest.status === 'pending_signature' ? 
  'La declaración de salud ha sido completada y procesada.' :
  'Pendiente de completar declaración de salud.'
}

Este contrato se rige por las leyes aplicables y está sujeto a las condiciones generales de la compañía aseguradora.

Fecha de generación: ${new Date().toLocaleDateString('es-ES')}
Plantilla: ${template?.name || 'Estándar'}
      `;

      setContractContent(defaultContract.trim());
      setContractGenerated(true);
      
      toast({
        title: "Contrato Generado",
        description: "El contrato ha sido generado exitosamente usando la plantilla seleccionada.",
      });

      onContractGenerated?.();
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: "Error",
        description: "Error al generar el contrato",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadContract = () => {
    const blob = new Blob([contractContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-${salesRequest.request_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendForSignature = () => {
    if (!contractContent.trim()) {
      toast({
        title: "Error",
        description: "Debe generar el contrato antes de enviarlo para firma",
        variant: "destructive",
      });
      return;
    }

    onSendForSignature?.(salesRequest);
  };

  const handleRegenerate = () => {
    setContractGenerated(false);
    setContractContent('');
  };

  const sendWhatsAppWithContract = () => {
    const message = `Hola ${salesRequest.client_name}, 

Tu contrato de seguro ${salesRequest.request_number} está listo para firma.

📋 Detalles:
- Tipo: ${salesRequest.policy_type}
- Plantilla: ${templates.find(t => t.id === selectedTemplate)?.name || 'Estándar'}
- Estado: Pendiente de firma digital

Para firmar tu contrato, ingresa al sistema con tu número de solicitud: ${salesRequest.request_number}

¿Necesitas ayuda? ¡Estamos aquí para apoyarte!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${salesRequest.client_phone?.replace(/\D/g, '')}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Abierto",
      description: "Se ha enviado la información del contrato por WhatsApp",
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seleccionar Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una plantilla para el contrato" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTemplate && (
              <div className="text-sm text-gray-600">
                <p><strong>Plantilla seleccionada:</strong> {templates.find(t => t.id === selectedTemplate)?.name}</p>
                <p><strong>Tipo:</strong> {templates.find(t => t.id === selectedTemplate)?.type}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <ContractStatusCard status={salesRequest.status} />

      {/* Contract Generation */}
      {salesRequest.status === 'pending_signature' && (
        <ContractGenerationCard
          contractContent={contractContent}
          contractGenerated={contractGenerated}
          generating={generating}
          onGenerate={generateContract}
          onContentChange={setContractContent}
          onDownload={downloadContract}
          onSendForSignature={sendForSignature}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* WhatsApp Integration */}
      {salesRequest.client_phone && contractGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compartir por WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={sendWhatsAppWithContract} 
              className="w-full"
              variant="outline"
            >
              Enviar información del contrato por WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>1. Seleccione una plantilla para el contrato</p>
          <p>2. Complete la declaración de salud del titular</p>
          <p>3. Genere el contrato usando la plantilla seleccionada</p>
          <p>4. Revise y edite el contrato si es necesario</p>
          <p>5. Envíe el contrato para firma digital</p>
          <p>6. Comparta por WhatsApp los detalles del contrato</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractGenerator;
