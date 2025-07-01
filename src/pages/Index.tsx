
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Send, CheckCircle } from 'lucide-react';
import ContractForm from '@/components/ContractForm';
import ContractTracker from '@/components/ContractTracker';
import ContractsList from '@/components/ContractsList';

export interface Contract {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  policyType: string;
  status: 'draft' | 'sent' | 'received' | 'opened' | 'signed' | 'completed';
  createdAt: Date;
  sentAt?: Date;
  openedAt?: Date;
  signedAt?: Date;
  documentUrl?: string;
  signatureUrl?: string;
}

const Index = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNewContract = (contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contractData,
      id: `CON-${Date.now()}`,
      status: 'draft',
      createdAt: new Date(),
    };
    setContracts(prev => [...prev, newContract]);
    setActiveTab('contracts');
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
            ...(status === 'signed' && { signedAt: new Date() })
          }
        : contract
    ));
  };

  const getStatusStats = () => {
    const stats = {
      total: contracts.length,
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
            Sistema de Contratos de Seguros Médicos
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona contratos, firma digital y seguimiento en tiempo real
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="new-contract" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nuevo Contrato
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Contratos
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Seguimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
                  <FileText className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Contratos creados</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enviados</CardTitle>
                  <Send className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
                  <p className="text-xs text-muted-foreground">Contratos enviados</p>
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
                  <CardTitle className="text-sm font-medium">Firmados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
                  <p className="text-xs text-muted-foreground">Contratos completados</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimos contratos y sus estados</CardDescription>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos aún</h3>
                    <p className="text-gray-500 mb-4">Comienza creando tu primer contrato de seguro médico</p>
                    <Button onClick={() => setActiveTab('new-contract')} className="bg-primary hover:bg-primary/90">
                      Crear Primer Contrato
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contracts.slice(-5).reverse().map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{contract.clientName}</h4>
                          <p className="text-sm text-gray-500">{contract.policyType}</p>
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

          <TabsContent value="new-contract">
            <ContractForm onSubmit={handleNewContract} />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsList 
              contracts={contracts} 
              onUpdateStatus={updateContractStatus}
            />
          </TabsContent>

          <TabsContent value="tracking">
            <ContractTracker contracts={contracts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
