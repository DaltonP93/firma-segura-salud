import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Monitor,
  Hash,
  Download,
  FileText,
  Award
} from 'lucide-react';

interface SignerEvidence {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
  signature_type: string;
  device_info?: {
    browser?: string;
    screen_resolution?: string;
    timestamp?: string;
  };
}

interface CertificateData {
  documentId: string;
  documentNumber: string;
  documentTitle: string;
  sha256Hex: string;
  createdAt: string;
  completedAt: string;
  signers: SignerEvidence[];
  totalPages: number;
  templateName?: string;
}

interface SignatureCertificateProps {
  data: CertificateData;
  onDownload?: () => void;
}

const SignatureCertificate: React.FC<SignatureCertificateProps> = ({ data, onDownload }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const certificateNumber = `CERT-${data.documentId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return (
    <Card className="max-w-3xl mx-auto border-2 border-primary/20">
      {/* Certificate Header */}
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="w-12 h-12 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-primary">
          Certificado de Firma Electrónica
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Documento firmado electrónicamente con validez legal
        </p>
        <Badge variant="default" className="mt-3 bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Firma Completada
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Certificate ID */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Número de Certificado</p>
          <p className="text-lg font-mono font-bold">{certificateNumber}</p>
        </div>

        {/* Document Info */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Información del Documento
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Título del Documento</p>
              <p className="font-medium">{data.documentTitle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Número de Documento</p>
              <p className="font-medium">{data.documentNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Creación</p>
              <p className="font-medium">{formatDate(data.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Finalización</p>
              <p className="font-medium">{formatDate(data.completedAt)}</p>
            </div>
            {data.templateName && (
              <div>
                <p className="text-muted-foreground">Plantilla Utilizada</p>
                <p className="font-medium">{data.templateName}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Páginas</p>
              <p className="font-medium">{data.totalPages}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Document Hash */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Huella Digital del Documento (SHA-256)
          </h3>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-mono text-xs break-all">{data.sha256Hex}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Este hash criptográfico garantiza la integridad del documento. Cualquier modificación 
            al contenido invalidaría esta huella digital.
          </p>
        </div>

        <Separator />

        {/* Signers Evidence */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Evidencia de Firmantes
          </h3>
          
          {data.signers.map((signer, index) => (
            <Card key={signer.id} className="border border-muted">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{signer.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {signer.role}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {signer.signature_type === 'electronic' ? 'Firma Electrónica' : 'Firma Digital'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{signer.email}</span>
                  </div>
                  {signer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{signer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(signer.signed_at)}</span>
                  </div>
                  {signer.ip_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-xs">{signer.ip_address}</span>
                    </div>
                  )}
                </div>

                {signer.device_info && (
                  <div className="p-2 bg-muted/30 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {signer.device_info.browser || signer.user_agent?.substring(0, 50)}...
                      </span>
                    </div>
                    {signer.device_info.screen_resolution && (
                      <p className="text-muted-foreground mt-1">
                        Resolución: {signer.device_info.screen_resolution}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Legal Notice */}
        <div className="text-xs text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-lg">
          <p className="font-medium">Aviso Legal:</p>
          <p>
            Este certificado acredita que el documento identificado fue firmado electrónicamente 
            por las personas arriba indicadas en las fechas y horas registradas. La firma electrónica 
            tiene la misma validez legal que la firma manuscrita según la legislación vigente.
          </p>
          <p>
            La integridad del documento queda garantizada mediante el hash SHA-256 indicado. 
            Las evidencias de firma (IP, navegador, dispositivo) fueron capturadas en el momento 
            de la firma para asegurar la no repudiación.
          </p>
        </div>

        {/* Download Button */}
        {onDownload && (
          <div className="flex justify-center pt-4">
            <Button onClick={onDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Descargar Certificado PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignatureCertificate;
