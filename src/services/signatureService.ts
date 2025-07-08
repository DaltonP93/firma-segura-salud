import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SignatureRequest = Database['public']['Tables']['signature_requests']['Row'];
type SignatureRequestInsert = Database['public']['Tables']['signature_requests']['Insert'];
type Signer = Database['public']['Tables']['signers']['Row'];
type SignerInsert = Database['public']['Tables']['signers']['Insert'];
type SignatureField = Database['public']['Tables']['signature_fields']['Row'];
type SignatureFieldInsert = Database['public']['Tables']['signature_fields']['Insert'];
type DocumentEvent = Database['public']['Tables']['document_events']['Insert'];

export interface SignatureRequestWithSigners extends Omit<SignatureRequest, 'signers' | 'signature_fields'> {
  signers: Signer[];
  signature_fields: SignatureField[];
}

export class SignatureService {
  
  // Create a new signature request
  static async createSignatureRequest(
    documentId: string,
    title: string,
    createdBy: string,
    message?: string,
    expiresAt?: Date
  ): Promise<SignatureRequest> {
    const { data, error } = await supabase
      .from('signature_requests')
      .insert({
        document_id: documentId,
        title,
        message,
        created_by: createdBy,
        expires_at: expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Add signers to a signature request
  static async addSigners(
    signatureRequestId: string,
    signers: Omit<SignerInsert, 'signature_request_id'>[]
  ): Promise<Signer[]> {
    const signersToInsert = signers.map((signer, index) => ({
      ...signer,
      signature_request_id: signatureRequestId,
      signing_order: signer.signing_order || index + 1,
    }));

    const { data, error } = await supabase
      .from('signers')
      .insert(signersToInsert)
      .select();

    if (error) throw error;
    return data;
  }

  // Add signature fields to a document
  static async addSignatureFields(
    documentId: string,
    fields: Omit<SignatureFieldInsert, 'document_id'>[]
  ): Promise<SignatureField[]> {
    const fieldsToInsert = fields.map(field => ({
      ...field,
      document_id: documentId,
    }));

    const { data, error } = await supabase
      .from('signature_fields')
      .insert(fieldsToInsert)
      .select();

    if (error) throw error;
    return data;
  }

  // Get signature request with all related data
  static async getSignatureRequestWithDetails(
    signatureRequestId: string
  ): Promise<SignatureRequestWithSigners | null> {
    const { data: signatureRequest, error: requestError } = await supabase
      .from('signature_requests')
      .select(`
        *,
        signers (*),
        documents!inner(signature_fields (*))
      `)
      .eq('id', signatureRequestId)
      .single();

    if (requestError) throw requestError;
    return signatureRequest as any;
  }

  // Get signer by access token
  static async getSignerByToken(accessToken: string): Promise<Signer | null> {
    const { data, error } = await supabase
      .from('signers')
      .select('*')
      .eq('access_token', accessToken)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update signer signature
  static async updateSignerSignature(
    signerId: string,
    signatureData: string,
    signatureType: string = 'electronic',
    deviceInfo?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('signers')
      .update({
        signature_data: signatureData,
        signature_type: signatureType,
        signed_at: new Date().toISOString(),
        status: 'signed',
        device_info: deviceInfo,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      })
      .eq('id', signerId);

    if (error) throw error;

    // Create signature event
    const signerDetails = await this.getSignerDetails(signerId);
    if (signerDetails?.signature_request_id) {
      await this.createDocumentEvent(
        signerDetails.signature_request_id,
        'signed',
        signerId,
        { signature_type: signatureType, device_info: deviceInfo }
      );
    }
  }

  // Create document event
  static async createDocumentEvent(
    documentId: string,
    eventType: 'created' | 'sent' | 'opened' | 'signed' | 'declined' | 'expired' | 'reminded' | 'completed',
    signerId?: string,
    eventData?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('document_events')
      .insert({
        document_id: documentId,
        signer_id: signerId,
        event_type: eventType,
        event_data: eventData,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      });

    if (error) throw error;
  }

  // Send signature request
  static async sendSignatureRequest(signatureRequestId: string): Promise<void> {
    // Update status to sent
    const { error: updateError } = await supabase
      .from('signature_requests')
      .update({ status: 'sent' })
      .eq('id', signatureRequestId);

    if (updateError) throw updateError;

    // Update all signers to sent status
    const { error: signersError } = await supabase
      .from('signers')
      .update({ status: 'sent' })
      .eq('signature_request_id', signatureRequestId);

    if (signersError) throw signersError;

    // Get signature request details for sending notifications
    const signatureRequest = await this.getSignatureRequestWithDetails(signatureRequestId);
    if (!signatureRequest) throw new Error('Signature request not found');

    // TODO: Implement actual notification sending via edge functions
    // For now, we'll create the notification logs
    for (const signer of signatureRequest.signers) {
      await this.createNotificationLog(
        signatureRequestId,
        signer.id,
        'email',
        `Signature request: ${signatureRequest.title}`
      );
    }
  }

  // Create notification log
  static async createNotificationLog(
    signatureRequestId: string,
    signerId: string,
    notificationType: 'email' | 'sms' | 'whatsapp' | 'push',
    messageContent: string
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        signature_request_id: signatureRequestId,
        signer_id: signerId,
        notification_type: notificationType,
        message_content: messageContent,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  // Get signature requests for current user
  static async getUserSignatureRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('signature_requests')
      .select(`
        *,
        signers (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  }

  // Get document events
  static async getDocumentEvents(documentId: string) {
    const { data, error } = await supabase
      .from('document_events')
      .select(`
        *,
        signers (name, email, role)
      `)
      .eq('document_id', documentId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Helper methods
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  }

  private static async getSignerDetails(signerId: string) {
    const { data, error } = await supabase
      .from('signers')
      .select('signature_request_id')
      .eq('id', signerId)
      .single();

    if (error) throw error;
    return data;
  }

  // Check if signature request is complete
  static async checkSignatureRequestCompletion(signatureRequestId: string): Promise<void> {
    const { data: signers, error } = await supabase
      .from('signers')
      .select('status')
      .eq('signature_request_id', signatureRequestId);

    if (error) throw error;

    const allSigned = signers.every(signer => signer.status === 'signed');
    
    if (allSigned) {
      await supabase
        .from('signature_requests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', signatureRequestId);

      await this.createDocumentEvent(signatureRequestId, undefined, 'completed');
    }
  }
}