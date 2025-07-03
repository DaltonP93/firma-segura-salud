
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserForm, { UserFormData } from './UserForm';
import { calculatePasswordStrength } from './PasswordStrengthIndicator';
import { Profile } from './UserCard';

interface UserDialogsProps {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  selectedUser: Profile | null;
  setSelectedUser: (user: Profile | null) => void;
  createLoading: boolean;
  onCreateUser: () => void;
  onEditUser: () => void;
  onResetForm: () => void;
}

const UserDialogs: React.FC<UserDialogsProps> = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  formData,
  setFormData,
  selectedUser,
  setSelectedUser,
  createLoading,
  onCreateUser,
  onEditUser,
  onResetForm
}) => {
  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los datos para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            formData={formData}
            setFormData={setFormData}
            isEditMode={false}
          />
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setIsCreateDialogOpen(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={onCreateUser} 
              className="flex-1"
              disabled={createLoading || passwordStrength.score < 75 || !formData.email || !formData.full_name}
            >
              {createLoading ? "Creando..." : "Crear Usuario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            formData={formData}
            setFormData={setFormData}
            isEditMode={true}
          />
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }} 
              variant="outline" 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={onEditUser} className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDialogs;
