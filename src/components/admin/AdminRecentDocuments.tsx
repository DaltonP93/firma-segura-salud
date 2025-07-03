
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import type { Contract } from '@/pages/Index';

interface AdminRecentDocumentsProps {
  contracts: Contract[];
}

const AdminRecentDocuments = ({ contracts }: AdminRecentDocumentsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Recientes</CardTitle>
        <CardDescription>Últimos documentos creados en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {contracts.length > 0 ? (
          <div className="space-y-3">
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{contract.clientName}</p>
                  <p className="text-sm text-gray-500">{contract.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {contract.createdAt.toLocaleDateString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                    contract.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                    contract.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay documentos creados aún</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRecentDocuments;
