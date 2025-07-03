
import { supabase } from '@/integrations/supabase/client';
import type { Template } from '@/pages/Index';

export const templatesService = {
  async fetchTemplates(): Promise<Template[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      type: template.type as 'contrato' | 'anexo' | 'declaracion',
      fields: Array.isArray(template.fields) ? template.fields as unknown as Template['fields'] : [],
      content: template.content,
      createdAt: new Date(template.created_at),
    }));
  },

  async createTemplate(template: Omit<Template, 'id' | 'createdAt'>, userId: string) {
    const { error } = await supabase
      .from('document_templates')
      .insert({
        name: template.name,
        type: template.type,
        content: template.content,
        fields: template.fields as any,
        created_by: userId,
      });

    if (error) {
      throw error;
    }
  }
};
