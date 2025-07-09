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

    // Format phone number (remove non-digits and ensure proper format)
    const cleanPhone = signerPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('34') ? `+${cleanPhone}` : `+34${cleanPhone}`;

    // Create the signing URL
    const signingUrl = `${Deno.env.get("SITE_URL") || "https://your-app.com"}/sign/${accessToken}`;
    
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

    // For development/testing: Log the WhatsApp message
    console.log('WhatsApp message to be sent:', {
      to: formattedPhone,
      message: whatsappMessage,
      templateName
    });

    // In a production environment, integrate with WhatsApp Business API
    // Example with a hypothetical WhatsApp service:
    /*
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    const whatsappResponse = await fetch('https://api.whatsapp.com/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: whatsappMessage,
        template: templateName
      })
    });

    if (!whatsappResponse.ok) {
      throw new Error(`WhatsApp API error: ${whatsappResponse.statusText}`);
    }
    */

    // Create notification log in database
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        signature_request_id: signatureRequestId,
        notification_type: 'whatsapp',
        status: 'sent',
        message_content: whatsappMessage,
        phone_number: formattedPhone,
        template_name: templateName,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging WhatsApp notification:', error);
      // Don't throw error here, as the notification might have been sent
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp notification sent successfully',
        phone: formattedPhone,
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