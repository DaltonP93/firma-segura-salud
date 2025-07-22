
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success' as const,
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  ERROR: 'error' as const,
};

export const NOTIFICATION_CATEGORIES = {
  DOCUMENT: 'document' as const,
  SYSTEM: 'system' as const,
  USER: 'user' as const,
  GENERAL: 'general' as const,
};

export const SALES_NOTIFICATION_MESSAGES = {
  REQUEST_CREATED: {
    title: 'Nueva Solicitud Creada',
    getMessage: (requestNumber: string, clientName: string) => 
      `Solicitud ${requestNumber} para ${clientName} ha sido creada`,
  },
  HEALTH_DECLARATION_COMPLETED: {
    title: 'Declaración de Salud Completada',
    getMessage: (clientName: string) => 
      `Declaración jurada completada para ${clientName}`,
  },
  DOCUMENT_GENERATED: {
    title: 'Documento Generado',
    getMessage: (documentType: string, clientName: string) => 
      `${documentType} generado para ${clientName}`,
  },
  DOCUMENT_SENT_FOR_SIGNATURE: {
    title: 'Documento Enviado para Firma',
    getMessage: (clientName: string) => 
      `Documento enviado a ${clientName} para firma digital`,
  },
  DOCUMENT_SIGNED: {
    title: 'Documento Firmado',
    getMessage: (clientName: string) => 
      `${clientName} ha firmado el documento`,
  },
  STATUS_CHANGED: {
    title: 'Estado de Solicitud Actualizado',
    getMessage: (requestNumber: string, status: string) => 
      `Solicitud ${requestNumber} - ${status}`,
  },
};

export const STATUS_DISPLAY_NAMES = {
  'pending_health_declaration': 'Pendiente de declaración de salud',
  'pending_signature': 'Pendiente de firma',
  'completed': 'Completada',
  'rejected': 'Rechazada',
  'draft': 'Borrador',
};
