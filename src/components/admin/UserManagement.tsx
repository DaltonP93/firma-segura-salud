import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, Mail, Phone, Building, Calendar, Search, AlertCircle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  company: string | null;
  role: string;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    special: boolean;
  };
}

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

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    phone: '',
    company: '',
    role: 'user',
    password: '',
  });

  // Enhanced password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let score = 0;
    let label = '';
    let color = '';

    if (password.length === 0) {
      score = 0;
      label = 'Sin contraseña';
      color = 'text-gray-500';
    } else if (metRequirements <= 2) {
      score = 25;
      label = 'Muy débil';
      color = 'text-red-600';
    } else if (metRequirements === 3) {
      score = 50;
      label = 'Débil';
      color = 'text-orange-600';
    } else if (metRequirements === 4) {
      score = 75;
      label = 'Buena';
      color = 'text-yellow-600';
    } else if (metRequirements === 5) {
      score = 100;
      label = 'Excelente';
      color = 'text-green-600';
    }

    return { score, label, color, requirements };
  };

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

      if (signUpError) throw signUpError;

      // If signup successful, update the profile with additional data
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
            phone: formData.phone,
            company: formData.company,
            role: formData.role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', signUpData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          toast({
            title: "Usuario creado",
            description: "Usuario creado exitosamente. Algunos datos adicionales pueden necesitar ser actualizados manualmente.",
          });
        } else {
          toast({
            title: "Éxito",
            description: "Usuario creado correctamente",
          });
        }
      }

      setIsCreateDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = "Error al crear el usuario";
      if (error.message?.includes('Password should contain')) {
        errorMessage = "La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial";
      } else if (error.message?.includes('already registered')) {
        errorMessage = "Este email ya está registrado";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "El formato del email no es válido";
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa los datos para crear un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-full-name">Nombre Completo *</Label>
                <Input
                  id="create-full-name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
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
                
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fortaleza de la contraseña:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress 
                      value={passwordStrength.score} 
                      className="h-2"
                    />
                    
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">Requisitos:</div>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          {passwordStrength.requirements.length ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span>Mínimo 8 caracteres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.requirements.lowercase ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span>Una letra minúscula</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.requirements.uppercase ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span>Una letra mayúscula</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.requirements.numbers ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span>Un número</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.requirements.special ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span>Un carácter especial</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-username">Nombre de Usuario</Label>
                <Input
                  id="create-username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="juan_perez"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-role">Rol</Label>
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
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsCreateDialogOpen(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  className="flex-1"
                  disabled={createLoading || passwordStrength.score < 75 || !formData.email || !formData.full_name}
                >
                  {createLoading ? "Creando..." : "Crear Usuario"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, email o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.profile_image_url || undefined} />
                    <AvatarFallback>
                      {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.full_name || 'Sin nombre'}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 'super_admin' ? 'Super Admin' :
                         user.role === 'admin' ? 'Admin' :
                         user.role === 'moderator' ? 'Moderador' : 'Usuario'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.company && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {user.company}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No se encontraron usuarios</p>
                <p className="text-sm">Ajusta los filtros o crea un nuevo usuario</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-full-name">Nombre Completo</Label>
              <Input
                id="edit-full-name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-username">Nombre de Usuario</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-company">Empresa</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
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
              <Button onClick={handleEditUser} className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
