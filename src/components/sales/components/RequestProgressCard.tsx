
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';

interface RequestProgressCardProps {
  status: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected';
}

const statusConfig = {
  draft: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-800',
    icon: Edit,
    progress: 25
  },
  pending_health_declaration: {
    label: 'Pendiente Declaración',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
    progress: 50
  },
  pending_signature: {
    label: 'Pendiente Firma',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
    progress: 75
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    progress: 100
  },
  rejected: {
    label: 'Rechazado',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
    progress: 0
  }
};

const RequestProgressCard: React.FC<RequestProgressCardProps> = ({ status }) => {
  const statusInfo = statusConfig[status || 'draft'];
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge className={statusInfo.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
          <span className="text-sm text-gray-600">{statusInfo.progress}%</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progreso de la Solicitud</span>
          </div>
          <Progress value={statusInfo.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestProgressCard;
