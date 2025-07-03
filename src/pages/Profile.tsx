
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Building, Save, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import ProfileImageUpload from '@/components/ProfileImageUpload';

const Profile = () => {
  const { toast } = useToast();
  const { profile, isLoading } = useUserRole();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    company: '',
    profile_image_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        company: profile.company || '',
        profile_image_url: profile.profile_image_url || '',
      });
    }
  }, [profile]);

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
    setFormData(prev => ({ ...prev, profile_image_url: imageUrl }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información de Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Upload */}
            {profile && (
              <ProfileImageUpload
                userId={profile.id}
                currentImageUrl={formData.profile_image_url}
                fullName={formData.full_name}
                onImageUpdate={handleImageUpdate}
              />
            )}

            <Separator />

            {/* Profile Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Activo
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rol</span>
                <Badge className={getRoleBadgeColor(profile?.role || 'user')}>
                  <Shield className="w-3 h-3 mr-1" />
                  {profile?.role === 'super_admin' ? 'Super Admin' :
                   profile?.role === 'admin' ? 'Admin' :
                   profile?.role === 'moderator' ? 'Moderador' : 'Usuario'}
                </Badge>
              </div>
              
              {profile?.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Miembro desde</span>
                  <span className="text-sm text-gray-600">
                    {new Date(profile.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar Información</CardTitle>
            <CardDescription>
              Actualiza tu información personal y de contacto
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
                <Mail className="w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500">
                El email no se puede cambiar desde aquí
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
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
                  <Building className="w-4 h-4 text-gray-400" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Mi Empresa S.L."
                  />
                </div>
              </div>
            </div>

            <Separator />

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
                      profile_image_url: profile.profile_image_url || '',
                    });
                  }
                }}
              >
                Cancelar Cambios
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cuenta</CardTitle>
          <CardDescription>
            Configuraciones avanzadas de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Seguridad</h4>
              <Button variant="outline" className="w-full justify-start">
                Cambiar Contraseña
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Configurar 2FA
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Preferencias</h4>
              <Button variant="outline" className="w-full justify-start">
                Notificaciones
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacidad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
