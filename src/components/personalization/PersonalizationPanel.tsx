

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePersonalization } from './PersonalizationProvider';
import { Palette, Monitor, Layout, Bell, RotateCcw, Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PersonalizationPanel = () => {
  const { settings, updateSettings, resetToDefaults } = usePersonalization();
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);

  const handleBackgroundImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileName = `${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('background-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('background-images')
        .getPublicUrl(fileName);

      updateSettings({ backgroundImageUrl: publicUrl });

      toast({
        title: "Éxito",
        description: "Imagen de fondo subida correctamente",
      });
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast({
        title: "Error",
        description: "Error al subir la imagen de fondo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeBackgroundImage = () => {
    updateSettings({ backgroundImageUrl: undefined });
    toast({
      title: "Imagen removida",
      description: "La imagen de fondo ha sido removida",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Personalización</h2>
        <p className="text-gray-600">Configura la apariencia y comportamiento de la aplicación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Tema y Colores
            </CardTitle>
            <CardDescription>
              Personaliza el tema y los colores de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => 
                updateSettings({ theme: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="primary-color">Color Primario</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent-color">Color de Acento</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accent-color"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateSettings({ accentColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => updateSettings({ accentColor: e.target.value })}
                  placeholder="#10b981"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="font-family">Familia de Fuente</Label>
              <Select value={settings.fontFamily} onValueChange={(value) => 
                updateSettings({ fontFamily: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Background Image Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Imagen de Fondo
            </CardTitle>
            <CardDescription>
              Personaliza la imagen de fondo de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Imagen de Fondo Actual</Label>
              {settings.backgroundImageUrl ? (
                <div className="space-y-2">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <img 
                      src={settings.backgroundImageUrl} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={removeBackgroundImage}
                    className="w-full"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remover Imagen de Fondo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No hay imagen de fondo configurada</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBackgroundImageUpload(file);
                    }}
                    disabled={uploading}
                    className="w-full"
                  />
                  {uploading && (
                    <p className="text-xs text-gray-500 mt-1">Subiendo...</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Diseño y Interfaz
            </CardTitle>
            <CardDescription>
              Configura el diseño y comportamiento de la interfaz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Modo Compacto</Label>
                <p className="text-sm text-gray-500">Reduce el espaciado para mostrar más contenido</p>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="dashboard-layout">Diseño del Dashboard</Label>
              <Select value={settings.dashboardLayout} onValueChange={(value: 'grid' | 'list') => 
                updateSettings({ dashboardLayout: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Cuadrícula</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="welcome-message">Mostrar Mensaje de Bienvenida</Label>
                <p className="text-sm text-gray-500">Muestra un mensaje personalizado en el dashboard</p>
              </div>
              <Switch
                id="welcome-message"
                checked={settings.showWelcomeMessage}
                onCheckedChange={(checked) => updateSettings({ showWelcomeMessage: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura las preferencias de notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificaciones Activadas</Label>
                <p className="text-sm text-gray-500">Recibe notificaciones sobre actividad importante</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configuraciones del sistema y restauración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Configuración por Defecto
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizationPanel;
