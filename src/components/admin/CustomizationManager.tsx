import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Eye, Palette, Monitor, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AppCustomization {
  theme_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  app_title: string;
  app_subtitle: string;
  welcome_message: string;
  footer_text: string;
  is_active: boolean;
}

const defaultCustomization: AppCustomization = {
  theme_name: 'default',
  logo_url: '',
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
  accent_color: '#10b981',
  font_family: 'Inter',
  app_title: 'Sistema de Gestión Documental Digital',
  app_subtitle: 'Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales',
  welcome_message: '',
  footer_text: '',
  is_active: true,
};

const CustomizationManager = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AppCustomization>(defaultCustomization);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'app_customization')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.value) {
        setFormData(data.value as unknown as AppCustomization);
      }
    } catch (error) {
      console.error('Error fetching customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'app_customization',
          value: formData as any,
          category: 'appearance',
          is_public: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Personalización guardada correctamente",
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Error",
        description: "Error al guardar la personalización",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Personalización</h2>
          <p className="text-muted-foreground">Configura la apariencia de la aplicación</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los cambios de personalización se aplicarán después de recargar la página.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Configura el título y textos principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme_name">Nombre del Tema</Label>
              <Input
                id="theme_name"
                value={formData.theme_name}
                onChange={(e) => setFormData({...formData, theme_name: e.target.value})}
                placeholder="Nombre del tema"
              />
            </div>

            <div>
              <Label htmlFor="app_title">Título de la Aplicación</Label>
              <Input
                id="app_title"
                value={formData.app_title}
                onChange={(e) => setFormData({...formData, app_title: e.target.value})}
                placeholder="Título principal"
              />
            </div>

            <div>
              <Label htmlFor="app_subtitle">Subtítulo</Label>
              <Textarea
                id="app_subtitle"
                value={formData.app_subtitle}
                onChange={(e) => setFormData({...formData, app_subtitle: e.target.value})}
                placeholder="Subtítulo descriptivo"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
              <Textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
                placeholder="Mensaje de bienvenida para usuarios"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="footer_text">Texto del Pie de Página</Label>
              <Input
                id="footer_text"
                value={formData.footer_text}
                onChange={(e) => setFormData({...formData, footer_text: e.target.value})}
                placeholder="© 2024 Tu Empresa"
              />
            </div>

            <div>
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors and Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colores y Tipografía
            </CardTitle>
            <CardDescription>
              Personaliza los colores y fuentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary_color">Color Primario</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary_color">Color Secundario</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  placeholder="#64748b"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent_color">Color de Acento</Label>
              <div className="flex space-x-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.accent_color}
                  onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                  placeholder="#10b981"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="font_family">Fuente</Label>
              <Input
                id="font_family"
                value={formData.font_family}
                onChange={(e) => setFormData({...formData, font_family: e.target.value})}
                placeholder="Inter"
              />
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Personalización Activa</Label>
            </div>

            {/* Preview */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-2">Vista Previa de Colores</h4>
              <div className="flex space-x-2">
                <div 
                  className="w-12 h-12 rounded border flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  Prim
                </div>
                <div 
                  className="w-12 h-12 rounded border flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: formData.secondary_color }}
                >
                  Sec
                </div>
                <div 
                  className="w-12 h-12 rounded border flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: formData.accent_color }}
                >
                  Acc
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomizationManager;