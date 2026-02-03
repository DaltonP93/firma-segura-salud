import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  MoreHorizontal,
  Search,
  MessageSquare,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import { SalesRequestWithDetails } from './SalesRequestsList';

interface SalesRequestsTableProps {
  requests: SalesRequestWithDetails[];
  onViewRequest: (request: SalesRequestWithDetails) => void;
  onEditRequest: (request: SalesRequestWithDetails) => void;
  onProcessHealthDeclaration: (request: SalesRequestWithDetails) => void;
  onSendForSignature: (request: SalesRequestWithDetails) => void;
  onDeleteRequest: (request: SalesRequestWithDetails) => void;
  onWhatsApp: (request: SalesRequestWithDetails) => void;
  loading: boolean;
}

type SortField = 'request_number' | 'client_name' | 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

const SalesRequestsTable: React.FC<SalesRequestsTableProps> = ({
  requests,
  onViewRequest,
  onEditRequest,
  onProcessHealthDeclaration,
  onSendForSignature,
  onDeleteRequest,
  onWhatsApp,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending_signature':
        return 'secondary';
      case 'pending_health_declaration':
        return 'outline';
      case 'rejected':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending_health_declaration':
        return 'Pend. Declaración';
      case 'pending_signature':
        return 'Pend. Firma';
      case 'completed':
        return 'Completado';
      case 'rejected':
        return 'Rechazado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.client_email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'request_number':
          comparison = a.request_number.localeCompare(b.request_number);
          break;
        case 'client_name':
          comparison = a.client_name.localeCompare(b.client_name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'created_at':
        default:
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Cargando solicitudes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            Solicitudes ({requests.length})
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="pending_health_declaration">
                  Pend. Declaración
                </SelectItem>
                <SelectItem value="pending_signature">Pend. Firma</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredAndSortedRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'No se encontraron solicitudes con los filtros aplicados'
              : 'No hay solicitudes de venta todavía'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3 font-medium"
                      onClick={() => handleSort('request_number')}
                    >
                      N° Solicitud
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3 font-medium"
                      onClick={() => handleSort('client_name')}
                    >
                      Cliente
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden xl:table-cell">Póliza</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3 font-medium"
                      onClick={() => handleSort('status')}
                    >
                      Estado
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-center">
                    Benef.
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3 font-medium"
                      onClick={() => handleSort('created_at')}
                    >
                      Fecha
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewRequest(request)}
                  >
                    <TableCell className="font-medium text-primary">
                      {request.request_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.client_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {request.client_email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {request.client_phone || '-'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {request.policy_type}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      {request.beneficiaries_count}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewRequest(request);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditRequest(request);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>

                          {request.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onProcessHealthDeclaration(request);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Declaración Salud
                            </DropdownMenuItem>
                          )}

                          {request.status === 'pending_signature' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onSendForSignature(request);
                              }}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Enviar Firma
                            </DropdownMenuItem>
                          )}

                          {request.status === 'completed' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // Download PDF logic
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </DropdownMenuItem>
                          )}

                          {request.client_phone && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onWhatsApp(request);
                              }}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              WhatsApp
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRequest(request);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesRequestsTable;
