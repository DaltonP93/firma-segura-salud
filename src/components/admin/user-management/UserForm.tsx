
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Key } from 'lucide-react';
import PasswordStrengthIndicator, { calculatePasswordStrength } from './PasswordStrengthIndicator';

interface UserFormData {
  full_name: string;
  email: string;
  username: string;
  phone: string;
  company: string;
  role: string;
  password: string;
}

interface UserFormProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  isEditMode?: boolean;
  onPasswordReset?: (email: string) => void;
}

const UserForm: React.FC<UserFormProps> = ({ 
  formData, 
  setFormData, 
  isEditMode = false,
  onPasswordReset 
}) => {
  const passwordStrength = calculatePasswordStrength(formData.password);

  const handlePasswordReset = () => {
    if (formData.email && onPasswordReset) {
      onPasswordReset(formData.email);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${isEditMode ? 'edit' : 'create'}-full-name`}>
          Nombre Completo {!isEditMode && '*'}
        </Label>
        <Input
          id={`${isEditMode ? 'edit' : 'create'}-full-name`}
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          placeholder="Juan Pérez"
          required={!isEditMode}
        />
      </div>
      
      {!isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="create-email">Email *</Label>
          <Input
            id="create-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="juan@ejemplo.com"
            required
          />
        </div>
      )}
      
      {!isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="create-password">Contraseña *</Label>
          <Input
            id="create-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Contraseña segura"
            required
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>
      )}

      {isEditMode && formData.email && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Gestión de Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-blue-700 mb-3">
              Para cambiar la contraseña del usuario, se enviará un email de restablecimiento.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePasswordReset}
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email de Restablecimiento
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`${isEditMode ? 'edit' : 'create'}-username`}>Nombre de Usuario</Label>
        <Input
          id={`${isEditMode ? 'edit' : 'create'}-username`}
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          placeholder="juan_perez"
        />
      </div>
      
      {isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Teléfono</Label>
          <Input
            id="edit-phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      )}
      
      {isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="edit-company">Empresa</Label>
          <Input
            id="edit-company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`${isEditMode ? 'edit' : 'create'}-role`}>Rol</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="moderator">Moderador</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export type { UserFormData };
export default UserForm;
