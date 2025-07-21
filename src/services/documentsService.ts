
import { supabase } from '@/integrations/supabase/client';
import type { Contract } from '@/pages/Index';

export const documentsService = {
  async fetchDocuments(): Promise<any[]> {
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
    // Validate inputs
    if (!userId) {
      throw new Error('ID de usuario requerido para crear el documento');
    }

    if (!contractData.clientName || !contractData.clientEmail) {
      throw new Error('Nombre y email del cliente son requeridos');
    }

    console.log('Creating document with:', {
      userId,
      clientName: contractData.clientName,
      clientEmail: contractData.clientEmail,
      policyType: contractData.policyType
    });

    try {
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
        console.error('Database error creating document:', error);
        
        // Handle specific RLS errors
        if (error.message.includes('row-level security policy')) {
          throw new Error('Error de permisos: No tienes autorización para crear documentos. Por favor inicia sesión nuevamente.');
        }
        
        // Handle other database errors
        if (error.code === '23505') {
          throw new Error('Ya existe un documento con este número');
        }
        
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      console.log('Document created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error in createDocument:', error);
      
      // Re-throw custom errors
      if (error.message.startsWith('Error de permisos') || 
          error.message.startsWith('Error de base de datos') ||
          error.message.includes('requerido')) {
        throw error;
      }
      
      // Handle unexpected errors
      throw new Error(`Error inesperado al crear el documento: ${error.message}`);
    }
  },

  async updateDocument(documentId: string, updates: any) {
    const { error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId);

    if (error) {
      throw error;
    }
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
