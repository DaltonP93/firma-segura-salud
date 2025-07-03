
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Upload, Save, Eye, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompanyType {
  id: string;
  name: string;
  description: string;
}

interface AppCustomization {
  id: string;
  company_type_id: string;
  theme_name: string;
  logo_url: string | null;
  background_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  app_title: string;
  app_subtitle: string;
  welcome_message: string | null;
  footer_text: string | null;
  custom_css: string | null;
  is_active: boolean;
}

const CustomizationManager = () => {
  const { toast } = useToast();
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [customizations, setCustomizations] = useState<AppCustomization[]>([]);
  const [selectedCustomization, setSelectedCustomization] = useState<AppCustomization | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    company_type_id: '',
    theme_name: 'default',
    logo_url: '',
    background_image_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    accent_color: '#10b981',
    font_family: 'Inter',
    app_title: 'Sistema de Gestión Documental Digital',
    app_subtitle: 'Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales',
    welcome_message: '',
    footer_text: '',
    custom_css: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companyTypesRes, customizationsRes] = await Promise.all([
        supabase.from('company_types').select('*').eq('is_active', true),
        supabase.from('app_customization').select('*').order('created_at', { ascending: false })
      ]);

      if (companyTypesRes.error) throw companyTypesRes.error;
      if (customizationsRes.error) throw customizationsRes.error;

      setCompanyTypes(companyTypesRes.data || []);
      setCustomizations(customizationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedCustomization) {
        // Update existing
        const { error } = await supabase
          .from('app_customization')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedCustomization.id);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Personalización actualizada correctamente",
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('app_customization')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Nueva personalización creada correctamente",
        });
      }

      await fetchData();
      setIsEditing(false);
      setSelectedCustomization(null);
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Error",
        description: "Error al guardar la personalización",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customization: AppCustomization) => {
    setSelectedCustomization(customization);
    setFormData({
      company_type_id: customization.company_type_id,
      theme_name: customization.theme_name,
      logo_url: customization.logo_url || '',
      background_image_url: customization.background_image_url || '',
      primary_color: customization.primary_color,
      secondary_color: customization.secondary_color,
      accent_color: customization.accent_color,
      font_family: customization.font_family,
      app_title: customization.app_title,
      app_subtitle: customization.app_subtitle,
      welcome_message: customization.welcome_message || '',
      footer_text: customization.footer_text || '',
      custom_css: customization.custom_css || '',
      is_active: customization.is_active,
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedCustomization(null);
    setFormData({
      company_type_id: '',
      theme_name: 'default',
      logo_url: '',
      background_image_url: '',
      primary_color: '#3b82f6',
      secondary_color: '#64748b',
      accent_color: '#10b981',
      font_family: 'Inter',
      app_title: 'Sistema de Gestión Documental Digital',
      app_subtitle: 'Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales',
      welcome_message: '',
      footer_text: '',
      custom_css: '',
      is_active: true,
    });
    setIsEditing(true);
  };

  const handleToggleActive = async (customization: AppCustomization) => {
    try {
      const { error } = await supabase
        .from('app_customization')
        .update({ is_active: !customization.is_active })
        .eq('id', customization.id);

      if (error) throw error;
      await fetchData();
      toast({
        title: "Éxito",
        description: `Personalización ${!customization.is_active ? 'activada' : 'desactivada'}`,
      });
    } catch (error) {
      console.error('Error toggling customization:', error);
      toast({
        title: "Error",
        description: "Error al cambiar el estado",
        variant: "destructive",
      });
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
          <p className="text-gray-600">Configura la apariencia y contenido de la aplicación</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Personalización
        </Button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customizations.map((customization) => {
            const companyType = companyTypes.find(ct => ct.id === customization.company_type_id);
            return (
              <Card key={customization.id} className={`relative ${customization.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customization.theme_name}</CardTitle>
                    <Badge variant={customization.is_active ? 'default' : 'secondary'}>
                      {customization.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {companyType?.description || 'Sin tipo de empresa'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">{customization.app_title}</p>
                    <p className="text-xs text-gray-500">{customization.app_subtitle}</p>
                    <div className="flex space-x-2">
                      <div 
                        className="w-4 h-4 rounded border" 
                        style={{ backgroundColor: customization.primary_color }}
                        title="Color Primario"
                      />
                      <div 
                        className="w-4 h-4 rounded border" 
                        style={{ backgroundColor: customization.secondary_color }}
                        title="Color Secundario"
                      />
                      <div 
                        className="w-4 h-4 rounded border" 
                        style={{ backgroundColor: customization.accent_color }}
                        title="Color de Acento"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(customization)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant={customization.is_active ? "destructive" : "default"}
                      onClick={() => handleToggleActive(customization)}
                    >
                      {customization.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCustomization ? 'Editar Personalización' : 'Nueva Personalización'}
            </CardTitle>
            <CardDescription>
              Configura la apariencia y contenido de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_type">Tipo de Empresa</Label>
                  <Select value={formData.company_type_id} onValueChange={(value) => setFormData({...formData, company_type_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <Input
                    id="app_subtitle"
                    value={formData.app_subtitle}
                    onChange={(e) => setFormData({...formData, app_subtitle: e.target.value})}
                    placeholder="Subtítulo descriptivo"
                  />
                </div>

                <div>
                  <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
                  <Textarea
                    id="welcome_message"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
                    placeholder="Mensaje de bienvenida personalizado"
                  />
                </div>
              </div>

              <div className="space-y-4">
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
                  <Label htmlFor="font_family">Familia de Fuente</Label>
                  <Select value={formData.font_family} onValueChange={(value) => setFormData({...formData, font_family: value})}>
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Configuración Activa</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="custom_css">CSS Personalizado</Label>
              <Textarea
                id="custom_css"
                value={formData.custom_css}
                onChange={(e) => setFormData({...formData, custom_css: e.target.value})}
                placeholder="Agrega CSS personalizado aquí..."
                className="h-32"
              />
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomizationManager;
