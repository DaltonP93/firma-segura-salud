import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Send, 
  Eye, 
  Hash,
  Clock,
  CheckCircle,
  Printer
} from 'lucide-react';
import { Document, Page } from 'react-pdf';
import '@/components/pdf/PDFWorkerConfig';

interface DocumentData {
  id: string;
  client_name: string;
  status: string;
  template_type: string | null;
  document_url?: string | null;
  sha256_hex?: string | null;
  generated_at?: string | null;
  field_values?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface DocumentPreviewModalProps {
  document: DocumentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSendForSignature?: () => void;
  onDownload?: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onSendForSignature,
  onDownload
}) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);

  if (!document) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vista Previa del Documento
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {document.template_type || 'Documento'}
              </Badge>
              <Badge 
                variant={document.status === 'signed' ? 'default' : 'secondary'}
                className={document.status === 'signed' ? 'bg-green-600' : ''}
              >
                {document.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="fields">Campos</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            {document.document_url ? (
              <div className="h-full flex flex-col">
                {/* PDF Controls */}
                <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                    >
                      -
                    </Button>
                    <span className="text-sm min-w-[50px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setScale(s => Math.min(2, s + 0.25))}
                    >
                      +
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      ←
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {numPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                      disabled={currentPage >= numPages}
                    >
                      →
                    </Button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                  <div className="mx-auto shadow-lg inline-block">
                    <Document
                      file={document.document_url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                      }
                    >
                      <Page 
                        pageNumber={currentPage}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>El documento aún no ha sido generado</p>
                  <p className="text-sm mt-2">Complete los campos y genere el PDF primero</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{document.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                  <p className="font-medium">{document.template_type || 'No especificado'}</p>
                </div>
                {document.generated_at && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Generado
                    </p>
                    <p className="font-medium">{formatDate(document.generated_at)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge 
                    className={document.status === 'signed' ? 'bg-green-600' : ''}
                  >
                    {document.status}
                  </Badge>
                </div>
              </div>

              {document.sha256_hex && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <Hash className="w-3 h-3" />
                    Huella Digital (SHA-256)
                  </p>
                  <p className="font-mono text-xs break-all">{document.sha256_hex}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Integridad verificable
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fields" className="flex-1 overflow-auto mt-4">
            <div className="p-4">
              {document.field_values && Object.keys(document.field_values).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(document.field_values).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay campos configurados
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {document.document_url && (
            <>
              <Button variant="outline" onClick={onDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              {document.status !== 'signed' && onSendForSignature && (
                <Button onClick={onSendForSignature} className="gap-2">
                  <Send className="w-4 h-4" />
                  Enviar para Firma
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
