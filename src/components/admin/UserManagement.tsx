
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userManagementService } from '@/services/userManagementService';
import UserManagementHeader from './user-management/UserManagementHeader';
import UserFilters from './user-management/UserFilters';
import UserList from './user-management/UserList';
import UserDialogs from './user-management/UserDialogs';
import { Profile } from './user-management/UserCard';
import { UserFormData } from './user-management/UserForm';
import { calculatePasswordStrength } from './user-management/PasswordStrengthIndicator';

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    username: '',
    phone: '',
    company: '',
    role: 'user',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users in UserManagement component...');
      const fetchedUsers = await userManagementService.fetchAllUsers();
      console.log('Users fetched:', fetchedUsers.length);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Error al cargar los usuarios. Verifica que tengas permisos de administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    // Validate required fields
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa email, contraseña y nombre completo",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordStrength = calculatePasswordStrength(formData.password);
    if (passwordStrength.score < 75) {
      toast({
        title: "Contraseña insegura",
        description: "La contraseña debe ser fuerte o excelente para continuar",
        variant: "destructive",
      });
      return;
    }

    setCreateLoading(true);
    
    try {
      await userManagementService.createUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone,
        company: formData.company,
        role: formData.role,
      });

      toast({
        title: "Éxito",
        description: "Usuario creado correctamente. Se ha enviado un email de confirmación.",
        duration: 6000,
      });

      setIsCreateDialogOpen(false);
      resetForm();
      
      // Refresh users list
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = "Error al crear el usuario";
      if (error.message?.includes('User already registered')) {
        errorMessage = "Este email ya está registrado";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "El formato del email no es válido";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
      } else if (error.message?.includes('Unable to validate email address')) {
        errorMessage = "No se pudo validar la dirección de email";
      } else if (error.message?.includes('Email rate limit exceeded')) {
        errorMessage = "Se ha excedido el límite de emails. Intenta de nuevo más tarde";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await userManagementService.updateUser(selectedUser.id, {
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone,
        company: formData.company,
        role: formData.role,
      });

      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el usuario",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await userManagementService.sendPasswordReset(email);
      toast({
        title: "Éxito",
        description: "Se ha enviado un email de restablecimiento de contraseña al usuario",
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error",
        description: "Error al enviar el email de restablecimiento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      await userManagementService.deleteUser(userId);

      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      username: '',
      phone: '',
      company: '',
      role: 'user',
      password: '',
    });
  };

  const openEditDialog = (user: Profile) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      company: user.company || '',
      role: user.role,
      password: '',
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader onCreateUser={() => {
        resetForm();
        setIsCreateDialogOpen(true);
      }} />

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

      <UserList
        users={filteredUsers}
        onEditUser={openEditDialog}
        onDeleteUser={handleDeleteUser}
      />

      <UserDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        createLoading={createLoading}
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
        onResetForm={resetForm}
        onPasswordReset={handlePasswordReset}
      />
    </div>
  );
};

export default UserManagement;
