
import { supabase } from "@/integrations/supabase/client";
import { BaseService } from "./baseService";
import type { Notification } from "@/components/notifications/NotificationItem";

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'document' | 'system' | 'user' | 'general';
  details?: string;
  actionUrl?: string;
  actionText?: string;
  userId?: string;
}

export class NotificationsService extends BaseService {
  constructor() {
    super('notifications' as any);
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const notificationData = {
        id: crypto.randomUUID(),
        title: data.title,
        message: data.message,
        time: new Date().toLocaleString('es-ES'),
        read: false,
        type: data.type,
        category: data.category,
        details: data.details,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        user_id: data.userId || (await this.getCurrentUserId()),
        created_at: new Date().toISOString(),
      };

      // For now, we'll store notifications in localStorage since we don't have a notifications table
      const existingNotifications = this.getStoredNotifications();
      const updatedNotifications = [notificationData, ...existingNotifications];
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      return notificationData as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId?: string): Promise<Notification[]> {
    try {
      // For now, get from localStorage
      return this.getStoredNotifications();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = this.getStoredNotifications();
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const notifications = this.getStoredNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async removeNotification(notificationId: string): Promise<void> {
    try {
      const notifications = this.getStoredNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }

  private getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  // Sales-specific notification methods
  async notifySalesRequestCreated(requestNumber: string, clientName: string): Promise<void> {
    await this.createNotification({
      title: 'Nueva Solicitud Creada',
      message: `Solicitud ${requestNumber} para ${clientName} ha sido creada`,
      type: 'success',
      category: 'document',
      details: 'La solicitud requiere completar la declaración jurada de salud',
      actionUrl: '/sales',
      actionText: 'Ver Solicitud'
    });
  }

  async notifyHealthDeclarationCompleted(requestNumber: string, clientName: string): Promise<void> {
    await this.createNotification({
      title: 'Declaración de Salud Completada',
      message: `Declaración jurada completada para ${clientName}`,
      type: 'success',
      category: 'document',
      details: `Solicitud ${requestNumber} está lista para generar documentos`,
      actionUrl: '/sales',
      actionText: 'Gestionar Documentos'
    });
  }

  async notifyDocumentGenerated(requestNumber: string, clientName: string, documentType: string): Promise<void> {
    await this.createNotification({
      title: 'Documento Generado',
      message: `${documentType} generado para ${clientName}`,
      type: 'success',
      category: 'document',
      details: `Solicitud ${requestNumber} - Documento listo para envío`,
      actionUrl: '/sales',
      actionText: 'Enviar para Firma'
    });
  }

  async notifyDocumentSentForSignature(requestNumber: string, clientName: string): Promise<void> {
    await this.createNotification({
      title: 'Documento Enviado para Firma',
      message: `Documento enviado a ${clientName} para firma digital`,
      type: 'info',
      category: 'document',
      details: `Solicitud ${requestNumber} - Esperando firma del cliente`,
      actionUrl: '/sales',
      actionText: 'Ver Estado'
    });
  }

  async notifyDocumentSigned(requestNumber: string, clientName: string): Promise<void> {
    await this.createNotification({
      title: 'Documento Firmado',
      message: `${clientName} ha firmado el documento`,
      type: 'success',
      category: 'document',
      details: `Solicitud ${requestNumber} completada exitosamente`,
      actionUrl: '/sales',
      actionText: 'Ver Detalles'
    });
  }

  async notifyRequestStatusChanged(requestNumber: string, clientName: string, newStatus: string): Promise<void> {
    const statusMessages = {
      'pending_health_declaration': 'Pendiente de declaración de salud',
      'pending_signature': 'Pendiente de firma',
      'completed': 'Completada',
      'rejected': 'Rechazada'
    };

    await this.createNotification({
      title: 'Estado de Solicitud Actualizado',
      message: `Solicitud ${requestNumber} - ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}`,
      type: newStatus === 'completed' ? 'success' : 'info',
      category: 'system',
      details: `Cliente: ${clientName}`,
      actionUrl: '/sales',
      actionText: 'Ver Solicitud'
    });
  }
}

export const notificationsService = new NotificationsService();
