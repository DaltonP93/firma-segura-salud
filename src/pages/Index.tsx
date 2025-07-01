import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Send, CheckCircle, Layers, Plus } from 'lucide-react';
import ContractForm from '@/components/ContractForm';
import ContractTracker from '@/components/ContractTracker';
import ContractsList from '@/components/ContractsList';
import TemplateBuilder from '@/components/TemplateBuilder';
import DocumentManager from '@/components/DocumentManager';
import PDFTemplateBuilder, { PDFTemplate } from '@/components/PDFTemplateBuilder';
import PDFDocumentGenerator from '@/components/PDFDocumentGenerator';

export interface Contract {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  policyType: string;
  templateId?: string;
  templateType?: 'contrato' | 'anexo' | 'declaracion';
  status: 'draft' | 'sent' | 'received' | 'opened' | 'signed' | 'completed';
  createdAt: Date;
  sentAt?: Date;
  openedAt?: Date;
  signedAt?: Date;
  completedAt?: Date;
  documentUrl?: string;
  signatureUrl?: string;
  shareableLink?: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'contrato' | 'anexo' | 'declaracion';
  fields: TemplateField[];
  content: string;
  createdAt: Date;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
}

const Index = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pdfTemplates, setPdfTemplates] = useState<PDFTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNewContract = (contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contractData,
      id: `DOC-${Date.now()}`,
      status: 'draft',
      createdAt: new Date(),
    };
    setContracts(prev => [...prev, newContract]);
    setActiveTab('documents');
  };

  const handleNewTemplate = (template: Omit<Template, 'id' | 'createdAt'>) => {
    const newTemplate: Template = {
      ...template,
      id: `TPL-${Date.now()}`,
      createdAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleNewPDFTemplate = (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: PDFTemplate = {
      ...template,
      id: `PDF-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPdfTemplates(prev => [...prev, newTemplate]);
  };

  const handleUpdatePDFTemplate = (templateId: string, updates: Partial<PDFTemplate>) => {
    setPdfTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updates, updatedAt: new Date() }
        : template
    ));
  };

  const handleDeletePDFTemplate = (templateId: string) => {
    setPdfTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleGeneratePDFDocument = (templateId: string, fieldValues: Record<string, string>, clientInfo: any) => {
    const template = pdfTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newContract: Contract = {
      id: `PDF-DOC-${Date.now()}`,
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone || '',
      policyType: template.name,
      templateId: templateId,
      templateType: 'contrato',
      status: 'draft',
      createdAt: new Date(),
    };
    
    setContracts(prev => [...prev, newContract]);
    setActiveTab('documents');
  };

  const updateContractStatus = (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { 
            ...contract, 
            status, 
            ...additionalData,
            ...(status === 'sent' && { sentAt: new Date() }),
            ...(status === 'opened' && { openedAt: new Date() }),
            ...(status === 'signed' && { signedAt: new Date() }),
            ...(status === 'completed' && { completedAt: new Date() })
          }
        : contract
    ));
  };

  const getStatusStats = () => {
    const stats = {
      total: contracts.length,
      templates: templates.length,
      pdfTemplates: pdfTemplates.length,
      sent: contracts.filter(c => ['sent', 'received', 'opened', 'signed', 'completed'].includes(c.status)).length,
      pending: contracts.filter(c => ['sent', 'received', 'opened'].includes(c.status)).length,
      signed: contracts.filter(c => ['signed', 'completed'].includes(c.status)).length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Gestión Documental Digital
          </h1>
          <p className="text-lg text-gray-600">
            Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="pdf-templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF Templates
            </TabsTrigger>
            <TabsTrigger value="pdf-generator" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              PDF Docs
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generar Nuevo
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
                  <FileText className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Documentos creados</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <Layers className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.templates}</div>
                  <p className="text-xs text-muted-foreground">Plantillas básicas</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">PDF Templates</CardTitle>
                  <FileText className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.pdfTemplates}</div>
                  <p className="text-xs text-muted-foreground">Plantillas PDF</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Users className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Esperando firma</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
                  <p className="text-xs text-muted-foreground">Documentos firmados</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimos documentos y sus estados</CardDescription>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos aún</h3>
                    <p className="text-gray-500 mb-4">Comienza creando plantillas y generando documentos</p>
                    <Button onClick={() => setActiveTab('templates')} className="bg-primary hover:bg-primary/90">
                      Crear Primera Plantilla
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contracts.slice(-5).reverse().map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{contract.clientName}</h4>
                          <p className="text-sm text-gray-500">
                            {contract.templateType && (
                              <span className="capitalize">{contract.templateType}</span>
                            )}
                            {contract.templateType && contract.policyType && ' - '}
                            {contract.policyType}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            contract.status === 'completed' || contract.status === 'signed' ? 'default' :
                            contract.status === 'sent' || contract.status === 'opened' ? 'secondary' : 'outline'
                          }
                          className={
                            contract.status === 'completed' || contract.status === 'signed' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            contract.status === 'sent' || contract.status === 'opened'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''
                          }
                        >
                          {contract.status === 'draft' && 'Borrador'}
                          {contract.status === 'sent' && 'Enviado'}
                          {contract.status === 'received' && 'Recibido'}
                          {contract.status === 'opened' && 'Abierto'}
                          {contract.status === 'signed' && 'Firmado'}
                          {contract.status === 'completed' && 'Completado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <TemplateBuilder 
              templates={templates}
              onCreateTemplate={handleNewTemplate}
            />
          </TabsContent>

          <TabsContent value="pdf-templates">
            <PDFTemplateBuilder 
              templates={pdfTemplates}
              onCreateTemplate={handleNewPDFTemplate}
              onUpdateTemplate={handleUpdatePDFTemplate}
              onDeleteTemplate={handleDeletePDFTemplate}
            />
          </TabsContent>

          <TabsContent value="pdf-generator">
            <PDFDocumentGenerator 
              templates={pdfTemplates}
              onGenerateDocument={handleGeneratePDFDocument}
            />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractForm 
              onSubmit={handleNewContract}
              templates={templates}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager 
              contracts={contracts} 
              onUpdateStatus={updateContractStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
