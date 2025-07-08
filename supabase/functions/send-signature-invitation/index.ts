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

    // Create the signing URL
    const signingUrl = `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/sign/${accessToken}`;
    
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
            Este es un mensaje automático, por favor no responda a este correo.
          </p>
        </div>
      </div>
    `;

    // For now, we'll just log the email content and create a notification log
    // In a real implementation, you would integrate with an email service like Resend
    console.log('Email to be sent:', {
      to: signerEmail,
      subject: `Solicitud de Firma: ${documentTitle}`,
      html: emailContent
    });

    // Create notification log in database
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        signature_request_id: signatureRequestId,
        notification_type: 'email',
        status: 'sent',
        message_content: `Invitación de firma enviada a ${signerEmail}`,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        signingUrl 
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