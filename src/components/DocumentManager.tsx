
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, CheckCircle, Eye, FileText, MoreHorizontal, Trash2, Edit, Share, Download, MessageCircle, X } from 'lucide-react';
import type { Contract } from '@/pages/Index';
import ResponsiveSignatureModal from './ResponsiveSignatureModal';

interface DocumentManagerProps {
  contracts: Contract[];
  onUpdateStatus: (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => void;
}

const DocumentManager = ({ contracts, onUpdateStatus }: DocumentManagerProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [signatureContract, setSignatureContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.templateType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAction = async (contract: Contract, action: string) => {
    switch (action) {
      case 'send-email':
        await handleSendContract(contract, 'email');
        break;
      case 'send-whatsapp':
        await handleSendContract(contract, 'whatsapp');
        break;
      case 'resend':
        await handleResendContract(contract);
        break;
      case 'edit':
        handleEditContract(contract);
        break;
      case 'delete':
        handleDeleteContract(contract);
        break;
      case 'cancel-send':
        handleCancelSend(contract);
        break;
      case 'share-whatsapp':
        handleShareWhatsApp(contract);
        break;
      case 'download':
        handleDownloadContract(contract);
        break;
      case 'sign':
        setSignatureContract(contract);
        break;
    }
  };

  const handleSendContract = async (contract: Contract, method: 'email' | 'whatsapp') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const shareableLink = `${window.location.origin}/sign/${contract.id}`;
      onUpdateStatus(contract.id, 'sent', { shareableLink });
      
      // Simulate client actions
      simulateClientActions(contract);
      
      toast({
        title: "Documento Enviado",
        description: `El documento ha sido enviado a ${contract.clientName} por ${method === 'email' ? 'correo' : 'WhatsApp'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el documento",
        variant: "destructive",
      });
    }
  };

  const handleResendContract = async (contract: Contract) => {
    toast({
      title: "Documento Reenviado",
      description: `Se ha reenviado el documento a ${contract.clientName}`,
    });
  };

  const handleEditContract = (contract: Contract) => {
    toast({
      title: "Función de Edición",
      description: "La edición del documento será implementada próximamente",
    });
  };

  const handleDeleteContract = (contract: Contract) => {
    toast({
      title: "Documento Eliminado",
      description: `El documento de ${contract.clientName} ha sido eliminado`,
      variant: "destructive",
    });
  };

  const handleCancelSend = (contract: Contract) => {
    onUpdateStatus(contract.id, 'draft');
    toast({
      title: "Envío Cancelado",
      description: "El envío del documento ha sido cancelado",
    });
  };

  const handleShareWhatsApp = (contract: Contract) => {
    const shareableLink = contract.shareableLink || `${window.location.origin}/sign/${contract.id}`;
    const message = `Hola ${contract.clientName}, tienes un documento para firmar: ${shareableLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Compartir por WhatsApp",
      description: "Se ha abierto WhatsApp para compartir el documento",
    });
  };

  const handleDownloadContract = (contract: Contract) => {
    toast({
      title: "Descarga Iniciada",
      description: "El documento se está descargando como PDF",
    });
  };

  const simulateClientActions = (contract: Contract) => {
    setTimeout(() => {
      onUpdateStatus(contract.id, 'received');
      toast({
        title: "Estado Actualizado", 
        description: `${contract.clientName} ha recibido el documento`,
      });
    }, 3000);

    setTimeout(() => {
      onUpdateStatus(contract.id, 'opened');
      toast({
        title: "Estado Actualizado",
        description: `${contract.clientName} ha abierto el documento`,
      });
    }, 8000);
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

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'contrato': return 'Contrato';
      case 'anexo': return 'Anexo';
      case 'declaracion': return 'Declaración Jurada';
      default: return 'Documento';
    }
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl text-primary">Gestión de Documentos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="contrato">Contratos</SelectItem>
                  <SelectItem value="anexo">Anexos</SelectItem>
                  <SelectItem value="declaracion">Declaraciones</SelectItem>
                </SelectContent>
              </Select>
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
                {contracts.length === 0 ? 'No hay documentos' : 'No se encontraron documentos'}
              </h3>
              <p className="text-gray-500">
                {contracts.length === 0 
                  ? 'Genera tu primer documento en la pestaña "Generar Nuevo"'
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
                        {contract.templateType && (
                          <Badge variant="outline">
                            {getTypeLabel(contract.templateType)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                        <p><strong>Email:</strong> {contract.clientEmail}</p>
                        <p><strong>Teléfono:</strong> {contract.clientPhone}</p>
                        <p><strong>ID:</strong> {contract.id}</p>
                        <p><strong>Creado:</strong> {contract.createdAt.toLocaleDateString()}</p>
                        {contract.sentAt && (
                          <p><strong>Enviado:</strong> {contract.sentAt.toLocaleDateString()}</p>
                        )}
                        {contract.signedAt && (
                          <p><strong>Firmado:</strong> {contract.signedAt.toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {contract.status === 'completed' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Listo para descargar</span>
                          </div>
                        )}
                        {contract.shareableLink && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Share className="w-3 h-3" />
                            <span>Link disponible</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Quick action buttons */}
                      {contract.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(contract, 'send-email')}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar
                          </Button>
                        </>
                      )}
                      
                      {contract.status === 'opened' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(contract, 'sign')}
                          className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Firmar
                        </Button>
                      )}

                      {(contract.status === 'signed' || contract.status === 'completed') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(contract, 'download')}
                          className="bg-green-50 hover:bg-green-100 border-green-200"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      )}

                      {/* More actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleAction(contract, 'edit')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          
                          {contract.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleAction(contract, 'resend')}>
                              <Send className="w-4 h-4 mr-2" />
                              Reenviar
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleAction(contract, 'share-whatsapp')}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Compartir WhatsApp
                          </DropdownMenuItem>
                          
                          {contract.status === 'sent' && (
                            <DropdownMenuItem onClick={() => handleAction(contract, 'cancel-send')}>
                              <X className="w-4 h-4 mr-2" />
                              Cancelar Envío
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleAction(contract, 'delete')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {signatureContract && (
        <ResponsiveSignatureModal
          contract={signatureContract}
          onClose={() => setSignatureContract(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  );
};

export default DocumentManager;
