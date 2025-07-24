
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import ContractStatusCard from './components/ContractStatusCard';
import ContractGenerationCard from './components/ContractGenerationCard';
import type { SalesRequestWithDetails } from './SalesRequestsList';

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

  const generateContract = async () => {
    setGenerating(true);
    
    try {
      // Simulate contract generation based on sales request data
      const defaultContract = `
CONTRATO DE SEGURO

DATOS DEL TITULAR:
- Nombre: ${salesRequest.client_name}
- Email: ${salesRequest.client_email}
- Teléfono: ${salesRequest.client_phone || 'No especificado'}
- DNI/Cédula: ${salesRequest.client_dni || 'No especificado'}

INFORMACIÓN DE LA PÓLIZA:
- Tipo de Póliza: ${salesRequest.policy_type}
- Número de Solicitud: ${salesRequest.request_number}
- Fecha de Solicitud: ${new Date(salesRequest.created_at).toLocaleDateString('es-ES')}

TÉRMINOS Y CONDICIONES:
El presente contrato establece los términos y condiciones del seguro contratado por el titular arriba mencionado.

1. COBERTURA
   La póliza cubre los riesgos especificados en las condiciones particulares según el tipo de póliza seleccionado.

2. VIGENCIA
   El contrato tendrá vigencia desde la fecha de firma y pago de la primera prima.

3. BENEFICIARIOS
   ${salesRequest.beneficiaries_count ? 
     `Se han designado ${salesRequest.beneficiaries_count} beneficiario(s) según se detalla en el anexo.` :
     'No se han designado beneficiarios específicos.'
   }

4. OBLIGACIONES DEL ASEGURADO
   - Pagar las primas en las fechas acordadas
   - Notificar cualquier cambio en las condiciones del riesgo
   - Proporcionar información veraz y completa

5. PROCESO DE RECLAMOS
   En caso de siniestro, el asegurado deberá notificar dentro de los plazos establecidos.

DECLARACIÓN DE SALUD:
${salesRequest.status === 'pending_signature' ? 
  'La declaración de salud ha sido completada y procesada.' :
  'Pendiente de completar declaración de salud.'
}

Este contrato se rige por las leyes aplicables y está sujeto a las condiciones generales de la compañía aseguradora.

Fecha de generación: ${new Date().toLocaleDateString('es-ES')}
      `;

      setContractContent(defaultContract.trim());
      setContractGenerated(true);
      
      toast({
        title: "Contrato Generado",
        description: "El contrato ha sido generado exitosamente. Puede editarlo antes de enviarlo.",
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

  return (
    <div className="space-y-6">
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>1. Complete la declaración de salud del titular</p>
          <p>2. Adjunte todos los documentos necesarios</p>
          <p>3. Genere el contrato usando la información recopilada</p>
          <p>4. Revise y edite el contrato si es necesario</p>
          <p>5. Envíe el contrato para firma digital</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractGenerator;
