import { supabase } from '@/integrations/supabase/client';

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  storage_key: string | null;
  engine_opts: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface SignatureArea {
  id: string;
  template_version_id: string;
  role: 'client' | 'vendor' | 'witness';
  kind: 'electronic' | 'digital';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  is_required: boolean;
  label: string | null;
  sort_order: number;
}

export interface TemplateFieldConfig {
  id: string;
  template_version_id: string;
  field_key: string;
  label: string;
  field_type: string;
  binding: string | null;
  validation: Record<string, unknown> | null;
  options: unknown[] | null;
  default_value: string | null;
  placeholder: string | null;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  font_size: number;
  is_required: boolean;
  sort_order: number;
}

export interface DesignerElement {
  id: string;
  type: 'field' | 'signature';
  data: TemplateFieldConfig | SignatureArea;
}

export const templateDesignerService = {
  // Template Versions
  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false });

    if (error) throw error;
    return (data || []) as TemplateVersion[];
  },

  async getActiveVersion(templateId: string): Promise<TemplateVersion | null> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as TemplateVersion | null;
  },

  async createVersion(templateId: string, storageKey: string, createdBy: string): Promise<TemplateVersion> {
    // Get next version number
    const versions = await this.getTemplateVersions(templateId);
    const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;

    // Deactivate all previous versions
    await supabase
      .from('template_versions')
      .update({ is_active: false })
      .eq('template_id', templateId);

    // Create new version
    const { data, error } = await supabase
      .from('template_versions')
      .insert({
        template_id: templateId,
        version: nextVersion,
        storage_key: storageKey,
        is_active: true,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return data as TemplateVersion;
  },

  // Signature Areas
  async getSignatureAreas(versionId: string): Promise<SignatureArea[]> {
    const { data, error } = await supabase
      .from('signature_areas')
      .select('*')
      .eq('template_version_id', versionId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as SignatureArea[];
  },

  async saveSignatureAreas(versionId: string, areas: Omit<SignatureArea, 'id'>[]): Promise<SignatureArea[]> {
    // Delete existing areas
    await supabase
      .from('signature_areas')
      .delete()
      .eq('template_version_id', versionId);

    if (areas.length === 0) return [];

    // Insert new areas
    const { data, error } = await supabase
      .from('signature_areas')
      .insert(areas.map((area, index) => ({
        ...area,
        template_version_id: versionId,
        sort_order: index
      })))
      .select();

    if (error) throw error;
    return (data || []) as SignatureArea[];
  },

  // Template Fields
  async getTemplateFields(versionId: string): Promise<TemplateFieldConfig[]> {
    const { data, error } = await supabase
      .from('template_fields_config')
      .select('*')
      .eq('template_version_id', versionId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as TemplateFieldConfig[];
  },

  async saveTemplateFields(versionId: string, fields: Omit<TemplateFieldConfig, 'id'>[]): Promise<TemplateFieldConfig[]> {
    // Delete existing fields
    await supabase
      .from('template_fields_config')
      .delete()
      .eq('template_version_id', versionId);

    if (fields.length === 0) return [];

    // Insert new fields - cast to Json compatible type
    const insertData = fields.map((field, index) => ({
      template_version_id: versionId,
      field_key: field.field_key,
      label: field.label,
      field_type: field.field_type,
      binding: field.binding,
      validation: (field.validation || {}) as Record<string, unknown>,
      options: (field.options || []) as unknown[],
      default_value: field.default_value,
      placeholder: field.placeholder,
      page: field.page,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      font_size: field.font_size,
      is_required: field.is_required,
      sort_order: index
    }));

    const { data, error } = await supabase
      .from('template_fields_config')
      .insert(insertData as any)
      .select();

    if (error) throw error;
    return (data || []) as TemplateFieldConfig[];
  },

  // Combined save for entire design
  async saveDesign(versionId: string, fields: Omit<TemplateFieldConfig, 'id'>[], areas: Omit<SignatureArea, 'id'>[]): Promise<void> {
    await Promise.all([
      this.saveTemplateFields(versionId, fields),
      this.saveSignatureAreas(versionId, areas)
    ]);
  },

  // Load entire design
  async loadDesign(versionId: string): Promise<{
    fields: TemplateFieldConfig[];
    signatureAreas: SignatureArea[];
  }> {
    const [fields, signatureAreas] = await Promise.all([
      this.getTemplateFields(versionId),
      this.getSignatureAreas(versionId)
    ]);

    return { fields, signatureAreas };
  }
};
