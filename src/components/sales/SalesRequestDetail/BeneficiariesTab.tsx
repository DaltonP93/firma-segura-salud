import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Beneficiary {
  id: string;
  sales_request_id: string;
  relationship: string | null;
  percentage: number | null;
  is_primary: boolean | null;
  dni: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  description: string | null;
}

interface BeneficiariesTabProps {
  requestId: string;
}

const BeneficiariesTab: React.FC<BeneficiariesTabProps> = ({ requestId }) => {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBeneficiaries();
  }, [requestId]);

  const fetchBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('sales_request_id', requestId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los beneficiarios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este beneficiario?')) return;

    try {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Beneficiario eliminado",
        description: "El beneficiario ha sido eliminado correctamente"
      });
      
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el beneficiario",
        variant: "destructive"
      });
    }
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Cargando beneficiarios...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Beneficiarios ({beneficiaries.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={totalPercentage === 100 ? "default" : "destructive"}>
            Total: {totalPercentage}%
          </Badge>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {beneficiaries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay beneficiarios registrados</p>
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-1" />
              Agregar Beneficiario
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {beneficiaries.map((beneficiary) => (
              <div 
                key={beneficiary.id} 
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre/Descripción</p>
                    <p className="font-medium">{beneficiary.description || 'Sin nombre'}</p>
                    {beneficiary.is_primary && (
                      <Badge variant="secondary" className="mt-1">Principal</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Relación</p>
                    <p>{beneficiary.relationship || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Porcentaje</p>
                    <p className="font-semibold">{beneficiary.percentage || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">DNI</p>
                    <p>{beneficiary.dni || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(beneficiary.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BeneficiariesTab;
