
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Download, 
  Send,
  CheckCircle
} from 'lucide-react';

interface ContractGenerationCardProps {
  contractContent: string;
  contractGenerated: boolean;
  generating: boolean;
  onGenerate: () => void;
  onContentChange: (content: string) => void;
  onDownload: () => void;
  onSendForSignature: () => void;
  onRegenerate: () => void;
}

const ContractGenerationCard: React.FC<ContractGenerationCardProps> = ({
  contractContent,
  contractGenerated,
  generating,
  onGenerate,
  onContentChange,
  onDownload,
  onSendForSignature,
  onRegenerate
}) => {
  return (
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
              onClick={onGenerate}
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
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Contenido del contrato..."
              rows={20}
              className="font-mono text-sm"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </Button>
              <Button
                onClick={onSendForSignature}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar para Firma
              </Button>
              <Button
                variant="outline"
                onClick={onRegenerate}
              >
                Regenerar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractGenerationCard;
