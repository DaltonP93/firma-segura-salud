
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Send, Eye, FileText, Mail } from 'lucide-react';
import type { Contract } from '@/pages/Index';

interface ContractTrackerProps {
  contracts: Contract[];
}

const ContractTracker = ({ contracts }: ContractTrackerProps) => {
  const getProgressPercentage = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 10;
      case 'sent': return 25;
      case 'received': return 50;
      case 'opened': return 75;
      case 'signed': return 90;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getTimelineSteps = (contract: Contract) => [
    {
      id: 'created',
      title: 'Contrato Creado',
      description: 'Documento generado',
      icon: FileText,
      completed: true,
      timestamp: contract.createdAt,
      active: contract.status === 'draft'
    },
    {
      id: 'sent',
      title: 'Enviado al Cliente',
      description: 'Documento enviado por email/WhatsApp',
      icon: Send,
      completed: ['sent', 'received', 'opened', 'signed', 'completed'].includes(contract.status),
      timestamp: contract.sentAt,
      active: contract.status === 'sent'
    },
    {
      id: 'received',
      title: 'Recibido',
      description: 'Cliente recibió el documento',
      icon: Mail,
      completed: ['received', 'opened', 'signed', 'completed'].includes(contract.status),
      timestamp: contract.sentAt, // In real app, this would be different
      active: contract.status === 'received'
    },
    {
      id: 'opened',
      title: 'Documento Abierto',
      description: 'Cliente abrió el documento',
      icon: Eye,
      completed: ['opened', 'signed', 'completed'].includes(contract.status),
      timestamp: contract.openedAt,
      active: contract.status === 'opened'
    },
    {
      id: 'signed',
      title: 'Firmado',
      description: 'Cliente firmó digitalmente',
      icon: CheckCircle,
      completed: ['signed', 'completed'].includes(contract.status),
      timestamp: contract.signedAt,
      active: contract.status === 'signed'
    }
  ];

  const activeContracts = contracts.filter(c => ['sent', 'received', 'opened'].includes(c.status));
  const recentActivity = contracts
    .filter(c => c.sentAt || c.openedAt || c.signedAt)
    .sort((a, b) => {
      const aTime = Math.max(
        a.sentAt?.getTime() || 0,
        a.openedAt?.getTime() || 0,
        a.signedAt?.getTime() || 0
      );
      const bTime = Math.max(
        b.sentAt?.getTime() || 0,
        b.openedAt?.getTime() || 0,
        b.signedAt?.getTime() || 0
      );
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Seguimiento en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeContracts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos activos</h3>
              <p className="text-gray-500">Los contratos enviados aparecerán aquí para seguimiento</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeContracts.map((contract) => {
                const progress = getProgressPercentage(contract.status);
                const timelineSteps = getTimelineSteps(contract);
                
                return (
                  <div key={contract.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contract.clientName}</h3>
                        <p className="text-sm text-gray-600">{contract.clientEmail}</p>
                      </div>
                      <Badge 
                        className={`${
                          contract.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          contract.status === 'received' ? 'bg-indigo-100 text-indigo-800' :
                          contract.status === 'opened' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        } status-indicator`}
                      >
                        {contract.status === 'sent' && 'Enviado'}
                        {contract.status === 'received' && 'Recibido'}
                        {contract.status === 'opened' && 'Abierto - Esperando Firma'}
                      </Badge>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progreso del Contrato</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      {timelineSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <div key={step.id} className="flex items-start gap-4">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center
                              ${step.completed 
                                ? 'bg-green-100 text-green-600' 
                                : step.active 
                                  ? 'bg-blue-100 text-blue-600 animate-pulse' 
                                  : 'bg-gray-100 text-gray-400'
                              }
                            `}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${
                                  step.completed ? 'text-green-800' : 
                                  step.active ? 'text-blue-800' : 'text-gray-500'
                                }`}>
                                  {step.title}
                                </h4>
                                {step.timestamp && (
                                  <span className="text-xs text-gray-500">
                                    {step.timestamp.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{contract.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {contract.status === 'sent' && 'Contrato enviado'}
                      {contract.status === 'received' && 'Contrato recibido'}
                      {contract.status === 'opened' && 'Documento abierto'}
                      {contract.status === 'signed' && 'Contrato firmado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {contract.status === 'sent' && contract.sentAt?.toLocaleString()}
                      {contract.status === 'opened' && contract.openedAt?.toLocaleString()}
                      {contract.status === 'signed' && contract.signedAt?.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractTracker;
