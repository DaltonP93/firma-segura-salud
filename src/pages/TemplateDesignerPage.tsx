import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TemplateDesigner from '@/components/template-designer/TemplateDesigner';
import { supabase } from '@/integrations/supabase/client';
import { templateDesignerService } from '@/services/templateDesignerService';
import AppLayout from '@/components/layout/AppLayout';

interface TemplateInfo {
  id: string;
  name: string;
  file_url: string | null;
}

const TemplateDesignerPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [template, setTemplate] = useState<TemplateInfo | null>(null);
  const [versionId, setVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        navigate('/');
        return;
      }

      try {
        // Load template info
        const { data: templateData, error: templateError } = await supabase
          .from('pdf_templates')
          .select('id, name, file_url')
          .eq('id', templateId)
          .single();

        if (templateError || !templateData) {
          throw new Error('Plantilla no encontrada');
        }

        setTemplate(templateData);

        // Get or create active version
        let version = await templateDesignerService.getActiveVersion(templateId);
        
        if (!version) {
          // Get current user for creating version
          const { data: { user } } = await supabase.auth.getUser();
          if (user && templateData.file_url) {
            version = await templateDesignerService.createVersion(
              templateId,
              templateData.file_url,
              user.id
            );
          }
        }

        if (version) {
          setVersionId(version.id);
        }
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la plantilla",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, navigate, toast]);

  const handleSave = () => {
    toast({
      title: "Guardado",
      description: "El diseño ha sido guardado exitosamente"
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AppLayout>
    );
  }

  if (!template || !versionId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Plantilla no encontrada</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <TemplateDesigner
          templateId={template.id}
          templateName={template.name}
          initialPdfUrl={template.file_url || undefined}
          versionId={versionId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
};

export default TemplateDesignerPage;
