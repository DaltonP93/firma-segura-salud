import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, CheckCircle, Clock, TrendingUp, AlertCircle, Layers } from 'lucide-react';

const Dashboard = () => {
  const { contracts, templates, pdfTemplates, loading } = useSupabaseData();
  const { profile, isAdmin } = useUserProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dashboard statistics
  const totalDocuments = contracts.length;
  const completedDocuments = contracts.filter(c => c.status === 'completed').length;
  const sentDocuments = contracts.filter(c => c.status === 'sent').length;
  const draftDocuments = contracts.filter(c => c.status === 'draft').length;

  // Chart data
  const statusData = [
    { name: 'Completados', value: completedDocuments, color: '#10b981' },
    { name: 'Enviados', value: sentDocuments, color: '#f59e0b' },
    { name: 'Borradores', value: draftDocuments, color: '#6b7280' },
  ];

  const monthlyData = [
    { month: 'Ene', documents: 12 },
    { month: 'Feb', documents: 19 },
    { month: 'Mar', documents: 15 },
    { month: 'Abr', documents: 25 },
    { month: 'May', documents: 22 },
    { month: 'Jun', documents: 30 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido de vuelta, {profile?.full_name || 'Usuario'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sentDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length + pdfTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para usar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Documentos</CardTitle>
            <CardDescription>
              Distribución actual de tus documentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Mensual</CardTitle>
            <CardDescription>
              Documentos creados por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimos documentos y cambios en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{contract.clientName}</p>
                    <p className="text-sm text-gray-500">
                      Documento #{contract.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contract.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : contract.status === 'sent'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status === 'completed' ? 'Completado' :
                     contract.status === 'sent' ? 'Enviado' : 'Borrador'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(contract.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
            {contracts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay documentos recientes</p>
                <p className="text-sm">Crea tu primer documento para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
