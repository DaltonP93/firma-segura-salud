
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, X, Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AppCustomization {
  id: string;
  theme_name: string;
  company_type_id: string;
}

interface SectionCustomization {
  id: string;
  app_customization_id: string;
  section_key: string;
  section_title: string | null;
  section_description: string | null;
  icon_name: string | null;
  background_color: string | null;
  text_color: string | null;
  is_visible: boolean;
  sort_order: number;
  custom_properties: any;
}

const availableIcons = [
  'FileText', 'Users', 'Send', 'CheckCircle', 'Layers', 'Plus', 
  'Settings', 'Palette', 'Building', 'Home', 'User', 'Mail',
  'Phone', 'Calendar', 'Clock', 'Star', 'Heart', 'Shield'
];

const defaultSections = [
  { key: 'dashboard', title: 'Dashboard', description: 'Panel principal con estadísticas' },
  { key: 'templates', title: 'Plantillas', description: 'Gestión de plantillas de documentos' },
  { key: 'pdf-templates', title: 'Plantillas PDF', description: 'Plantillas PDF personalizables' },
  { key: 'pdf-generator', title: 'Generador PDF', description: 'Crear documentos PDF' },
  { key: 'contracts', title: 'Contratos', description: 'Generar nuevos contratos' },
  { key: 'documents', title: 'Documentos', description: 'Gestión de documentos' },
];

const SectionCustomizer = () => {
  const { toast } = useToast();
  const [customizations, setCustomizations] = useState<AppCustomization[]>([]);
  const [selectedCustomization, setSelectedCustomization] = useState<string>('');
  const [sections, setSections] = useState<SectionCustomization[]>([]);
  const [editingSection, setEditingSection] = useState<SectionCustomization | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    section_key: '',
    section_title: '',
    section_description: '',
    icon_name: '',
    background_color: '',
    text_color: '',
    is_visible: true,
    sort_order: 0,
    custom_properties: {},
  });

  useEffect(() => {
    fetchCustomizations();
  }, []);

  useEffect(() => {
    if (selectedCustomization) {
      fetchSections();
    }
  }, [selectedCustomization]);

  const fetchCustomizations = async () => {
    try {
      const { data, error } = await supabase
        .from('app_customization')
        .select('id, theme_name, company_type_id')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomizations(data || []);
      if (data && data.length > 0) {
        setSelectedCustomization(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching customizations:', error);
      toast({
        title: "Error",
        description: "Error al cargar las personalizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedCustomization) return;

    try {
      const { data, error } = await supabase
        .from('section_customization')
        .select('*')
        .eq('app_customization_id', selectedCustomization)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Error al cargar las secciones",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (editingSection) {
        // Update existing
        const { error } = await supabase
          .from('section_customization')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSection.id);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Sección actualizada correctamente",
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('section_customization')
          .insert([{
            ...formData,
            app_customization_id: selectedCustomization,
          }]);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Nueva sección creada correctamente",
        });
      }

      await fetchSections();
      handleCancel();
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: "Error",
        description: "Error al guardar la sección",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (section: SectionCustomization) => {
    setEditingSection(section);
    setFormData({
      section_key: section.section_key,
      section_title: section.section_title || '',
      section_description: section.section_description || '',
      icon_name: section.icon_name || '',
      background_color: section.background_color || '',
      text_color: section.text_color || '',
      is_visible: section.is_visible,
      sort_order: section.sort_order,
      custom_properties: section.custom_properties || {},
    });
    setIsCreating(false);
  };

  const handleNew = () => {
    setEditingSection(null);
    setFormData({
      section_key: '',
      section_title: '',
      section_description: '',
      icon_name: '',
      background_color: '',
      text_color: '',
      is_visible: true,
      sort_order: sections.length,
      custom_properties: {},
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setIsCreating(false);
    setFormData({
      section_key: '',
      section_title: '',
      section_description: '',
      icon_name: '',
      background_color: '',
      text_color: '',
      is_visible: true,
      sort_order: 0,
      custom_properties: {},
    });
  };

  const handleToggleVisibility = async (section: SectionCustomization) => {
    try {
      const { error } = await supabase
        .from('section_customization')
        .update({ 
          is_visible: !section.is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', section.id);

      if (error) throw error;
      await fetchSections();
      toast({
        title: "Éxito",
        description: `Sección ${!section.is_visible ? 'mostrada' : 'ocultada'}`,
      });
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      toast({
        title: "Error",
        description: "Error al cambiar la visibilidad",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando...</div>;
  }

  const selectedCustomizationData = customizations.find(c => c.id === selectedCustomization);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalización de Secciones</h2>
          <p className="text-gray-600">Configura la apariencia de cada sección de la aplicación</p>
        </div>
        <Button onClick={handleNew} disabled={!selectedCustomization}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sección
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Personalización</CardTitle>
          <CardDescription>Elige la personalización que deseas modificar</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomization} onValueChange={setSelectedCustomization}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una personalización" />
            </SelectTrigger>
            <SelectContent>
              {customizations.map((customization) => (
                <SelectItem key={customization.id} value={customization.id}>
                  {customization.theme_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {(isCreating || editingSection) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSection ? 'Editar Sección' : 'Nueva Sección'}
            </CardTitle>
            <CardDescription>
              Configura la apariencia y comportamiento de la sección
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section_key">Clave de Sección</Label>
                <Select value={formData.section_key} onValueChange={(value) => setFormData({...formData, section_key: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultSections.map((section) => (
                      <SelectItem key={section.key} value={section.key}>
                        {section.title} - {section.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section_title">Título Personalizado</Label>
                <Input
                  id="section_title"
                  value={formData.section_title}
                  onChange={(e) => setFormData({...formData, section_title: e.target.value})}
                  placeholder="Título personalizado"
                />
              </div>

              <div>
                <Label htmlFor="section_description">Descripción</Label>
                <Input
                  id="section_description"
                  value={formData.section_description}
                  onChange={(e) => setFormData({...formData, section_description: e.target.value})}
                  placeholder="Descripción de la sección"
                />
              </div>

              <div>
                <Label htmlFor="icon_name">Icono</Label>
                <Select value={formData.icon_name} onValueChange={(value) => setFormData({...formData, icon_name: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un icono" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="background_color">Color de Fondo</Label>
                <div className="flex space-x-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color || '#ffffff'}
                    onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text_color">Color de Texto</Label>
                <div className="flex space-x-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color || '#000000'}
                    onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.text_color}
                    onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sort_order">Orden</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({...formData, is_visible: checked})}
                />
                <Label htmlFor="is_visible">Sección Visible</Label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCustomization && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Secciones de "{selectedCustomizationData?.theme_name}"
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Card key={section.id} className={`${section.is_visible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {section.section_title || section.section_key}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">#{section.sort_order}</span>
                      {section.is_visible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {section.section_description || `Sección: ${section.section_key}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {section.icon_name && (
                      <p className="text-sm text-gray-600">Icono: {section.icon_name}</p>
                    )}
                    {section.background_color && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Fondo:</span>
                        <div 
                          className="w-4 h-4 rounded border" 
                          style={{ backgroundColor: section.background_color }}
                        />
                        <span className="text-xs text-gray-500">{section.background_color}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(section)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant={section.is_visible ? "destructive" : "default"}
                      onClick={() => handleToggleVisibility(section)}
                    >
                      {section.is_visible ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCustomizer;
