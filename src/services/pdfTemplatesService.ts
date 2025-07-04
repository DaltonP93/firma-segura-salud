
import { supabase } from '@/integrations/supabase/client';
import { PDFTemplate } from '@/components/PDFTemplateBuilder';

export const pdfTemplatesService = {
  async fetchPDFTemplates(): Promise<PDFTemplate[]> {
    console.log('Fetching PDF templates...');
    
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDF templates:', error);
      throw error;
    }

    console.log('PDF templates fetched:', data?.length || 0);

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

  async uploadPDFFile(file: File, templateId?: string): Promise<string> {
    console.log('Uploading PDF file:', file.name, 'Size:', file.size);
    
    const fileName = templateId 
      ? `${templateId}/${file.name}`
      : `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('pdf-templates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: templateId ? true : false
      });

    if (error) {
      console.error('Error uploading PDF file:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdf-templates')
      .getPublicUrl(data.path);

    console.log('PDF file uploaded successfully:', publicUrl);
    return publicUrl;
  },

  async createPDFTemplate(template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>, userId: string, file?: File) {
    console.log('Creating PDF template:', template.name);
    
    let fileUrl = template.fileUrl;
    
    // Upload file if provided
    if (file) {
      fileUrl = await this.uploadPDFFile(file);
    }

    const { error } = await supabase
      .from('pdf_templates')
      .insert({
        name: template.name,
        file_name: template.fileName,
        fields: template.fields as any,
        file_size: template.fileSize,
        file_url: fileUrl,
        created_by: userId,
      });

    if (error) {
      console.error('Error creating PDF template:', error);
      throw error;
    }

    console.log('PDF template created successfully');
  },

  async updatePDFTemplate(templateId: string, updates: Partial<PDFTemplate>, file?: File) {
    console.log('Updating PDF template:', templateId);
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Upload new file if provided
    if (file) {
      updateData.file_url = await this.uploadPDFFile(file, templateId);
      updateData.file_name = file.name;
      updateData.file_size = file.size;
    }

    if (updates.fields) updateData.fields = updates.fields;
    if (updates.name) updateData.name = updates.name;
    if (updates.fileName && !file) updateData.file_name = updates.fileName;
    if (updates.fileSize && !file) updateData.file_size = updates.fileSize;
    if (updates.fileUrl && !file) updateData.file_url = updates.fileUrl;

    const { error } = await supabase
      .from('pdf_templates')
      .update(updateData)
      .eq('id', templateId);

    if (error) {
      console.error('Error updating PDF template:', error);
      throw error;
    }

    console.log('PDF template updated successfully');
  },

  async deletePDFTemplate(templateId: string) {
    console.log('Deleting PDF template:', templateId);
    
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('pdf_templates')
      .update({ is_active: false })
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting PDF template:', error);
      throw error;
    }

    console.log('PDF template deleted successfully');
  },

  async getPDFTemplateFile(templateId: string): Promise<string | null> {
    console.log('Getting PDF template file:', templateId);
    
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('file_url')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error getting PDF template file:', error);
      return null;
    }

    return data.file_url;
  }
};
