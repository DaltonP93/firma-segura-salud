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

  // Add signers to a signature request with secure tokens
  static async addSigners(
    signatureRequestId: string,
    signers: Omit<SignerInsert, 'signature_request_id'>[]
  ): Promise<Signer[]> {
    const signersToInsert = signers.map((signer, index) => ({
      ...signer,
      signature_request_id: signatureRequestId,
      signing_order: signer.signing_order || index + 1,
      access_token: crypto.randomUUID(),
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours
      access_attempts: 0,
      max_attempts: 5,
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

    // Send email invitations to all signers
    for (const signer of signatureRequest.signers) {
      try {
        const { error: inviteError } = await supabase.functions.invoke('send-signature-invitation', {
          body: {
            signatureRequestId,
            signerEmail: signer.email,
            signerName: signer.name,
            documentTitle: signatureRequest.title,
            accessToken: signer.access_token,
            message: signatureRequest.message,
            expiresAt: signatureRequest.expires_at,
          },
        });

        if (inviteError) {
          console.error('Error sending invitation to', signer.email, inviteError);
          // Create failed notification log
          await this.createNotificationLog(
            signatureRequestId,
            signer.id,
            'email',
            `Failed to send invitation: ${inviteError.message}`,
            'failed'
          );
        }
      } catch (error) {
        console.error('Error sending invitation to', signer.email, error);
      }
    }
  }

  // Create notification log
  static async createNotificationLog(
    signatureRequestId: string,
    signerId: string,
    notificationType: 'email' | 'sms' | 'whatsapp' | 'push',
    messageContent: string,
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' = 'sent'
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        signature_request_id: signatureRequestId,
        signer_id: signerId,
        notification_type: notificationType,
        message_content: messageContent,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
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

      await this.createDocumentEvent(signatureRequestId, 'completed', undefined);
    }
  }

  // Validate access token
  static async validateAccessToken(accessToken: string): Promise<{
    valid: boolean;
    signer?: Signer;
    error?: string;
  }> {
    try {
      // Check token validity using database function
      const { data: isValid, error: validationError } = await supabase
        .rpc('is_token_valid', { token_value: accessToken });

      if (validationError) throw validationError;

      if (!isValid) {
        return { valid: false, error: 'Token is invalid, expired, or exceeded maximum attempts' };
      }

      // Get signer details
      const signer = await this.getSignerByToken(accessToken);
      if (!signer) {
        return { valid: false, error: 'Signer not found' };
      }

      // Increment access attempts
      await supabase.rpc('increment_access_attempts', { token_value: accessToken });

      return { valid: true, signer };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, error: 'Token validation failed' };
    }
  }

  // Send WhatsApp notification
  static async sendWhatsAppNotification(
    signatureRequestId: string,
    signer: Signer,
    message: string,
    templateName?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          signatureRequestId,
          signerPhone: signer.phone,
          signerName: signer.name,
          message,
          templateName,
          accessToken: signer.access_token,
        },
      });

      if (error) {
        console.error('WhatsApp notification error:', error);
        await this.createNotificationLog(
          signatureRequestId,
          signer.id,
          'whatsapp',
          `Failed to send WhatsApp: ${error.message}`,
          'failed'
        );
        throw error;
      }

      await this.createNotificationLog(
        signatureRequestId,
        signer.id,
        'whatsapp',
        message,
        'sent'
      );
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      throw error;
    }
  }

  // Send signature request with multi-channel notifications
  static async sendSignatureRequestWithNotifications(
    signatureRequestId: string,
    channels: ('email' | 'whatsapp')[] = ['email']
  ): Promise<void> {
    await this.sendSignatureRequest(signatureRequestId);

    // Get signature request details for WhatsApp
    const signatureRequest = await this.getSignatureRequestWithDetails(signatureRequestId);
    if (!signatureRequest) throw new Error('Signature request not found');

    // Send WhatsApp notifications if requested
    if (channels.includes('whatsapp')) {
      for (const signer of signatureRequest.signers) {
        if (signer.phone) {
          const message = `Hola ${signer.name}, tienes un documento para firmar: ${signatureRequest.title}. Haz clic aquí para firmar: ${window.location.origin}/sign/${signer.access_token}`;
          
          try {
            await this.sendWhatsAppNotification(
              signatureRequestId,
              signer,
              message,
              'signature_request'
            );
          } catch (error) {
            console.error('WhatsApp notification failed for', signer.phone, error);
          }
        }
      }
    }
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens(): Promise<number> {
    const { data, error } = await supabase
      .from('signers')
      .update({ is_expired: true })
      .lt('expires_at', new Date().toISOString())
      .eq('is_expired', false)
      .select('id');
    
    if (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
    
    return data?.length || 0;
  }

  // Get signing statistics
  static async getSigningStatistics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    expiredTokens: number;
    averageSigningTime: number;
  }> {
    const { data: requests, error } = await supabase
      .from('signature_requests')
      .select('status, created_at, completed_at');

    if (error) throw error;

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'sent').length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;

    // Get expired tokens count
    const { data: expiredTokens } = await supabase
      .from('signers')
      .select('id')
      .eq('is_expired', true);

    // Calculate average signing time
    const completedWithTimes = requests.filter(r => r.completed_at && r.created_at);
    const averageSigningTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((acc, req) => {
          const diffMs = new Date(req.completed_at!).getTime() - new Date(req.created_at!).getTime();
          return acc + diffMs;
        }, 0) / completedWithTimes.length
      : 0;

    return {
      totalRequests,
      pendingRequests,
      completedRequests,
      expiredTokens: expiredTokens?.length || 0,
      averageSigningTime: averageSigningTime / (1000 * 60 * 60), // Convert to hours
    };
  }
}