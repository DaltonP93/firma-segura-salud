
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Contract, Template } from '@/pages/Index';
import { PDFTemplate } from '@/components/PDFTemplateBuilder';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pdfTemplates, setPdfTemplates] = useState<PDFTemplate[]>([]);

  // Fetch all data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchDocuments(),
        fetchTemplates(),
        fetchPDFTemplates(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }

    const mappedContracts: Contract[] = (data || []).map(doc => ({
      id: doc.id,
      clientName: doc.client_name,
      clientEmail: doc.client_email,
      clientPhone: doc.client_phone || '',
      policyType: doc.policy_type || '',
      templateId: doc.template_id || undefined,
      templateType: (doc.template_type as 'contrato' | 'anexo' | 'declaracion') || 'contrato',
      status: doc.status as Contract['status'],
      createdAt: new Date(doc.created_at),
      sentAt: doc.sent_at ? new Date(doc.sent_at) : undefined,
      openedAt: doc.opened_at ? new Date(doc.opened_at) : undefined,
      signedAt: doc.signed_at ? new Date(doc.signed_at) : undefined,
      completedAt: doc.completed_at ? new Date(doc.completed_at) : undefined,
      documentUrl: doc.document_url || undefined,
      signatureUrl: doc.signature_url || undefined,
      shareableLink: doc.shareable_link || undefined,
    }));

    setContracts(mappedContracts);
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    const mappedTemplates: Template[] = (data || []).map(template => ({
      id: template.id,
      name: template.name,
      type: template.type as 'contrato' | 'anexo' | 'declaracion',
      fields: Array.isArray(template.fields) ? template.fields as unknown as Template['fields'] : [],
      content: template.content,
      createdAt: new Date(template.created_at),
    }));

    setTemplates(mappedTemplates);
  };

  const fetchPDFTemplates = async () => {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDF templates:', error);
      return;
    }

    const mappedPDFTemplates: PDFTemplate[] = (data || []).map(template => ({
      id: template.id,
      name: template.name,
      fileName: template.file_name,
      fields: Array.isArray(template.fields) ? template.fields as unknown as PDFTemplate['fields'] : [],
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      fileSize: template.file_size || 0,
    }));

    setPdfTemplates(mappedPDFTemplates);
  };

  const createDocument = async (contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('documents')
      .insert({
        client_name: contractData.clientName,
        client_email: contractData.clientEmail,
        client_phone: contractData.clientPhone,
        policy_type: contractData.policyType,
        template_id: contractData.templateId || null,
        template_type: contractData.templateType || 'contrato',
        created_by: user.id,
        document_number: `DOC-${Date.now()}`, // Will be replaced by DB function in production
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Error al crear el documento",
        variant: "destructive",
      });
      throw error;
    }

    await fetchDocuments();
    return data;
  };

  const updateDocumentStatus = async (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => {
    const updates: any = { status };
    
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'opened') updates.opened_at = new Date().toISOString();
    if (status === 'signed') updates.signed_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', contractId);

    if (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el documento",
        variant: "destructive",
      });
      throw error;
    }

    await fetchDocuments();
  };

  const createTemplate = async (template: Omit<Template, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('document_templates')
      .insert({
        name: template.name,
        type: template.type,
        content: template.content,
        fields: template.fields as any, // Cast to any for JSON compatibility
        created_by: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Error al crear la plantilla",
        variant: "destructive",
      });
      throw error;
    }

    await fetchTemplates();
    toast({
      title: "Plantilla Creada",
      description: `La plantilla "${template.name}" ha sido creada exitosamente`,
    });
  };

  const createPDFTemplate = async (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('pdf_templates')
      .insert({
        name: template.name,
        file_name: template.fileName,
        fields: template.fields as any, // Cast to any for JSON compatibility
        file_size: template.fileSize,
        created_by: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Error al crear la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }

    await fetchPDFTemplates();
  };

  const updatePDFTemplate = async (templateId: string, updates: Partial<PDFTemplate>) => {
    const { error } = await supabase
      .from('pdf_templates')
      .update({
        fields: updates.fields as any, // Cast to any for JSON compatibility
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId);

    if (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }

    await fetchPDFTemplates();
  };

  const deletePDFTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from('pdf_templates')
      .update({ is_active: false })
      .eq('id', templateId);

    if (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }

    await fetchPDFTemplates();
  };

  return {
    loading,
    contracts,
    templates,
    pdfTemplates,
    createDocument,
    updateDocumentStatus,
    createTemplate,
    createPDFTemplate,
    updatePDFTemplate,
    deletePDFTemplate,
    refetch: fetchAllData,
  };
};
