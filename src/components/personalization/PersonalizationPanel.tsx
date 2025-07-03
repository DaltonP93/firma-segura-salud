
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePersonalization } from './PersonalizationProvider';
import { Palette, Monitor, Layout, Bell, RotateCcw } from 'lucide-react';

const PersonalizationPanel = () => {
  const { settings, updateSettings, resetToDefaults } = usePersonalization();

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
        <Card>
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
