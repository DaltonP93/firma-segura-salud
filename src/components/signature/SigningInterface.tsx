import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Pen, Calendar, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { SignatureService } from '@/services/signatureService';
import { useToast } from '@/hooks/use-toast';

interface Signer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  access_token: string;
  signature_request_id: string;
}

interface SignatureField {
  id: string;
  field_type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  page_number: number;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  is_required: boolean;
  placeholder_text?: string;
  field_value?: string;
}

interface SigningRequest {
  id: string;
  title: string;
  message?: string;
  status: string;
  created_at: string;
  expires_at?: string;
  document_id: string;
}

const SigningInterface = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [signingRequest, setSigningRequest] = useState<SigningRequest | null>(null);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [signatureData, setSignatureData] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (token) {
      loadSigningData();
    }
  }, [token]);

  const loadSigningData = async () => {
    try {
      setLoading(true);
      
      // Get signer by access token
      const signerData = await SignatureService.getSignerByToken(token!);
      if (!signerData) {
        toast({
          title: "Token Inválido",
          description: "El enlace de firma no es válido o ha expirado",
          variant: "destructive",
        });
        return;
      }
      
      setSigner(signerData);
      
      // Get signature request details
      const requestData = await SignatureService.getSignatureRequestWithDetails(
        signerData.signature_request_id
      );
      
      if (requestData) {
        setSigningRequest(requestData);
        // Cast the fields to match our interface
        const fields = (requestData.signature_fields || []).map((field: any) => ({
          id: field.id,
          field_type: field.field_type as 'signature' | 'initials' | 'date' | 'text' | 'checkbox',
          page_number: field.page_number,
          x_position: field.x_position,
          y_position: field.y_position,
          width: field.width,
          height: field.height,
          is_required: field.is_required,
          placeholder_text: field.placeholder_text,
          field_value: field.field_value
        }));
        setSignatureFields(fields);
      }
      
    } catch (error) {
      console.error('Error loading signing data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos de firma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleSignatureEnd = () => {
    if (!canvasRef.current) return;
    setIsDrawing(false);
    setSignatureData(canvasRef.current.toDataURL());
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData('');
    }
  };

  const handleFieldValueChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateFields = () => {
    const requiredFields = signatureFields.filter(field => field.is_required);
    
    for (const field of requiredFields) {
      if (field.field_type === 'signature' && !signatureData) {
        return false;
      }
      if (field.field_type !== 'signature' && !fieldValues[field.id]) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmitSignature = async () => {
    if (!signer || !validateFields()) {
      toast({
        title: "Campos Requeridos",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Update signer with signature
      await SignatureService.updateSignerSignature(
        signer.id,
        signatureData,
        'electronic',
        {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          screen_resolution: `${screen.width}x${screen.height}`
        }
      );

      // Update signature fields with values
      for (const field of signatureFields) {
        if (fieldValues[field.id] || (field.field_type === 'signature' && signatureData)) {
          // Update field value in database
          // This would require a new service method
        }
      }

      // Check if signature request is complete
      await SignatureService.checkSignatureRequestCompletion(signer.signature_request_id);

      toast({
        title: "Firma Completada",
        description: "Su firma ha sido registrada exitosamente",
      });

      // Reload to show completion status
      await loadSigningData();
      
    } catch (error) {
      console.error('Error submitting signature:', error);
      toast({
        title: "Error",
        description: "Error al enviar la firma",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = signingRequest?.expires_at && new Date(signingRequest.expires_at) < new Date();
  const isAlreadySigned = signer?.status === 'signed';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (!signer || !signingRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Documento No Encontrado</h2>
            <p className="text-gray-600">El enlace de firma no es válido o ha expirado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firma Electrónica de Documento
          </h1>
          <p className="text-gray-600">
            Complete los campos requeridos y firme el documento
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Alerts */}
          {isExpired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este documento ha expirado y ya no puede ser firmado.
              </AlertDescription>
            </Alert>
          )}

          {isAlreadySigned && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ya has firmado este documento exitosamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {signingRequest.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Firmante</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{signer.name}</span>
                    <Badge variant="outline">{signer.role}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{signer.email}</span>
                  </div>
                </div>
                {signer.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{signer.phone}</span>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha de Solicitud</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(signingRequest.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {signingRequest.message && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-900">{signingRequest.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Fields */}
          {!isExpired && !isAlreadySigned && (
            <Card>
              <CardHeader>
                <CardTitle>Campos del Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {signatureFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {field.field_type === 'signature' && <Pen className="w-4 h-4" />}
                      {field.field_type === 'date' && <Calendar className="w-4 h-4" />}
                      {field.placeholder_text || `Campo ${field.field_type}`}
                      {field.is_required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {field.field_type === 'signature' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={150}
                          className="w-full border rounded cursor-crosshair bg-white"
                          onMouseDown={handleSignatureStart}
                          onMouseMove={handleSignatureMove}
                          onMouseUp={handleSignatureEnd}
                          onMouseLeave={handleSignatureEnd}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-600">
                            Dibuje su firma en el área de arriba
                          </p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={clearSignature}
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {field.field_type === 'text' && (
                      <Input
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder_text}
                        required={field.is_required}
                      />
                    )}
                    
                    {field.field_type === 'date' && (
                      <Input
                        type="date"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        required={field.is_required}
                      />
                    )}
                    
                    {field.field_type === 'checkbox' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={fieldValues[field.id] === 'true'}
                          onCheckedChange={(checked) => 
                            handleFieldValueChange(field.id, checked ? 'true' : 'false')
                          }
                        />
                        <Label htmlFor={field.id} className="text-sm">
                          {field.placeholder_text || 'Acepto'}
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isExpired && !isAlreadySigned && (
            <div className="flex justify-center">
              <Button
                onClick={handleSubmitSignature}
                disabled={submitting || !validateFields()}
                className="px-8 py-3 text-lg"
              >
                {submitting ? 'Enviando...' : 'Firmar Documento'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigningInterface;