import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Download, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  PenTool
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  const getStatusInfo = () => {
    switch (salesRequest.status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Contrato Completado'
        };
      case 'pending_signature':
        return {
          icon: Clock,
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          text: 'Listo para Generar Contrato'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Pendiente Proceso Previo'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Estado del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
            </div>
            <div>
              <p className="font-medium">{statusInfo.text}</p>
              {salesRequest.status !== 'pending_signature' && (
                <p className="text-sm text-gray-600">
                  Complete la declaración de salud para generar el contrato
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Generation */}
      {salesRequest.status === 'pending_signature' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generador de Contratos
            </CardTitle>
            <CardDescription>
              Genere el contrato basado en la información de la solicitud y documentos adjuntos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!contractGenerated ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  El contrato se generará automáticamente basándose en:
                </p>
                <ul className="text-sm text-gray-500 mb-6 space-y-1">
                  <li>• Información del titular</li>
                  <li>• Datos de la póliza seleccionada</li>
                  <li>• Beneficiarios registrados</li>
                  <li>• Declaración de salud completada</li>
                  <li>• Documentos adjuntos</li>
                </ul>
                <Button 
                  onClick={generateContract}
                  disabled={generating}
                  className="flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generar Contrato
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-600">Contrato Generado</span>
                  </div>
                  <Badge variant="outline">
                    Editable
                  </Badge>
                </div>
                
                <Textarea
                  value={contractContent}
                  onChange={(e) => setContractContent(e.target.value)}
                  placeholder="Contenido del contrato..."
                  rows={20}
                  className="font-mono text-sm"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadContract}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </Button>
                  <Button
                    onClick={sendForSignature}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar para Firma
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setContractGenerated(false);
                      setContractContent('');
                    }}
                  >
                    Regenerar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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