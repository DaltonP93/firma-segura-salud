
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, PenTool } from 'lucide-react';

interface ContractStatusCardProps {
  status: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected';
}

const ContractStatusCard: React.FC<ContractStatusCardProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Contrato Completado'
        };
      case 'pending_signature':
        return {
          icon: Clock,
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          text: 'Listo para Generar Contrato'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Pendiente Proceso Previo'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          Estado del Contrato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          </div>
          <div>
            <p className="font-medium">{statusInfo.text}</p>
            {status !== 'pending_signature' && (
              <p className="text-sm text-gray-600">
                Complete la declaración de salud para generar el contrato
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractStatusCard;
