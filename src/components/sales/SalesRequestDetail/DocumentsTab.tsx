import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Edit2, Send, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  client_name: string;
  status: string;
  template_type: string | null;
  created_at: string;
  ready_for_sign: boolean | null;
  sha256_hex: string | null;
  generated_at: string | null;
  template_version_id: string | null;
}

interface PdfTemplate {
  id: string;
  name: string;
  file_url: string | null;
}

interface DocumentsTabProps {
  requestId: string;
  clientName: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ requestId, clientName }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([fetchDocuments(), fetchTemplates()]).finally(() => setIsLoading(false));
  }, [requestId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('sale_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('id, name, file_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateDocument = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          client_name: clientName,
          sale_id: requestId,
          status: 'draft',
          template_type: 'contrato',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Documento creado",
        description: `Se ha creado el documento "${template.name}" en borrador`
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el documento",
        variant: "destructive"
      });
    }
  };

  const handleMarkReady = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          ready_for_sign: true,
          status: 'pending'
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Documento listo",
        description: "El documento está listo para firma"
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error marking document ready:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el documento",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, readyForSign: boolean | null) => {
    if (readyForSign) {
      return <Badge className="bg-emerald-500 text-white">Listo para Firma</Badge>;
    }
    
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'pending':
        return <Badge variant="default">Pendiente</Badge>;
      case 'signed':
        return <Badge className="bg-emerald-500 text-white">Firmado</Badge>;
      case 'completed':
        return <Badge className="bg-sky-500 text-white">Completado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Cargando documentos...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Templates disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" />
            Crear Documento desde Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto py-3 flex flex-col items-start"
                onClick={() => handleCreateDocument(template.id)}
              >
                <FileText className="w-4 h-4 mb-1" />
                <span className="text-xs">{template.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentos de la venta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos de la Venta ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos generados</p>
              <p className="text-sm mt-2">Selecciona una plantilla para crear un documento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{doc.client_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(doc.status, doc.ready_for_sign)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                        {doc.sha256_hex && (
                          <span className="text-xs text-muted-foreground">
                            Hash: {doc.sha256_hex.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    
                    {doc.status === 'draft' && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleMarkReady(doc.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Listo
                        </Button>
                      </>
                    )}
                    
                    {doc.ready_for_sign && doc.status !== 'signed' && (
                      <Button variant="default" size="sm">
                        <Send className="w-4 h-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsTab;
