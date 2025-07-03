
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contract, Template } from '@/pages/Index';
import { PDFTemplate } from '@/components/PDFTemplateBuilder';

interface AdminOverviewStatsProps {
  contracts: Contract[];
  templates: Template[];
  pdfTemplates: PDFTemplate[];
}

const AdminOverviewStats = ({ contracts, templates, pdfTemplates }: AdminOverviewStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Documentos</CardTitle>
          <CardDescription>Documentos en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{contracts.length}</div>
          <p className="text-sm text-gray-500">Documentos creados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plantillas Activas</CardTitle>
          <CardDescription>Plantillas HTML disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{templates.length}</div>
          <p className="text-sm text-gray-500">Plantillas HTML</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plantillas PDF</CardTitle>
          <CardDescription>Plantillas PDF disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{pdfTemplates.length}</div>
          <p className="text-sm text-gray-500">Plantillas PDF</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos Completados</CardTitle>
          <CardDescription>Documentos firmados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {contracts.filter(c => c.status === 'completed').length}
          </div>
          <p className="text-sm text-gray-500">Completados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverviewStats;
