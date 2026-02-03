import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, ShoppingCart, PenTool, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'sale' | 'document' | 'signature' | 'login';
  description: string;
  timestamp: string;
}

interface ActivityHistoryProps {
  activities: ActivityItem[];
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'signature':
        return <PenTool className="w-4 h-4" />;
      case 'login':
        return <User className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Venta';
      case 'document':
        return 'Documento';
      case 'signature':
        return 'Firma';
      case 'login':
        return 'Sesión';
      default:
        return 'Actividad';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'sale':
        return 'default';
      case 'document':
        return 'secondary';
      case 'signature':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Historial de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getTypeBadgeVariant(activity.type) as any}>
                      {getTypeLabel(activity.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm truncate">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
