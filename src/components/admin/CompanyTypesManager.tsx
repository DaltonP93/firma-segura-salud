import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Save, X, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompanyType {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const CompanyTypesManager = () => {
  const { toast } = useToast();
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCompanyTypes();
  }, []);

  const fetchCompanyTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('company_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanyTypes(data || []);
    } catch (error) {
      console.error('Error fetching company types:', error);
      toast({
        title: "Error",
        description: "Error al cargar los tipos de empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('company_types')
          .update({
            name: formData.name,
            code: formData.code || null,
            description: formData.description || null,
            is_active: formData.is_active,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Tipo de empresa actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('company_types')
          .insert([{
            name: formData.name,
            code: formData.code || null,
            description: formData.description || null,
            is_active: formData.is_active,
          }]);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Nuevo tipo de empresa creado correctamente",
        });
      }

      await fetchCompanyTypes();
      handleCancel();
    } catch (error) {
      console.error('Error saving company type:', error);
      toast({
        title: "Error",
        description: "Error al guardar el tipo de empresa",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (companyType: CompanyType) => {
    setEditingId(companyType.id);
    setFormData({
      name: companyType.name,
      code: companyType.code || '',
      description: companyType.description || '',
      is_active: companyType.is_active,
    });
    setIsCreating(false);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true,
    });
  };

  const handleToggleActive = async (companyType: CompanyType) => {
    try {
      const { error } = await supabase
        .from('company_types')
        .update({ is_active: !companyType.is_active })
        .eq('id', companyType.id);

      if (error) throw error;
      await fetchCompanyTypes();
      toast({
        title: "Éxito",
        description: `Tipo de empresa ${!companyType.is_active ? 'activado' : 'desactivado'}`,
      });
    } catch (error) {
      console.error('Error toggling company type:', error);
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
          <h2 className="text-2xl font-bold">Tipos de Empresa</h2>
          <p className="text-muted-foreground">Gestiona las categorías de empresa disponibles</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Tipo de Empresa' : 'Nuevo Tipo de Empresa'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Modifica la información del tipo de empresa' : 'Crea un nuevo tipo de empresa'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="ej: Compañía de Seguros"
                />
              </div>

              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="ej: INSURANCE"
                />
                <p className="text-sm text-muted-foreground mt-1">Identificador único (opcional)</p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción del tipo de empresa"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Tipo Activo</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyTypes.map((companyType) => (
          <Card key={companyType.id} className={`relative ${companyType.is_active ? 'border-green-200 bg-green-50' : 'border-border'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{companyType.name}</CardTitle>
                </div>
                <Badge variant={companyType.is_active ? 'default' : 'secondary'}>
                  {companyType.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              {companyType.code && (
                <CardDescription>
                  Código: {companyType.code}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {companyType.description && (
                <p className="text-sm text-muted-foreground mb-4">{companyType.description}</p>
              )}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Creado: {new Date(companyType.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(companyType)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant={companyType.is_active ? "destructive" : "default"}
                  onClick={() => handleToggleActive(companyType)}
                >
                  {companyType.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyTypesManager;