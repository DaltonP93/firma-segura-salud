
import { supabase } from '@/integrations/supabase/client';
import type { Contract } from '@/pages/Index';

export const documentsService = {
  async fetchDocuments(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return (data || []).map(doc => ({
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
  },

  async createDocument(contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        client_name: contractData.clientName,
        client_email: contractData.clientEmail,
        client_phone: contractData.clientPhone,
        policy_type: contractData.policyType,
        template_id: contractData.templateId || null,
        template_type: contractData.templateType || 'contrato',
        created_by: userId,
        document_number: `DOC-${Date.now()}`,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateDocumentStatus(contractId: string, status: Contract['status']) {
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
      throw error;
    }
  }
};
