
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, BarChart3 } from 'lucide-react';

interface SalesStatsCardsProps {
  stats: {
    total: number;
    draft: number;
    pending: number;
    completed: number;
  };
}

const SalesStatsCards: React.FC<SalesStatsCardsProps> = ({ stats }) => {
  return (
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
  );
};

export default SalesStatsCards;
