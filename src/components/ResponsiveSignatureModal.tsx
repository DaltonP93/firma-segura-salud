
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, CheckCircle, Smartphone, Monitor, Tablet } from 'lucide-react';
import type { Contract } from '@/pages/Index';

interface ResponsiveSignatureModalProps {
  contract: Contract;
  onClose: () => void;
  onUpdateStatus: (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => void;
}

const ResponsiveSignatureModal = ({ contract, onClose, onUpdateStatus }: ResponsiveSignatureModalProps) => {
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bTablet\b)/i.test(userAgent);
    
    if (isMobile && !isTablet) {
      setDeviceType('mobile');
    } else if (isTablet) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }

    // Setup canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCanvasSize = () => {
    switch (deviceType) {
      case 'mobile':
        return { width: 300, height: 150 };
      case 'tablet':
        return { width: 450, height: 200 };
      default:
        return { width: 500, height: 200 };
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        
        let clientX, clientY;
        if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        ctx.moveTo(
          (clientX - rect.left) * scaleX,
          (clientY - rect.top) * scaleY
        );
      }
    }
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let clientX, clientY;
        if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        ctx.lineTo(
          (clientX - rect.left) * scaleX,
          (clientY - rect.top) * scaleY
        );
        ctx.stroke();
      }
    }
  };

  const handleEnd = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
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

  const handleSignContract = async () => {
    if (!signature) {
      toast({
        title: "Firma Requerida",
        description: "Por favor firma el documento antes de continuar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUpdateStatus(contract.id, 'signed', { 
        signatureUrl: signature,
        signedAt: new Date()
      });

      // Simulate completion and email sending
      setTimeout(() => {
        onUpdateStatus(contract.id, 'completed', {
          completedAt: new Date()
        });
        
        toast({
          title: "¡Documento Completado!",
          description: `El documento firmado ha sido enviado por correo a ${contract.clientEmail}`,
        });
      }, 3000);

      toast({
        title: "Documento Firmado",
        description: "El documento ha sido firmado exitosamente. Procesando...",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la firma",
        variant: "destructive",
      });
    }
  };

  const downloadContract = () => {
    toast({
      title: "Descarga Iniciada",
      description: "El documento se está descargando como PDF",
    });
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const canvasSize = getCanvasSize();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`max-w-full max-h-[95vh] overflow-auto ${
        deviceType === 'mobile' ? 'w-[95vw] p-4' : 
        deviceType === 'tablet' ? 'w-[90vw] max-w-2xl' : 
        'max-w-4xl'
      }`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${
            deviceType === 'mobile' ? 'text-lg' : 'text-2xl'
          } text-primary`}>
            {getDeviceIcon()}
            Firmar Documento - {contract.clientName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Device-specific instructions */}
          <div className={`p-4 bg-blue-50 rounded-lg ${deviceType === 'mobile' ? 'text-sm' : ''}`}>
            <p className="text-blue-800">
              {deviceType === 'mobile' && "📱 Optimizado para móvil: Usa tu dedo para firmar en la pantalla"}
              {deviceType === 'tablet' && "📱 Optimizado para tablet: Usa tu dedo o stylus para firmar"}
              {deviceType === 'desktop' && "🖥️ Usa el mouse o pantalla táctil para firmar"}
            </p>
          </div>

          {/* Contract Summary */}
          <Card className="bg-white">
            <CardContent className={`${deviceType === 'mobile' ? 'p-4' : 'p-6'}`}>
              <div className="space-y-4">
                <div className="text-center border-b pb-4">
                  <h1 className={`${deviceType === 'mobile' ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>
                    {contract.templateType === 'contrato' && 'CONTRATO DE SEGURO MÉDICO'}
                    {contract.templateType === 'anexo' && 'ANEXO AL CONTRATO'}
                    {contract.templateType === 'declaracion' && 'DECLARACIÓN JURADA'}
                    {!contract.templateType && 'DOCUMENTO LEGAL'}
                  </h1>
                  <p className="text-gray-600 mt-2">Documento No. {contract.id}</p>
                </div>

                <div className={`grid ${deviceType === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">DATOS DEL CLIENTE</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nombre:</strong> {contract.clientName}</p>
                      <p><strong>Email:</strong> {contract.clientEmail}</p>
                      <p><strong>Teléfono:</strong> {contract.clientPhone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">INFORMACIÓN DEL DOCUMENTO</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Tipo:</strong> {contract.policyType}</p>
                      <p><strong>Fecha:</strong> {contract.createdAt.toLocaleDateString()}</p>
                      <p><strong>Estado:</strong> {contract.status}</p>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    FIRMA DIGITAL
                    {getDeviceIcon()}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma del Cliente:
                      </label>
                      <div className={`border-2 border-dashed border-gray-300 rounded-lg ${
                        deviceType === 'mobile' ? 'p-2' : 'p-4'
                      } bg-gray-50`}>
                        <canvas
                          ref={canvasRef}
                          width={canvasSize.width}
                          height={canvasSize.height}
                          className="w-full signature-pad cursor-crosshair bg-white rounded touch-none"
                          onMouseDown={handleStart}
                          onMouseMove={handleMove}
                          onMouseUp={handleEnd}
                          onMouseLeave={handleEnd}
                          onTouchStart={handleStart}
                          onTouchMove={handleMove}
                          onTouchEnd={handleEnd}
                          style={{ 
                            touchAction: 'none',
                            maxWidth: '100%',
                            height: 'auto'
                          }}
                        />
                        {!signature && (
                          <p className="text-center text-gray-500 text-sm mt-2">
                            {deviceType === 'mobile' ? 'Toca y arrastra para firmar' : 'Haz clic y arrastra para firmar'}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={clearSignature}>
                          Limpiar Firma
                        </Button>
                      </div>
                    </div>

                    <div className={`grid ${deviceType === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-sm bg-gray-50 p-4 rounded`}>
                      <div>
                        <p><strong>Nombre:</strong> {contract.clientName}</p>
                        <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p><strong>Dispositivo:</strong> {deviceType === 'mobile' ? 'Móvil' : deviceType === 'tablet' ? 'Tablet' : 'Escritorio'}</p>
                        <p><strong>IP:</strong> 192.168.1.1</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className={`flex ${deviceType === 'mobile' ? 'flex-col' : 'flex-row'} justify-between gap-4`}>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadContract} size={deviceType === 'mobile' ? 'default' : 'default'}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
            
            <div className={`flex gap-2 ${deviceType === 'mobile' ? 'flex-col' : ''}`}>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {contract.status !== 'signed' && contract.status !== 'completed' && (
                <Button 
                  onClick={handleSignContract} 
                  className="bg-primary hover:bg-primary/90"
                  size={deviceType === 'mobile' ? 'lg' : 'default'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Firmar Documento
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveSignatureModal;
