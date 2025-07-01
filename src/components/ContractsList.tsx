
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, CheckCircle, Eye, FileText } from 'lucide-react';
import type { Contract } from '@/pages/Index';
import ContractPreview from './ContractPreview';

interface ContractsListProps {
  contracts: Contract[];
  onUpdateStatus: (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => void;
}

const ContractsList = ({ contracts, onUpdateStatus }: ContractsListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendContract = async (contract: Contract, method: 'email' | 'whatsapp') => {
    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onUpdateStatus(contract.id, 'sent');
      
      toast({
        title: "Contrato Enviado",
        description: `El contrato ha sido enviado a ${contract.clientName} por ${method === 'email' ? 'correo' : 'WhatsApp'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el contrato",
        variant: "destructive",
      });
    }
  };

  const simulateClientActions = (contract: Contract) => {
    // Simulate client receiving and opening the contract
    setTimeout(() => {
      onUpdateStatus(contract.id, 'received');
      toast({
        title: "Estado Actualizado",
        description: `${contract.clientName} ha recibido el contrato`,
      });
    }, 3000);

    setTimeout(() => {
      onUpdateStatus(contract.id, 'opened');
      toast({
        title: "Estado Actualizado",
        description: `${contract.clientName} ha abierto el contrato`,
      });
    }, 6000);
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-indigo-100 text-indigo-800';
      case 'opened': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviado';
      case 'received': return 'Recibido';
      case 'opened': return 'Abierto';
      case 'signed': return 'Firmado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl text-primary">Gestión de Contratos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="received">Recibido</SelectItem>
                  <SelectItem value="opened">Abierto</SelectItem>
                  <SelectItem value="signed">Firmado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {contracts.length === 0 ? 'No hay contratos' : 'No se encontraron contratos'}
              </h3>
              <p className="text-gray-500">
                {contracts.length === 0 
                  ? 'Crea tu primer contrato en la pestaña "Nuevo Contrato"'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{contract.clientName}</h3>
                        <Badge className={getStatusColor(contract.status)}>
                          {getStatusText(contract.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><strong>Email:</strong> {contract.clientEmail}</p>
                        <p><strong>Teléfono:</strong> {contract.clientPhone}</p>
                        <p><strong>Tipo de Póliza:</strong> {contract.policyType}</p>
                        <p><strong>Creado:</strong> {contract.createdAt.toLocaleDateString()}</p>
                      </div>
                      
                      {/* Timeline de eventos */}
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                        {contract.sentAt && (
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            Enviado: {contract.sentAt.toLocaleString()}
                          </span>
                        )}
                        {contract.openedAt && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Abierto: {contract.openedAt.toLocaleString()}
                          </span>
                        )}
                        {contract.signedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Firmado: {contract.signedAt.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewContract(contract)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Contrato
                      </Button>
                      
                      {contract.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              handleSendContract(contract, 'email');
                              simulateClientActions(contract);
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                          >
                            <Mail className="w-4 h-4" />
                            Enviar Email
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              handleSendContract(contract, 'whatsapp');
                              simulateClientActions(contract);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            WhatsApp
                          </Button>
                        </>
                      )}
                      
                      {contract.status === 'opened' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/sign/${contract.id}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Ver Firma
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {previewContract && (
        <ContractPreview
          contract={previewContract}
          onClose={() => setPreviewContract(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  );
};

export default ContractsList;
