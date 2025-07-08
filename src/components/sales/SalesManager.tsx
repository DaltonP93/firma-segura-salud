
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { salesService } from '@/services/salesService';
import SalesRequestForm, { SalesRequest, Beneficiary } from './SalesRequestForm';
import SalesRequestsList from './SalesRequestsList';
import HealthDeclarationForm from './HealthDeclarationForm';
import type { SalesRequestWithDetails } from './SalesRequestsList';

const SalesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SalesRequestWithDetails[]>([]);
  const [editingRequest, setEditingRequest] = useState<SalesRequestWithDetails | null>(null);
  const [healthDeclarationRequest, setHealthDeclarationRequest] = useState<SalesRequestWithDetails | null>(null);

  useEffect(() => {
    if (user) {
      fetchSalesRequests();
    }
  }, [user]);

  const fetchSalesRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await salesService.fetchSalesRequests();
      console.log('Fetched sales requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching sales requests:', error);
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes de venta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (requestData: SalesRequest, beneficiaries: Beneficiary[]) => {
    if (!user) return;

    try {
      await salesService.createSalesRequest(requestData, beneficiaries, user.id);
      await fetchSalesRequests();
      setActiveTab('list');
      toast({
        title: "Solicitud Creada",
        description: "La solicitud de venta ha sido creada exitosamente",
      });
    } catch (error) {
      console.error('Error creating sales request:', error);
      throw error;
    }
  };

  const handleEditRequest = (request: SalesRequestWithDetails) => {
    setEditingRequest(request);
    setActiveTab('edit');
  };

  const handleUpdateRequest = async (requestData: SalesRequest, beneficiaries: Beneficiary[]) => {
    if (!user || !editingRequest) return;

    try {
      await salesService.updateSalesRequest(editingRequest.id, requestData);
      await fetchSalesRequests();
      setEditingRequest(null);
      setActiveTab('list');
      toast({
        title: "Solicitud Actualizada",
        description: "La solicitud ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error updating sales request:', error);
      throw error;
    }
  };

  const handleViewRequest = (request: SalesRequestWithDetails) => {
    console.log('Viewing request:', request);
    // TODO: Implement request detail view
  };

  const handleProcessHealthDeclaration = (request: SalesRequestWithDetails) => {
    setHealthDeclarationRequest(request);
    setActiveTab('health-declaration');
  };

  const handleHealthDeclarationSubmit = async (answers: Record<string, any>) => {
    if (!healthDeclarationRequest) return;

    try {
      await salesService.saveHealthDeclaration(healthDeclarationRequest.id, answers);
      await fetchSalesRequests();
      setHealthDeclarationRequest(null);
      setActiveTab('list');
      toast({
        title: "Declaración Guardada",
        description: "La declaración de salud ha sido procesada exitosamente",
      });
    } catch (error) {
      console.error('Error saving health declaration:', error);
      toast({
        title: "Error",
        description: "Error al procesar la declaración de salud",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    const stats = {
      total: requests.length,
      draft: requests.filter(r => r.status === 'draft').length,
      pending: requests.filter(r => r.status === 'pending_health_declaration' || r.status === 'pending_signature').length,
      completed: requests.filter(r => r.status === 'completed').length,
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Registro de Ventas
          </h1>
          <p className="text-gray-600 mt-1">
            Gestione solicitudes de venta, beneficiarios y declaraciones de salud
          </p>
        </div>
        <Button 
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borradores</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="create">Crear</TabsTrigger>
          <TabsTrigger value="edit" disabled={!editingRequest}>Editar</TabsTrigger>
          <TabsTrigger value="health-declaration" disabled={!healthDeclarationRequest}>
            Declaración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <SalesRequestsList
            requests={requests}
            onViewRequest={handleViewRequest}
            onEditRequest={handleEditRequest}
            onProcessHealthDeclaration={handleProcessHealthDeclaration}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <SalesRequestForm
            onSubmit={handleCreateRequest}
            onCancel={() => setActiveTab('list')}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {editingRequest && (
            <SalesRequestForm
              onSubmit={handleUpdateRequest}
              onCancel={() => {
                setEditingRequest(null);
                setActiveTab('list');
              }}
              initialData={editingRequest}
              isEditing={true}
            />
          )}
        </TabsContent>

        <TabsContent value="health-declaration" className="mt-6">
          {healthDeclarationRequest && (
            <HealthDeclarationForm
              salesRequest={healthDeclarationRequest}
              onSubmit={handleHealthDeclarationSubmit}
              onCancel={() => {
                setHealthDeclarationRequest(null);
                setActiveTab('list');
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesManager;
