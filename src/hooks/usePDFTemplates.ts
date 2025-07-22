
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { PDFTemplate } from '@/components/PDFTemplateBuilder';
import { pdfTemplatesService } from '@/services/pdfTemplatesService';

export const usePDFTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: pdfTemplates = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pdf-templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching PDF templates...');
      const pdfTemplates = await pdfTemplatesService.fetchPDFTemplates();
      console.log('PDF templates fetched:', pdfTemplates.length);
      return pdfTemplates;
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

  const createPDFTemplate = async (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await pdfTemplatesService.createPDFTemplate(template, user.id);
      queryClient.invalidateQueries({ queryKey: ['pdf-templates'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePDFTemplate = async (templateId: string, updates: Partial<PDFTemplate>) => {
    try {
      await pdfTemplatesService.updatePDFTemplate(templateId, updates);
      queryClient.invalidateQueries({ queryKey: ['pdf-templates'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePDFTemplate = async (templateId: string) => {
    try {
      await pdfTemplatesService.deletePDFTemplate(templateId);
      queryClient.invalidateQueries({ queryKey: ['pdf-templates'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    pdfTemplates,
    loading,
    error,
    createPDFTemplate,
    updatePDFTemplate,
    deletePDFTemplate,
    refetch,
  };
};
