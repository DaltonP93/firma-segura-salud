import { supabase } from '@/integrations/supabase/client';
import type { SalesRequest, Beneficiary } from '@/components/sales/SalesRequestForm';
import type { SalesRequestWithDetails } from '@/components/sales/SalesRequestsList';

export const salesService = {
  async createSalesRequest(requestData: SalesRequest, beneficiaries: Beneficiary[], userId: string) {
    const { data: request, error: requestError } = await supabase
      .from('sales_requests')
      .insert({
        client_name: requestData.client_name,
        client_email: requestData.client_email,
        client_phone: requestData.client_phone,
        client_dni: requestData.client_dni,
        client_birth_date: requestData.client_birth_date,
        client_address: requestData.client_address,
        policy_type: requestData.policy_type,
        insurance_plan_id: requestData.insurance_plan_id,
        template_id: requestData.template_id,
        client_occupation: requestData.client_occupation,
        client_income: requestData.client_income,
        client_marital_status: requestData.client_marital_status,
        medical_exams_required: requestData.medical_exams_required,
        agent_notes: requestData.agent_notes,
        priority_level: requestData.priority_level,
        source: requestData.source,
        notes: requestData.notes,
        created_by: userId,
        status: 'draft'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating sales request:', requestError);
      throw requestError;
    }

    // Insert beneficiaries
    if (beneficiaries.length > 0) {
      const beneficiariesData = beneficiaries.map(b => ({
        sales_request_id: request.id,
        description: b.description,
        relationship: b.relationship,
        dni: b.dni,
        birth_date: b.birth_date,
        phone: b.phone,
        email: b.email,
        price: b.price,
        is_primary: b.is_primary,
        weight: b.weight,
        height: b.height
      }));

      const { error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .insert(beneficiariesData);

      if (beneficiariesError) {
        console.error('Error creating beneficiaries:', beneficiariesError);
        throw beneficiariesError;
      }
    }

    return request;
  },

  async fetchSalesRequests(): Promise<SalesRequestWithDetails[]> {
    const { data, error } = await supabase
      .from('sales_requests')
      .select(`
        *,
        beneficiaries (id),
        document_templates (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales requests:', error);
      throw error;
    }

    return (data || []).map(request => ({
      id: request.id,
      request_number: request.request_number,
      client_name: request.client_name,
      client_email: request.client_email,
      client_phone: request.client_phone,
      client_dni: request.client_dni,
      client_birth_date: request.client_birth_date,
      client_address: request.client_address,
      policy_type: request.policy_type,
      coverage_amount: request.coverage_amount,
      monthly_premium: request.monthly_premium,
      status: request.status as SalesRequest['status'],
      notes: request.notes,
      template_id: request.template_id,
      created_at: request.created_at,
      updated_at: request.updated_at,
      completed_at: request.completed_at,
      beneficiaries_count: request.beneficiaries?.length || 0,
      template_name: request.document_templates?.name
    }));
  },

  async updateSalesRequest(requestId: string, updates: Partial<SalesRequest>) {
    const { data, error } = await supabase
      .from('sales_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating sales request:', error);
      throw error;
    }

    return data;
  },

  async updateSalesRequestStatus(requestId: string, status: SalesRequest['status']) {
    const updates: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('sales_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating sales request status:', error);
      throw error;
    }

    return data;
  },

  async getSalesRequestById(requestId: string) {
    const { data, error } = await supabase
      .from('sales_requests')
      .select(`
        *,
        beneficiaries (*)
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Error fetching sales request:', error);
      throw error;
    }

    return data;
  },

  async fetchHealthQuestions() {
    const { data, error } = await supabase
      .from('health_questions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching health questions:', error);
      throw error;
    }

    return data || [];
  },

  async createHealthDeclaration(salesRequestId: string, answers: Record<string, any>) {
    const { data, error } = await supabase
      .from('health_declarations')
      .upsert({
        sales_request_id: salesRequestId,
        answers,
        is_complete: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving health declaration:', error);
      throw error;
    }

    // Update sales request status
    await this.updateSalesRequestStatus(salesRequestId, 'pending_signature');

    return data;
  },

  async deleteSalesRequest(requestId: string) {
    // First delete beneficiaries
    const { error: beneficiariesError } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('sales_request_id', requestId);

    if (beneficiariesError) {
      console.error('Error deleting beneficiaries:', beneficiariesError);
      throw beneficiariesError;
    }

    // Delete health declarations
    const { error: healthError } = await supabase
      .from('health_declarations')
      .delete()
      .eq('sales_request_id', requestId);

    if (healthError) {
      console.error('Error deleting health declarations:', healthError);
    }

    // Finally delete the sales request
    const { error } = await supabase
      .from('sales_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting sales request:', error);
      throw error;
    }

    return true;
  },

  async generateHealthDeclarationPDF(salesRequestId: string) {
    // This will be implemented to generate PDF from health declaration
    const { data: healthDeclaration, error } = await supabase
      .from('health_declarations')
      .select(`
        *,
        sales_requests (
          client_name,
          client_email,
          client_dni,
          client_birth_date
        )
      `)
      .eq('sales_request_id', salesRequestId)
      .single();

    if (error) {
      console.error('Error fetching health declaration:', error);
      throw error;
    }

    return healthDeclaration;
  },

  async createSignatureRequest(salesRequestId: string, templateId: string) {
    try {
      // First create a document (required for signature requests)
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          document_number: `DOC-${Date.now()}`,
          client_name: 'Documento de Solicitud de Seguro',
          client_email: 'example@email.com',
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (docError) throw docError;

      // Then create the signature request
      const { data, error } = await supabase
        .from('signature_requests')
        .insert({
          document_id: document.id,
          title: `Firma de Solicitud de Seguro`,
          message: `Por favor firme la solicitud de seguro`,
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating signature request:', error);
      throw error;
    }
  }
};
