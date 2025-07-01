
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Send, CheckCircle } from 'lucide-react';
import type { Contract } from '@/pages/Index';

interface ContractPreviewProps {
  contract: Contract;
  onClose: () => void;
  onUpdateStatus: (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => void;
}

const ContractPreview = ({ contract, onClose, onUpdateStatus }: ContractPreviewProps) => {
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature('');
      }
    }
  };

  const handleSignContract = () => {
    if (!signature) {
      toast({
        title: "Firma Requerida",
        description: "Por favor firma el contrato antes de continuar",
        variant: "destructive",
      });
      return;
    }

    onUpdateStatus(contract.id, 'signed', { signatureUrl: signature });
    toast({
      title: "Contrato Firmado",
      description: "El contrato ha sido firmado exitosamente",
    });
    onClose();
  };

  const downloadContract = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Descarga Iniciada",
      description: "El contrato se está descargando como PDF",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Contrato de Seguro Médico - {contract.clientName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contract Document */}
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">CONTRATO DE SEGURO MÉDICO</h1>
                  <p className="text-gray-600 mt-2">Contrato No. {contract.id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">DATOS DEL ASEGURADO</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nombre:</strong> {contract.clientName}</p>
                      <p><strong>Email:</strong> {contract.clientEmail}</p>
                      <p><strong>Teléfono:</strong> {contract.clientPhone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">DATOS DE LA PÓLIZA</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tipo de Póliza:</strong> {contract.policyType}</p>
                      <p><strong>Fecha de Emisión:</strong> {contract.createdAt.toLocaleDateString()}</p>
                      <p><strong>Estado:</strong> {contract.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">TÉRMINOS Y CONDICIONES</h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>1. <strong>Cobertura:</strong> Este contrato de seguro médico proporciona cobertura médica integral según el plan seleccionado.</p>
                    <p>2. <strong>Vigencia:</strong> La póliza entrará en vigencia una vez firmada y pagada la primera prima.</p>
                    <p>3. <strong>Beneficiarios:</strong> Los beneficiarios designados tendrán derecho a los beneficios especificados.</p>
                    <p>4. <strong>Exclusiones:</strong> Se aplicarán las exclusiones estándar según la normativa vigente.</p>
                    <p>5. <strong>Renovación:</strong> Este contrato se renovará automáticamente salvo notificación en contrario.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">DECLARACIÓN DE ACEPTACIÓN</h3>
                  <p className="text-sm text-gray-700">
                    Por medio de la presente, declaro que he leído y entendido todos los términos y condiciones de este contrato de seguro médico. 
                    Acepto las condiciones establecidas y autorizo el procesamiento de mis datos personales según la política de privacidad.
                  </p>
                </div>

                {/* Signature Section */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">FIRMA DIGITAL</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma del Asegurado:
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={150}
                          className="w-full signature-pad cursor-crosshair"
                          onMouseDown={handleSignatureStart}
                          onMouseMove={handleSignatureMove}
                          onMouseUp={handleSignatureEnd}
                          onMouseLeave={handleSignatureEnd}
                        />
                        {!signature && (
                          <p className="text-center text-gray-500 text-sm mt-2">
                            Haz clic y arrastra para firmar
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={clearSignature}>
                          Limpiar Firma
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Nombre:</strong> {contract.clientName}</p>
                        <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p><strong>Lugar:</strong> Bogotá, Colombia</p>
                        <p><strong>IP:</strong> 192.168.1.1</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadContract}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {contract.status !== 'signed' && contract.status !== 'completed' && (
                <Button onClick={handleSignContract} className="bg-primary hover:bg-primary/90">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Firmar Contrato
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreview;
