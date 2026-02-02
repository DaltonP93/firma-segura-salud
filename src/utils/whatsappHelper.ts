/**
 * Helper para generar enlaces de WhatsApp sin necesidad de API
 * Funciona en móvil y en web/desktop
 */

/**
 * Formatea un número de teléfono a formato internacional (sin +, guiones o paréntesis)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Eliminar todo excepto dígitos
  return phone.replace(/\D/g, '');
}

/**
 * Construye los enlaces de WhatsApp (oficial y fallback)
 * @param phoneIntl - Número en formato internacional (ej: 5491122334455)
 * @param message - Mensaje a prellenar
 */
export function buildWhatsAppLinks(phoneIntl: string, message: string) {
  const cleanPhone = formatPhoneForWhatsApp(phoneIntl);
  const encodedMessage = encodeURIComponent(message);
  
  return {
    // wa.me es el oficial y preferido
    waMe: `https://wa.me/${cleanPhone}?text=${encodedMessage}`,
    // api.whatsapp.com como fallback
    waApi: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
  };
}

/**
 * Genera el mensaje de firma prellenado con variables
 */
export function buildSignatureMessage(params: {
  clientName: string;
  requestNumber: string;
  signUrl: string;
  documents?: string[];
}): string {
  const { clientName, requestNumber, signUrl, documents } = params;
  
  let message = `Hola ${clientName},\n\n`;
  message += `Tu solicitud de seguro ${requestNumber} está lista para tu revisión y firma.\n\n`;
  
  if (documents && documents.length > 0) {
    message += `Documentos incluidos:\n`;
    documents.forEach((doc, i) => {
      message += `${i + 1}. ${doc}\n`;
    });
    message += '\n';
  }
  
  message += `Para revisar y firmar tus documentos, ingresa al siguiente enlace:\n`;
  message += `${signUrl}\n\n`;
  message += `¡Gracias por confiar en nosotros!`;
  
  return message;
}

/**
 * Abre WhatsApp en una nueva pestaña con el mensaje prellenado
 */
export function openWhatsApp(phone: string, message: string): void {
  const { waMe } = buildWhatsAppLinks(phone, message);
  window.open(waMe, '_blank');
}

/**
 * Copia el enlace de WhatsApp al portapapeles
 */
export async function copyWhatsAppLink(phone: string, message: string): Promise<boolean> {
  const { waMe } = buildWhatsAppLinks(phone, message);
  try {
    await navigator.clipboard.writeText(waMe);
    return true;
  } catch {
    return false;
  }
}
