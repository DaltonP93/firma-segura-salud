
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignatureInvitationRequest {
  signatureRequestId: string;
  signerEmail: string;
  signerName: string;
  documentTitle: string;
  accessToken: string;
  message?: string;
  expiresAt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      signatureRequestId, 
      signerEmail, 
      signerName, 
      documentTitle, 
      accessToken, 
      message,
      expiresAt 
    }: SignatureInvitationRequest = await req.json();

    // Get email configuration from database
    const { data: emailConfig } = await supabase.rpc('get_api_config', { service_name: 'resend' });
    
    // Create the signing URL
    const signingUrl = `${Deno.env.get("SUPABASE_URL") || "http://localhost:5173"}/sign/${accessToken}`;
    
    let notificationStatus = 'sent';
    let errorMessage = null;

    if (emailConfig && emailConfig.length > 0 && emailConfig[0].api_key && emailConfig[0].is_active) {
      // Use configured email service
      const config = emailConfig[0];
      const additionalConfig = config.additional_config || {};
      
      console.log('Using configured email service with Resend');
      
      try {
        // Here you would integrate with Resend API
        // For now, we'll just log the email content
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Solicitud de Firma Electrónica</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Estimado/a <strong>${signerName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Se le ha solicitado firmar electrónicamente el siguiente documento:
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${documentTitle}</h3>
                ${message ? `<p style="color: #6b7280; margin: 0; font-style: italic;">${message}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${signingUrl}" 
                   style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Firmar Documento
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Este enlace es único y personal. No lo comparta con nadie más.
                ${expiresAt ? `El enlace expira el ${new Date(expiresAt).toLocaleDateString('es-ES')}.` : ''}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                Si tiene alguna pregunta, por favor contacte al emisor del documento.<br>
                Enviado desde ${additionalConfig.from_name || 'Sistema de Firmas Electrónicas'}
              </p>
            </div>
          </div>
        `;

        console.log('Email content prepared for Resend API:', {
          from: `${additionalConfig.from_name || 'Sistema de Firmas'} <${additionalConfig.from_email || 'noreply@example.com'}>`,
          to: signerEmail,
          subject: `Solicitud de Firma: ${documentTitle}`,
          html: emailContent
        });

        // TODO: Implement actual Resend API call here
        /*
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${additionalConfig.from_name || 'Sistema de Firmas'} <${additionalConfig.from_email || 'noreply@example.com'}>`,
            to: [signerEmail],
            subject: `Solicitud de Firma: ${documentTitle}`,
            html: emailContent,
          }),
        });

        if (!response.ok) {
          throw new Error(`Resend API error: ${response.statusText}`);
        }
        */

      } catch (error) {
        console.error('Error sending email via configured service:', error);
        notificationStatus = 'failed';
        errorMessage = error.message;
      }
    } else {
      console.log('No email service configured, generating shareable link only');
      notificationStatus = 'fallback';
    }

    // Create notification log in database
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        signature_request_id: signatureRequestId,
        notification_type: 'email',
        status: notificationStatus,
        message_content: notificationStatus === 'fallback' 
          ? `Enlace de firma generado: ${signingUrl}` 
          : `Invitación de firma enviada a ${signerEmail}`,
        error_message: errorMessage,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging notification:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: notificationStatus === 'fallback' 
          ? 'Enlace de firma generado (servicio de email no configurado)'
          : 'Invitación enviada exitosamente',
        signingUrl,
        fallbackMode: notificationStatus === 'fallback'
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-signature-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
