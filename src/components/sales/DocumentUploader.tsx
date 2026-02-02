import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Paperclip, 
  FileText, 
  Image, 
  X, 
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SalesRequestWithDetails } from './SalesRequestsList';

interface DocumentUploaderProps {
  salesRequest: SalesRequestWithDetails;
  onDocumentUploaded?: () => void;
}

interface UploadedDocument {
  id: string;
  file_name: string;
  file_size: number;
  document_type: string;
  file_url: string;
  uploaded_at: string;
  mime_type?: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  salesRequest,
  onDocumentUploaded
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchDocuments();
  }, [salesRequest.id]);

  const fetchDocuments = async () => {
    try {
      // Use the documents table with sales_request_id filter instead of non-existent sales_documents
      const { data, error } = await supabase
        .from('documents')
        .select('id, document_url, created_at, metadata')
        .eq('sales_request_id', salesRequest.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        setLoading(false);
        return;
      }

      // Transform the data to match UploadedDocument interface
      const transformedDocs: UploadedDocument[] = (data || []).map(doc => {
        const metadata = doc.metadata as Record<string, unknown> || {};
        return {
          id: doc.id,
          file_name: (metadata.file_name as string) || 'Documento',
          file_size: (metadata.file_size as number) || 0,
          document_type: (metadata.document_type as string) || 'document',
          file_url: doc.document_url || '',
          uploaded_at: doc.created_at,
          mime_type: (metadata.mime_type as string) || 'application/pdf'
        };
      });

      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos PDF, JPG, PNG y documentos de Word",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo no puede ser mayor a 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      for (const file of Array.from(files)) {
        if (!validateFile(file)) continue;

        // Upload to Supabase Storage
        const fileName = `${salesRequest.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Error de carga",
            description: `Error al subir ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Save document record in the documents table
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            sales_request_id: salesRequest.id,
            client_name: salesRequest.client_name,
            document_url: publicUrl,
            status: 'draft',
            created_by: user?.id,
            metadata: {
              file_name: file.name,
              file_size: file.size,
              document_type: file.type.startsWith('image/') ? 'image' : 'document',
              mime_type: file.type,
              uploaded_by: user?.id
            }
          });

        if (dbError) {
          console.error('Database error:', dbError);
          toast({
            title: "Error de base de datos",
            description: `Error al guardar ${file.name}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Archivos subidos",
        description: "Los documentos se han subido correctamente",
      });

      // Refresh documents list
      await fetchDocuments();
      onDocumentUploaded?.();

    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Error al subir los archivos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (document: UploadedDocument) => {
    if (!confirm('¿Está seguro de que desea eliminar este documento?')) {
      return;
    }

    try {
      // Delete from storage
      const fileName = document.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('documents')
          .remove([`${salesRequest.id}/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente",
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el documento",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FileText;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    return Paperclip;
  };

  const getFileTypeLabel = (mimeType?: string) => {
    if (!mimeType) return 'Archivo';
    if (mimeType.startsWith('image/')) return 'Imagen';
    if (mimeType === 'application/pdf') return 'PDF';
    return 'Documento';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Adjuntar Documentos
          </CardTitle>
          <CardDescription>
            Suba archivos PDF, JPG, PNG y documentos de Word (máximo 10MB cada uno)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Haga clic para seleccionar archivos o arrastre y suelte aquí
            </p>
            <Button 
              onClick={handleFileSelect} 
              disabled={uploading}
              className="mb-2"
            >
              {uploading ? 'Subiendo...' : 'Seleccionar Archivos'}
            </Button>
            <p className="text-xs text-gray-500">
              Formatos permitidos: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Documentos Adjuntos ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No hay documentos adjuntos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => {
                const FileIcon = getFileIcon(document.mime_type);
                
                return (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{document.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            {getFileTypeLabel(document.mime_type)}
                          </Badge>
                          <span>{formatFileSize(document.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(document.uploaded_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(document.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = window.document.createElement('a');
                          link.href = document.file_url;
                          link.download = document.file_name;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDocument(document)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUploader;
