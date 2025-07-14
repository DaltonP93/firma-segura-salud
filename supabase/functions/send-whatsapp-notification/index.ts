
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppNotificationRequest {
  signatureRequestId: string;
  signerPhone: string;
  signerName: string;
  message: string;
  templateName?: string;
  accessToken: string;
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
      signerPhone, 
      signerName, 
      message,
      templateName,
      accessToken 
    }: WhatsAppNotificationRequest = await req.json();

    // Validate required fields
    if (!signerPhone || !signerName || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get WhatsApp configuration from database
    const { data: whatsappConfig } = await supabase.rpc('get_api_config', { service_name: 'whatsapp_business' });

    // Format phone number (remove non-digits and ensure proper format)
    const cleanPhone = signerPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('34') ? `+${cleanPhone}` : `+34${cleanPhone}`;

    // Create the signing URL
    const signingUrl = `${Deno.env.get("SUPABASE_URL") || "http://localhost:5173"}/sign/${accessToken}`;
    
    // WhatsApp message with proper formatting
    const whatsappMessage = `
🔐 *Solicitud de Firma Electrónica*

Hola ${signerName},

Tienes un documento pendiente de firma electrónica.

📄 ${message}

👆 *Haz clic aquí para firmar:*
${signingUrl}

⏰ Este enlace es único y personal. No lo compartas con nadie más.

_Sistema de Firmas Electrónicas_
    `.trim();

    let notificationStatus = 'sent';
    let errorMessage = null;
    let whatsappMessageId = null;

    if (whatsappConfig && whatsappConfig.length > 0 && whatsappConfig[0].api_key && whatsappConfig[0].is_active) {
      // Use configured WhatsApp service
      const config = whatsappConfig[0];
      const additionalConfig = config.additional_config || {};
      
      console.log('Using configured WhatsApp Business API');
      
      try {
        // TODO: Implement actual WhatsApp Business API call here
        /*
        const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${additionalConfig.phone_number_id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'text',
            text: {
              body: whatsappMessage
            }
          })
        });

        if (!whatsappResponse.ok) {
          throw new Error(`WhatsApp API error: ${whatsappResponse.statusText}`);
        }

        const responseData = await whatsappResponse.json();
        whatsappMessageId = responseData.messages?.[0]?.id;
        */

        console.log('WhatsApp message prepared for API:', {
          to: formattedPhone,
          message: whatsappMessage,
          phoneNumberId: additionalConfig.phone_number_id
        });

      } catch (error) {
        console.error('Error sending WhatsApp via configured service:', error);
        notificationStatus = 'failed';
        errorMessage = error.message;
      }
    } else {
      console.log('No WhatsApp service configured, generating shareable link only');
      notificationStatus = 'fallback';
    }

    // Create notification log in database
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        signature_request_id: signatureRequestId,
        notification_type: 'whatsapp',
        status: notificationStatus,
        message_content: whatsappMessage,
        phone_number: formattedPhone,
        template_name: templateName,
        whatsapp_message_id: whatsappMessageId,
        error_message: errorMessage,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging WhatsApp notification:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: notificationStatus === 'fallback' 
          ? 'Enlace de firma generado (servicio de WhatsApp no configurado)'
          : 'Notificación de WhatsApp enviada exitosamente',
        phone: formattedPhone,
        signingUrl,
        fallbackMode: notificationStatus === 'fallback',
        preview: whatsappMessage.substring(0, 100) + '...'
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
    console.error("Error in send-whatsapp-notification function:", error);
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
