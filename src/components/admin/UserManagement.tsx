import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Error al cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfirmationStatus = async () => {
    try {
      // Check if email confirmation is required by attempting to get auth settings
      const { data: settings } = await supabase.auth.getSession();
      return settings !== null;
    } catch (error) {
      console.warn('Could not check email confirmation status:', error);
      return true; // Assume confirmation is required if we can't check
    }
  };

  const handleCreateUser = async () => {
    // Validar campos requeridos
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa email, contraseña y nombre completo",
        variant: "destructive",
      });
      return;
    }

    // Validar contraseña
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
    console.log('Starting user creation process...', { email: formData.email, name: formData.full_name });
    
    try {
      // First create the user via signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.full_name,
            username: formData.username,
          },
        },
      });

      if (signUpError) {
        console.error('SignUp error:', signUpError);
        throw signUpError;
      }

      console.log('SignUp successful:', signUpData);

      // Check if user was created successfully
      if (signUpData.user) {
        const userId = signUpData.user.id;
        console.log('User created with ID:', userId);

        // Check if email confirmation is required
        const needsConfirmation = !signUpData.user.email_confirmed_at;
        
        if (needsConfirmation) {
          console.log('User needs email confirmation');
          toast({
            title: "Usuario creado",
            description: "Usuario creado exitosamente. Se ha enviado un email de confirmación. El perfil se completará una vez que se confirme el email.",
            duration: 6000,
          });
        }

        // Try to update/create the profile regardless of confirmation status
        try {
          // First check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

          if (existingProfile) {
            // Update existing profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                full_name: formData.full_name,
                username: formData.username,
                phone: formData.phone,
                company: formData.company,
                role: formData.role,
                email: formData.email,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);

            if (updateError) {
              console.error('Profile update error:', updateError);
            } else {
              console.log('Profile updated successfully');
            }
          } else {
            // Create new profile
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                full_name: formData.full_name,
                username: formData.username,
                phone: formData.phone,
                company: formData.company,
                role: formData.role,
                email: formData.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error('Profile insert error:', insertError);
            } else {
              console.log('Profile created successfully');
            }
          }

          if (!needsConfirmation) {
            toast({
              title: "Éxito",
              description: "Usuario creado correctamente",
            });
          }
        } catch (profileError) {
          console.error('Profile operation error:', profileError);
          toast({
            title: "Usuario creado",
            description: "Usuario creado pero hubo un problema al configurar el perfil. Será configurado automáticamente cuando el usuario confirme su email.",
            variant: "default",
          });
        }
      } else {
        console.warn('SignUp succeeded but no user returned');
        toast({
          title: "Advertencia",
          description: "La creación del usuario puede estar pendiente de confirmación por email",
        });
      }

      setIsCreateDialogOpen(false);
      resetForm();
      
      // Refresh users list after a short delay to allow for database updates
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          phone: formData.phone,
          company: formData.company,
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil de usuario eliminado correctamente",
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
    return <div className="flex justify-center py-8">Cargando usuarios...</div>;
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
      />
    </div>
  );
};

export default UserManagement;
