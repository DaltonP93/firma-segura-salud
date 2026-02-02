import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Clock, 
  Send, 
  User, 
  Mail, 
  MessageSquare,
  Calendar,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SignatureService } from '@/services/signatureService';

interface PendingSigner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  reminded_at: string | null;
  created_at: string;
  expires_at: string | null;
  signature_request: {
    id: string;
    title: string;
  };
}

interface SignatureRemindersProps {
  signatureRequestId?: string;
}

const SignatureReminders: React.FC<SignatureRemindersProps> = ({ signatureRequestId }) => {
  const { toast } = useToast();
  const [pendingSigners, setPendingSigners] = useState<PendingSigner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [autoReminders, setAutoReminders] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(24);

  useEffect(() => {
    fetchPendingSigners();
  }, [signatureRequestId]);

  const fetchPendingSigners = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('signers')
        .select(`
          id, name, email, phone, status, reminded_at, created_at, expires_at,
          signature_requests (id, title)
        `)
        .in('status', ['pending', 'sent', 'opened'])
        .order('created_at', { ascending: false });

      if (signatureRequestId) {
        query = query.eq('signature_request_id', signatureRequestId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        signature_request: item.signature_requests as { id: string; title: string }
      }));

      setPendingSigners(formattedData as PendingSigner[]);
    } catch (error) {
      console.error('Error fetching pending signers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendReminder = async (signer: PendingSigner) => {
    try {
      setSending(signer.id);

      // Update reminded_at timestamp
      const { error: updateError } = await supabase
        .from('signers')
        .update({ reminded_at: new Date().toISOString() })
        .eq('id', signer.id);

      if (updateError) throw updateError;

      // Create document event
      await SignatureService.createDocumentEvent(
        signer.signature_request.id,
        'reminded',
        signer.id,
        { reminder_type: 'manual' }
      );

      // Log notification
      await SignatureService.createNotificationLog(
        signer.signature_request.id,
        signer.id,
        'email',
        `Recordatorio enviado a ${signer.email}`,
        'sent'
      );

      toast({
        title: "Recordatorio enviado",
        description: `Se ha enviado un recordatorio a ${signer.name}`
      });

      fetchPendingSigners();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el recordatorio",
        variant: "destructive"
      });
    } finally {
      setSending(null);
    }
  };

  const sendBulkReminders = async () => {
    const eligibleSigners = pendingSigners.filter(s => canSendReminder(s));
    
    for (const signer of eligibleSigners) {
      await sendReminder(signer);
    }
  };

  const canSendReminder = (signer: PendingSigner) => {
    if (!signer.reminded_at) return true;
    
    const lastReminder = new Date(signer.reminded_at);
    const hoursSinceReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);
    return hoursSinceReminder >= reminderInterval;
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const hoursUntilExpiry = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours} horas`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} días`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'opened': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviado';
      case 'opened': return 'Abierto';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          Cargando firmantes pendientes...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Configuración de Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios Automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Enviar recordatorios automáticamente a firmantes pendientes
              </p>
            </div>
            <Switch 
              checked={autoReminders} 
              onCheckedChange={setAutoReminders}
            />
          </div>
          
          {autoReminders && (
            <div className="flex items-center gap-4">
              <Label>Intervalo entre recordatorios:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(parseInt(e.target.value) || 24)}
                  className="w-20"
                  min={1}
                  max={168}
                />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
            </div>
          )}

          {pendingSigners.length > 0 && (
            <Button 
              variant="outline" 
              onClick={sendBulkReminders}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Recordatorios a Todos ({pendingSigners.filter(s => canSendReminder(s)).length})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pending Signers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Firmantes Pendientes ({pendingSigners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSigners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay firmantes pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSigners.map((signer) => (
                <div 
                  key={signer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{signer.name}</p>
                        <Badge className={getStatusColor(signer.status)}>
                          {getStatusText(signer.status)}
                        </Badge>
                        {signer.expires_at && isExpiringSoon(signer.expires_at) && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Expira pronto
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {signer.email}
                        </span>
                        {signer.phone && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {signer.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Creado: {formatTimeSince(signer.created_at)}
                        </span>
                        {signer.reminded_at && (
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            Último recordatorio: {formatTimeSince(signer.reminded_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendReminder(signer)}
                    disabled={sending === signer.id || !canSendReminder(signer)}
                  >
                    {sending === signer.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        Recordar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureReminders;
