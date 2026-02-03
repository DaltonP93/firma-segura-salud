import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Building, Save, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import ProfileStats from '@/components/profile/ProfileStats';
import ActivityHistory from '@/components/profile/ActivityHistory';
import SecuritySettings from '@/components/profile/SecuritySettings';

const Profile = () => {
  const { toast } = useToast();
  const { profile, isLoading } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ sales: 0, documents: 0, signatures: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    company: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        company: profile.company || '',
        avatar_url: profile.avatar_url || '',
      });
      fetchStats();
      fetchActivities();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;
    
    try {
      // Fetch sales count
      const { count: salesCount } = await supabase
        .from('sales_requests')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', profile.id);

      // Fetch documents count  
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', profile.id);

      // Fetch signatures count
      const { count: signaturesCount } = await supabase
        .from('signature_requests')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', profile.id);

      setStats({
        sales: salesCount || 0,
        documents: documentsCount || 0,
        signatures: signaturesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async () => {
    if (!profile) return;

    try {
      // Fetch recent audit logs for this user
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logs) {
        setActivities(logs.map(log => ({
          id: log.id,
          type: log.entity_type === 'sales_requests' ? 'sale' : 
                log.entity_type === 'documents' ? 'document' : 
                log.entity_type === 'signature_requests' ? 'signature' : 'login',
          description: log.action,
          timestamp: new Date(log.created_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        })));
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          phone: formData.phone,
          company: formData.company,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdate = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'default';
      case 'supervisor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'supervisor':
        return 'Supervisor';
      case 'agent':
        return 'Agente';
      default:
        return 'Usuario';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              {profile && (
                <ProfileImageUpload
                  userId={profile.id}
                  currentImageUrl={formData.avatar_url}
                  fullName={formData.full_name}
                  onImageUpdate={handleImageUpdate}
                />
              )}

              <Separator />

              {/* Profile Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado</span>
                  <Badge variant="default">Activo</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rol</span>
                  <Badge variant={getRoleBadgeVariant(profile?.role || 'user')}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleLabel(profile?.role || 'user')}
                  </Badge>
                </div>
                
                {profile?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Miembro desde</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <ProfileStats
            salesCount={stats.sales}
            documentsCount={stats.documents}
            signaturesCount={stats.signatures}
          />
        </div>

        {/* Right Column - Edit Form & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="juan_perez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar desde aquí
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+34 123 456 789"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Mi Empresa S.L."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (profile) {
                      setFormData({
                        full_name: profile.full_name || '',
                        username: profile.username || '',
                        phone: profile.phone || '',
                        company: profile.company || '',
                        avatar_url: profile.avatar_url || '',
                      });
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          {profile && <SecuritySettings userId={profile.id} />}

          {/* Activity History */}
          <ActivityHistory activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
