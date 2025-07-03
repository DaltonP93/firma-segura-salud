
import { supabase } from '@/integrations/supabase/client';
import { PDFTemplate } from '@/components/PDFTemplateBuilder';

export const pdfTemplatesService = {
  async fetchPDFTemplates(): Promise<PDFTemplate[]> {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDF templates:', error);
      return [];
    }

    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      fileName: template.file_name,
      fields: Array.isArray(template.fields) ? template.fields as unknown as PDFTemplate['fields'] : [],
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      fileSize: template.file_size || 0,
      fileUrl: template.file_url || undefined,
    }));
  },

  async createPDFTemplate(template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
    const { error } = await supabase
      .from('pdf_templates')
      .insert({
        name: template.name,
        file_name: template.fileName,
        fields: template.fields as any,
        file_size: template.fileSize,
        file_url: template.fileUrl || null,
        created_by: userId,
      });

    if (error) {
      throw error;
    }
  },

  async updatePDFTemplate(templateId: string, updates: Partial<PDFTemplate>) {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.fields) updateData.fields = updates.fields;
    if (updates.name) updateData.name = updates.name;
    if (updates.fileName) updateData.file_name = updates.fileName;
    if (updates.fileSize) updateData.file_size = updates.fileSize;
    if (updates.fileUrl) updateData.file_url = updates.fileUrl;

    const { error } = await supabase
      .from('pdf_templates')
      .update(updateData)
      .eq('id', templateId);

    if (error) {
      throw error;
    }
  },

  async deletePDFTemplate(templateId: string) {
    const { error } = await supabase
      .from('pdf_templates')
      .update({ is_active: false })
      .eq('id', templateId);

    if (error) {
      throw error;
    }
  }
};
