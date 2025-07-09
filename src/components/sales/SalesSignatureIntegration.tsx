import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Users, 
  FileText, 
  Check, 
  X,
  AlertCircle,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { SignatureService } from '@/services/signatureService';
import { documentsService } from '@/services/documentsService';

interface SalesSignatureIntegrationProps {
  salesRequest: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SignerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'signer' | 'beneficiary' | 'witness' | 'representative';
}

const SalesSignatureIntegration: React.FC<SalesSignatureIntegrationProps> = ({
  salesRequest,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'signers' | 'preview' | 'sending'>('setup');
  
  // Document and signature request data
  const [documentTitle, setDocumentTitle] = useState(`Contrato de Seguro - ${salesRequest.client_name}`);
  const [message, setMessage] = useState('Por favor revise y firme el documento adjunto.');
  const [expiresIn, setExpiresIn] = useState(7); // days
  
  // Signers data
  const [signers, setSigners] = useState<SignerData[]>([
    {
      id: '1',
      name: salesRequest.client_name,
      email: salesRequest.client_email,
      phone: salesRequest.client_phone,
      role: 'signer'
    }
  ]);

  // Add beneficiaries as signers if they exist
  React.useEffect(() => {
    if (salesRequest.beneficiaries && salesRequest.beneficiaries.length > 0) {
      const beneficiarySigners = salesRequest.beneficiaries
        .filter((b: any) => b.email) // Only include beneficiaries with email
        .map((b: any, index: number) => ({
          id: `beneficiary-${index}`,
          name: b.name,
          email: b.email,
          phone: b.phone,
          role: 'beneficiary' as const
        }));
      
      setSigners(prev => [...prev, ...beneficiarySigners]);
    }
  }, [salesRequest.beneficiaries]);

  const addSigner = () => {
    const newSigner: SignerData = {
      id: `signer-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      role: 'signer'
    };
    setSigners([...signers, newSigner]);
  };

  const updateSigner = (id: string, updates: Partial<SignerData>) => {
    setSigners(prev => prev.map(signer => 
      signer.id === id ? { ...signer, ...updates } : signer
    ));
  };

  const removeSigner = (id: string) => {
    setSigners(prev => prev.filter(signer => signer.id !== id));
  };

  const generateDocument = async () => {
    try {
      setLoading(true);
      
      // Generate PDF document based on sales request
      const documentData = {
        client_name: salesRequest.client_name,
        client_email: salesRequest.client_email,
        client_phone: salesRequest.client_phone,
        client_dni: salesRequest.client_dni,
        client_address: salesRequest.client_address,
        policy_type: salesRequest.policy_type,
        coverage_amount: salesRequest.coverage_amount,
        monthly_premium: salesRequest.monthly_premium,
        beneficiaries: salesRequest.beneficiaries,
        template_type: 'insurance_contract'
      };

      // Create document in database
      const document = await documentsService.createDocument({
        clientName: salesRequest.client_name,
        clientEmail: salesRequest.client_email,
        clientPhone: salesRequest.client_phone,
        policyType: salesRequest.policy_type,
        templateType: 'contrato'
      }, salesRequest.created_by);

      return document;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendForSignature = async () => {
    try {
      setLoading(true);
      setStep('sending');

      // Generate document
      const document = await generateDocument();

      // Create signature request
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);

      const signatureRequest = await SignatureService.createSignatureRequest(
        document.id,
        documentTitle,
        salesRequest.created_by,
        message,
        expiresAt
      );

      // Add signers
      const signersData = signers.map(signer => ({
        name: signer.name,
        email: signer.email,
        phone: signer.phone || '',
        role: signer.role
      }));

      await SignatureService.addSigners(signatureRequest.id, signersData);

      // Add default signature fields
      const signatureFields = [
        {
          field_type: 'signature' as const,
          page_number: 1,
          x_position: 100,
          y_position: 600,
          width: 200,
          height: 80,
          is_required: true,
          placeholder_text: 'Firma del titular'
        }
      ];

      await SignatureService.addSignatureFields(document.id, signatureFields);

      // Update sales request status
      await documentsService.updateDocument(document.id, {
        signature_request_id: signatureRequest.id,
        total_signers: signers.length,
        status: 'pending_signature'
      });

      // Send signature request via email
      await SignatureService.sendSignatureRequestWithNotifications(
        signatureRequest.id, 
        ['email']
      );

      toast({
        title: "Enviado para Firma",
        description: "El documento ha sido enviado exitosamente para firma digital",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error sending for signature:', error);
      toast({
        title: "Error",
        description: "Error al enviar el documento para firma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="document-title">Título del Documento</Label>
        <Input
          id="document-title"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Título del documento"
        />
      </div>

      <div>
        <Label htmlFor="message">Mensaje para Firmantes</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensaje que recibirán los firmantes"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="expires-in">Vencimiento (días)</Label>
        <Input
          id="expires-in"
          type="number"
          value={expiresIn}
          onChange={(e) => setExpiresIn(parseInt(e.target.value))}
          min="1"
          max="30"
        />
        <p className="text-sm text-gray-600 mt-1">
          El documento expirará en {expiresIn} días
        </p>
      </div>
    </div>
  );

  const renderSignersStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Firmantes ({signers.length})</h3>
        <Button onClick={addSigner} variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar Firmante
        </Button>
      </div>

      <div className="space-y-4">
        {signers.map((signer, index) => (
          <Card key={signer.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge variant={signer.role === 'signer' ? 'default' : 'secondary'}>
                    {signer.role === 'signer' ? 'Titular' : 
                     signer.role === 'beneficiary' ? 'Beneficiario' : 
                     signer.role === 'witness' ? 'Testigo' : 'Representante'}
                  </Badge>
                  <span className="text-sm text-gray-600">#{index + 1}</span>
                </div>
                {index > 0 && (
                  <Button
                    onClick={() => removeSigner(signer.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo</Label>
                  <Input
                    value={signer.name}
                    onChange={(e) => updateSigner(signer.id, { name: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={signer.email}
                    onChange={(e) => updateSigner(signer.id, { email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <Label>Teléfono (opcional)</Label>
                  <Input
                    value={signer.phone || ''}
                    onChange={(e) => updateSigner(signer.id, { phone: e.target.value })}
                    placeholder="Teléfono"
                  />
                </div>
                <div>
                  <Label>Rol</Label>
                  <select
                    value={signer.role}
                    onChange={(e) => updateSigner(signer.id, { role: e.target.value as any })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="signer">Firmante Principal</option>
                    <option value="beneficiary">Beneficiario</option>
                    <option value="witness">Testigo</option>
                    <option value="representative">Representante</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Resumen del Envío</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Título:</strong> {documentTitle}</p>
                <p><strong>Cliente:</strong> {salesRequest.client_name}</p>
                <p><strong>Póliza:</strong> {salesRequest.policy_type}</p>
                <p><strong>Cobertura:</strong> {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(salesRequest.coverage_amount)}</p>
                <p><strong>Expira:</strong> {expiresIn} días</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Firmantes ({signers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signers.map((signer, index) => (
                  <div key={signer.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{signer.name}</p>
                      <p className="text-sm text-gray-600">{signer.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{message}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSendingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold mb-2">Enviando Documento...</h3>
      <p className="text-gray-600">Procesando y enviando el documento para firma digital</p>
    </div>
  );

  const isStepComplete = (currentStep: string) => {
    switch (currentStep) {
      case 'setup':
        return documentTitle.trim() && message.trim() && expiresIn > 0;
      case 'signers':
        return signers.length > 0 && signers.every(s => s.name.trim() && s.email.trim());
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Enviar para Firma Digital
        </CardTitle>
        <CardDescription>
          Configurar y enviar el documento para firma electrónica
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {['setup', 'signers', 'preview'].map((stepId, index) => (
            <div key={stepId} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === stepId ? 'bg-blue-600 text-white' : 
                ['setup', 'signers', 'preview'].indexOf(step) > index ? 'bg-green-600 text-white' : 
                'bg-gray-200 text-gray-600'
              }`}>
                {['setup', 'signers', 'preview'].indexOf(step) > index ? 
                  <Check className="w-4 h-4" /> : index + 1
                }
              </div>
              <span className="ml-2 text-sm font-medium">
                {stepId === 'setup' ? 'Configuración' : 
                 stepId === 'signers' ? 'Firmantes' : 'Resumen'}
              </span>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  ['setup', 'signers', 'preview'].indexOf(step) > index ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 'setup' && renderSetupStep()}
        {step === 'signers' && renderSignersStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'sending' && renderSendingStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {step !== 'setup' && step !== 'sending' && (
              <Button 
                onClick={() => {
                  const steps = ['setup', 'signers', 'preview'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) setStep(steps[currentIndex - 1] as any);
                }}
                variant="outline"
              >
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {step !== 'sending' && (
              <Button onClick={onCancel} variant="outline">
                Cancelar
              </Button>
            )}
            
            {step === 'setup' && (
              <Button 
                onClick={() => setStep('signers')}
                disabled={!isStepComplete('setup')}
              >
                Siguiente
              </Button>
            )}
            
            {step === 'signers' && (
              <Button 
                onClick={() => setStep('preview')}
                disabled={!isStepComplete('signers')}
              >
                Siguiente
              </Button>
            )}
            
            {step === 'preview' && (
              <Button 
                onClick={sendForSignature}
                disabled={loading || !isStepComplete('preview')}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Enviando...' : 'Enviar para Firma'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSignatureIntegration;