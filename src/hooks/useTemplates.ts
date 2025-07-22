
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Template } from '@/pages/Index';
import { templatesService } from '@/services/templatesService';

export const useTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching templates...');
      const templates = await templatesService.fetchTemplates();
      console.log('Templates fetched:', templates.length);
      return templates;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const createTemplate = async (template: Omit<Template, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      await templatesService.createTemplate(template, user.id);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Plantilla Creada",
        description: `La plantilla "${template.name}" ha sido creada exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la plantilla",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    refetch,
  };
};
