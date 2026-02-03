import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ShoppingCart, PenTool } from 'lucide-react';

interface ProfileStatsProps {
  salesCount: number;
  documentsCount: number;
  signaturesCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  salesCount,
  documentsCount,
  signaturesCount,
}) => {
  const stats = [
    {
      label: 'Ventas',
      value: salesCount,
      icon: ShoppingCart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Documentos',
      value: documentsCount,
      icon: FileText,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      label: 'Firmas',
      value: signaturesCount,
      icon: PenTool,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 text-center">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileStats;
