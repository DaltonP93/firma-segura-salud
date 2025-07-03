
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  onClientInfoChange: (clientInfo: ClientInfo) => void;
}

const ClientInfoForm = ({ clientInfo, onClientInfoChange }: ClientInfoFormProps) => {
  const updateField = (field: keyof ClientInfo, value: string) => {
    onClientInfoChange({
      ...clientInfo,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información del Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="clientName">Nombre Completo *</Label>
            <Input
              id="clientName"
              value={clientInfo.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Email *</Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientInfo.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="juan@ejemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={clientInfo.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInfoForm;
