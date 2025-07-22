import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Users, 
  FileText, 
  Edit,
  Send,
  Download,
  Share2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { salesService } from '@/services/salesService';

// Components
import RequestOverviewCard from './components/RequestOverviewCard';
import RequestProgressCard from './components/RequestProgressCard';
import DocumentUploader from './DocumentUploader';
import ContractGenerator from './ContractGenerator';

import type { SalesRequestWithDetails } from './SalesRequestsList';

interface SalesRequestDetailProps {
  requestId: string;
  onBack: () => void;
  onEdit: (request: SalesRequestWithDetails) => void;
  onProcessHealthDeclaration: (request: SalesRequestWithDetails) => void;
  onSendForSignature: (request: SalesRequestWithDetails) => void;
}

interface DetailedSalesRequest extends SalesRequestWithDetails {
  beneficiaries: any[];
  health_declaration?: any;
  documents?: any[];
  contracts?: any[];
  signature_status?: 'pending' | 'signed' | 'completed';
  completed_at?: string;
}

const SalesRequestDetail: React.FC<SalesRequestDetailProps> = ({
  requestId,
  onBack,
  onEdit,
  onProcessHealthDeclaration,
  onSendForSignature
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<DetailedSalesRequest | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const data = await salesService.getSalesRequestById(requestId);
      
      // Transform the data to match our interface
      const detailedRequest: DetailedSalesRequest = {
        id: data.id,
        request_number: data.request_number,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_dni: data.client_dni,
        client_birth_date: data.client_birth_date,
        client_address: data.client_address,
        policy_type: data.policy_type,
        insurance_plan_id: data.insurance_plan_id,
        status: data.status as 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected',
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        completed_at: data.completed_at,
        beneficiaries: data.beneficiaries || [],
        beneficiaries_count: data.beneficiaries?.length || 0,
        health_declaration: (data as any).health_declaration,
        documents: [], // TODO: Implement documents fetching
        contracts: [], // TODO: Implement contracts fetching
        signature_status: data.status === 'completed' ? 'completed' : 
                         data.status === 'pending_signature' ? 'pending' : undefined
      };
      
      setRequest(detailedRequest);
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast({
        title: "Error",
        description: "Error al cargar los detalles de la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    return amount ? new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount) : 'N/A';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-600">Cargando detalles...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se pudo cargar la solicitud
        </h3>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {request.client_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Solicitud {request.request_number} • {formatDate(request.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <RequestProgressCard status={request.status} />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {request.status === 'draft' && (
          <Button onClick={() => onEdit(request)} size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
        {request.status === 'pending_health_declaration' && (
          <Button onClick={() => onProcessHealthDeclaration(request)} size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Procesar Declaración
          </Button>
        )}
        {request.status === 'pending_signature' && (
          <Button 
            size="sm" 
            onClick={() => onSendForSignature(request)}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar para Firma
          </Button>
        )}
        {request.status === 'completed' && (
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Descargar Contrato
          </Button>
        )}
        <Button size="sm" variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="titular">Titular</TabsTrigger>
          <TabsTrigger value="beneficiarios">Beneficiarios</TabsTrigger>
          <TabsTrigger value="salud">Declaración</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <RequestOverviewCard request={request} />
        </TabsContent>

        <TabsContent value="titular" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Datos del Titular
              </CardTitle>
              <CardDescription>
                Información personal del titular de la póliza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                  <p className="text-lg font-semibold">{request.client_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">DNI/Cédula</label>
                  <p className="text-lg">{request.client_dni || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{request.client_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-lg">{request.client_phone || 'No especificado'}</p>
                </div>
                {request.client_birth_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                    <p className="text-lg">
                      {formatDate(request.client_birth_date)} 
                      <span className="text-gray-600 ml-2">({calculateAge(request.client_birth_date)} años)</span>
                    </p>
                  </div>
                )}
              </div>
              {request.client_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Dirección Completa</label>
                  <p className="text-lg">{request.client_address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficiarios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Beneficiarios ({request.beneficiaries.length})
              </CardTitle>
              <CardDescription>
                Listado de beneficiarios de la póliza
              </CardDescription>
            </CardHeader>
            <CardContent>
              {request.beneficiaries.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No hay beneficiarios registrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {request.beneficiaries.map((beneficiary, index) => (
                    <div key={beneficiary.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{beneficiary.name}</h3>
                          <p className="text-gray-600">{beneficiary.relationship}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={beneficiary.is_primary ? "default" : "secondary"}>
                            {beneficiary.is_primary ? "Principal" : "Secundario"}
                          </Badge>
                          <Badge variant="outline">
                            {beneficiary.percentage || 0}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-gray-600">DNI</label>
                          <p>{beneficiary.dni || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Teléfono</label>
                          <p>{beneficiary.phone || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Email</label>
                          <p>{beneficiary.email || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salud" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Declaración Jurada de Salud
              </CardTitle>
              <CardDescription>
                Estado de la declaración de salud del titular
              </CardDescription>
            </CardHeader>
            <CardContent>
              {request.health_declaration ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Declaración completada</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Declaración procesada el {formatDate(request.health_declaration.created_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                  <p className="text-gray-500 mb-4">Declaración de salud pendiente</p>
                  {request.status === 'pending_health_declaration' && (
                    <Button onClick={() => onProcessHealthDeclaration(request)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Procesar Declaración
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <DocumentUploader
            salesRequest={request}
            onDocumentUploaded={() => fetchRequestDetails()}
          />
        </TabsContent>

        <TabsContent value="contratos" className="mt-6">
          <ContractGenerator
            salesRequest={request}
            onContractGenerated={() => fetchRequestDetails()}
            onSendForSignature={onSendForSignature}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesRequestDetail;
