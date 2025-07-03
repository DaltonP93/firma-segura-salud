import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Send, CheckCircle, Layers, Plus, LogOut, User } from 'lucide-react';
import ContractForm from '@/components/ContractForm';
import ContractTracker from '@/components/ContractTracker';
import ContractsList from '@/components/ContractsList';
import TemplateBuilder from '@/components/TemplateBuilder';
import DocumentManager from '@/components/DocumentManager';
import PDFTemplateBuilder, { PDFTemplate } from '@/components/PDFTemplateBuilder';
import PDFDocumentGenerator from '@/components/PDFDocumentGenerator';
import AuthWrapper from '@/components/AuthWrapper';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

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

  return (
    <AuthWrapper onShowAuth={() => setShowAuthModal(true)}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Sistema de Gestión Documental Digital
              </h1>
              <p className="text-lg text-gray-600">
                Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales
              </p>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-4 text-gray-600">Cargando datos...</span>
            </div>
          ) : (
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
                  onUpdateStatus={updateDocumentStatus}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    </AuthWrapper>
  );
};

export default Index;
