
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, CheckCircle, Layers, Plus, Menu, ShoppingCart } from 'lucide-react';
import ContractForm from '@/components/ContractForm';
import ContractTracker from '@/components/ContractTracker';
import ContractsList from '@/components/ContractsList';
import TemplateBuilder from '@/components/TemplateBuilder';
import DocumentManager from '@/components/DocumentManager';
import PDFTemplateBuilder, { PDFTemplate } from '@/components/PDFTemplateBuilder';
import PDFDocumentGenerator from '@/components/PDFDocumentGenerator';
import SalesManager from '@/components/sales/SalesManager';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('contracts');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const {
    loading,
    contracts,
    templates,
    pdfTemplates,
    createDocument,
    updateDocumentStatus,
    createTemplate,
    createPDFTemplate,
    updatePDFTemplate,
    deletePDFTemplate,
  } = useSupabaseData();

  const handleNewContract = async (contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>) => {
    try {
      await createDocument(contractData);
      setActiveTab('documents');
      toast({
        title: "Documento creado",
        description: "El documento ha sido creado exitosamente",
      });
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const handleNewTemplate = async (template: Omit<Template, 'id' | 'createdAt'>) => {
    try {
      await createTemplate(template);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleNewPDFTemplate = async (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createPDFTemplate(template);
      toast({
        title: "Plantilla PDF Creada",
        description: `La plantilla "${template.name}" ha sido creada exitosamente`,
      });
    } catch (error) {
      console.error('Error creating PDF template:', error);
    }
  };

  const handleUpdatePDFTemplate = async (templateId: string, updates: Partial<PDFTemplate>) => {
    try {
      await updatePDFTemplate(templateId, updates);
      toast({
        title: "Plantilla Actualizada",
        description: "La plantilla ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error updating PDF template:', error);
    }
  };

  const handleDeletePDFTemplate = async (templateId: string) => {
    try {
      await deletePDFTemplate(templateId);
      toast({
        title: "Plantilla Eliminada",
        description: "La plantilla ha sido eliminada exitosamente",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting PDF template:', error);
    }
  };

  const handleGeneratePDFDocument = async (templateId: string, fieldValues: Record<string, string>, clientInfo: any) => {
    const template = pdfTemplates.find(t => t.id === templateId);
    if (!template) return;

    const contractData = {
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone || '',
      policyType: template.name,
      templateId: templateId,
      templateType: 'contrato' as const,
    };
    
    try {
      await createDocument(contractData);
      setActiveTab('documents');
      toast({
        title: "Documento PDF generado",
        description: `Documento basado en "${template.name}" creado exitosamente`,
      });
    } catch (error) {
      console.error('Error generating PDF document:', error);
    }
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

  const tabItems = [
    { value: 'contracts', label: 'Crear Documento', icon: Plus },
    { value: 'documents', label: 'Documentos', icon: FileText },
    { value: 'templates', label: 'Templates', icon: Layers },
    { value: 'pdf-templates', label: 'PDF Templates', icon: FileText },
    { value: 'pdf-generator', label: 'PDF Docs', icon: Plus },
    { value: 'sales', label: 'Registrar Ventas', icon: ShoppingCart },
    { value: 'dashboard', label: 'Dashboard', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-muted-foreground">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Tab Selector */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              {React.createElement(tabItems.find(item => item.value === activeTab)?.icon || FileText, { className: "w-4 h-4" })}
              {tabItems.find(item => item.value === activeTab)?.label}
            </span>
            <Menu className="w-4 h-4" />
          </Button>
          
          {mobileMenuOpen && (
            <div className="mt-2 bg-card border rounded-lg shadow-lg">
              {tabItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setActiveTab(item.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted first:rounded-t-lg last:rounded-b-lg ${
                    activeTab === item.value ? 'bg-primary/10 text-primary font-medium' : ''
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <TabsList className="hidden sm:grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
          {tabItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2 text-xs lg:text-sm">
              <item.icon className="w-4 h-4" />
              <span className="hidden lg:inline">{item.label}</span>
              <span className="lg:hidden">{item.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="contracts">
          <ContractForm 
            onSubmit={handleNewContract}
            templates={templates}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentManager 
            contracts={contracts} 
            onUpdateStatus={updateDocumentStatus}
          />
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

        <TabsContent value="sales">
          <SalesManager />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Documentos</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Documentos creados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Templates</CardTitle>
                <Layers className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-secondary">{stats.templates}</div>
                <p className="text-xs text-muted-foreground">Plantillas básicas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">PDF Templates</CardTitle>
                <FileText className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-destructive">{stats.pdfTemplates}</div>
                <p className="text-xs text-muted-foreground">Plantillas PDF</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Pendientes</CardTitle>
                <Users className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-warning">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Esperando firma</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Completados</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-success">{stats.signed}</div>
                <p className="text-xs text-muted-foreground">Documentos firmados</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimos documentos y sus estados</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay documentos aún</h3>
                  <p className="text-muted-foreground mb-4">Comienza creando plantillas y generando documentos</p>
                  <Button onClick={() => setActiveTab('contracts')}>
                    Crear Primer Documento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.slice(-5).reverse().map((contract) => (
                    <div key={contract.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2 sm:gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{contract.clientName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contract.templateType && (
                            <span className="capitalize">{contract.templateType}</span>
                          )}
                          {contract.templateType && contract.policyType && ' - '}
                          {contract.policyType}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          contract.status === 'completed' || contract.status === 'signed' 
                            ? 'default' 
                            : contract.status === 'draft' 
                              ? 'secondary' 
                              : 'outline'
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
      </Tabs>
    </div>
  );
};

export default Index;
