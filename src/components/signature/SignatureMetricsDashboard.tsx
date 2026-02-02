import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Send,
  Eye,
  Pen,
  Download,
  Calendar,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetricsData {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  expiredRequests: number;
  averageCompletionTime: number;
  signaturesByDay: { date: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  topTemplates: { name: string; count: number }[];
  conversionRate: number;
}

const SignatureMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (dateRange === 'week') startDate.setDate(now.getDate() - 7);
      else if (dateRange === 'month') startDate.setMonth(now.getMonth() - 1);
      else startDate.setMonth(now.getMonth() - 3);

      // Fetch signature requests
      const { data: requests, error: requestsError } = await supabase
        .from('signature_requests')
        .select('id, status, created_at, completed_at, documents(template_type)')
        .gte('created_at', startDate.toISOString());

      if (requestsError) throw requestsError;

      // Fetch signers for completion times
      const { data: signers, error: signersError } = await supabase
        .from('signers')
        .select('signed_at, created_at, status')
        .gte('created_at', startDate.toISOString());

      if (signersError) throw signersError;

      // Calculate metrics
      const totalRequests = requests?.length || 0;
      const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
      const pendingRequests = requests?.filter(r => ['sent', 'pending', 'opened'].includes(r.status || '')).length || 0;
      const expiredRequests = requests?.filter(r => r.status === 'expired').length || 0;

      // Average completion time (in hours)
      const completedWithTimes = requests?.filter(r => r.completed_at && r.created_at) || [];
      const avgTime = completedWithTimes.length > 0
        ? completedWithTimes.reduce((acc, req) => {
            const diff = new Date(req.completed_at!).getTime() - new Date(req.created_at).getTime();
            return acc + diff;
          }, 0) / completedWithTimes.length / (1000 * 60 * 60)
        : 0;

      // Signatures by day
      const signaturesByDay = getSignaturesByDay(signers || [], startDate);

      // Status breakdown
      const statusCounts: Record<string, number> = {};
      requests?.forEach(r => {
        const status = r.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

      // Conversion rate
      const conversionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

      setMetrics({
        totalRequests,
        completedRequests,
        pendingRequests,
        expiredRequests,
        averageCompletionTime: avgTime,
        signaturesByDay,
        statusBreakdown,
        topTemplates: [],
        conversionRate
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSignaturesByDay = (signers: any[], startDate: Date) => {
    const signedSigners = signers.filter(s => s.signed_at && s.status === 'signed');
    const dayMap: Record<string, number> = {};

    signedSigners.forEach(s => {
      const day = new Date(s.signed_at).toISOString().split('T')[0];
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    return Object.entries(dayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${hours.toFixed(1)} hrs`;
    return `${(hours / 24).toFixed(1)} días`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'opened': return <Eye className="w-4 h-4" />;
      case 'signed': return <Pen className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      pending: 'Pendiente',
      sent: 'Enviado',
      opened: 'Abierto',
      signed: 'Firmado',
      completed: 'Completado',
      expired: 'Expirado',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          Cargando métricas...
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Dashboard de Métricas
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={dateRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('week')}
          >
            7 días
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('month')}
          >
            30 días
          </Button>
          <Button
            variant={dateRange === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('quarter')}
          >
            90 días
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Solicitudes</p>
                <p className="text-3xl font-bold">{metrics.totalRequests}</p>
              </div>
              <FileText className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{metrics.completedRequests}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-amber-600">{metrics.pendingRequests}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Completion Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Tiempo Promedio de Firma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-primary">
                {formatHours(metrics.averageCompletionTime)}
              </p>
              <p className="text-muted-foreground mt-2">
                desde el envío hasta la firma completa
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.statusBreakdown.map(({ status, count }) => {
                const percentage = metrics.totalRequests > 0 ? (count / metrics.totalRequests) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusLabel(status)}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signatures Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Firmas por Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.signaturesByDay.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {metrics.signaturesByDay.map(({ date, count }) => {
                const maxCount = Math.max(...metrics.signaturesByDay.map(d => d.count));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div 
                    key={date} 
                    className="flex-1 flex flex-col items-center justify-end group"
                  >
                    <div 
                      className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors relative"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-left">
                      {new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos de firmas en el período seleccionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Reporte CSV
        </Button>
      </div>
    </div>
  );
};

export default SignatureMetricsDashboard;
