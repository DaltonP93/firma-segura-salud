
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, CheckCircle, Clock, TrendingUp, AlertCircle, Layers } from 'lucide-react';

const Dashboard = () => {
  console.log('Dashboard component rendering...');
  
  const { contracts, templates, pdfTemplates, loading } = useSupabaseData();
  const { profile, isAdmin } = useUserProfile();

  console.log('Dashboard data:', { 
    contracts: contracts?.length, 
    templates: templates?.length, 
    pdfTemplates: pdfTemplates?.length, 
    loading,
    profile: profile?.full_name,
    isAdmin 
  });

  if (loading) {
    console.log('Dashboard showing loading state');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Dashboard rendering main content');

  // Datos de ejemplo para las gráficas
  const contractsData = [
    { name: 'Completados', value: contracts?.filter(c => c.status === 'completed').length || 0, color: '#22c55e' },
    { name: 'Pendientes', value: contracts?.filter(c => c.status === 'pending').length || 0, color: '#f59e0b' },
    { name: 'Enviados', value: contracts?.filter(c => c.status === 'sent').length || 0, color: '#3b82f6' },
  ];

  const monthlyData = [
    { month: 'Ene', contracts: 12 },
    { month: 'Feb', contracts: 19 },
    { month: 'Mar', contracts: 3 },
    { month: 'Abr', contracts: 5 },
    { month: 'May', contracts: 2 },
    { month: 'Jun', contracts: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido de vuelta, {profile?.full_name || 'Usuario'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-500">Actualizado ahora</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 nuevas esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts?.filter(c => c.status === 'completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts?.filter(c => c.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contratos por Mes</CardTitle>
            <CardDescription>
              Contratos creados en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="contracts" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Contratos</CardTitle>
            <CardDescription>
              Distribución actual de contratos por estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Los documentos más recientes en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts?.slice(0, 5).map((contract) => (
              <div key={contract.id} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  contract.status === 'completed' ? 'bg-green-500' :
                  contract.status === 'pending' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{contract.clientName}</p>
                  <p className="text-xs text-gray-500">{contract.documentNumber}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(contract.createdAt).toLocaleDateString()}
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No hay contratos disponibles</p>
                <p className="text-xs">Crea tu primer contrato para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Section */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Panel de Administración
            </CardTitle>
            <CardDescription>
              Herramientas avanzadas para administradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Plantillas del Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
