import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import type { SalesRequestWithDetails } from '../SalesRequestsList';

interface ClientInfoTabProps {
  request: SalesRequestWithDetails;
}

const ClientInfoTab: React.FC<ClientInfoTabProps> = ({ request }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Información del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
              <p className="text-base font-medium">{request.client_name}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{request.client_email || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <p className="text-sm">{request.client_phone || 'No especificado'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">DNI/Cédula</label>
              <p className="text-sm">{request.client_dni || 'No especificado'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                <p className="text-sm">{request.client_birth_date || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                <p className="text-sm">{request.client_address || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ocupación</label>
                <p className="text-sm">{request.client_occupation || 'No especificada'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
              <p className="text-sm">{request.client_marital_status || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInfoTab;
