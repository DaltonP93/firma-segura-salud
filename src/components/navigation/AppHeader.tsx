import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  User, 
  Settings, 
  Shield,
  FileText,
  Bell
} from 'lucide-react';
import NotificationList from '@/components/notifications/NotificationList';
import NotificationDetails from '@/components/notifications/NotificationDetails';
import { Notification } from '@/components/notifications/NotificationItem';
import { supabase } from '@/integrations/supabase/client';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

interface AppCustomization {
  theme_name: string;
  logo_url: string | null;
  app_title: string;
  app_subtitle: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
}

// Enhanced mock notifications with more detailed data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Documento firmado',
    message: 'El contrato de Juan Pérez ha sido firmado exitosamente',
    time: '5 min',
    read: false,
    type: 'success',
    category: 'document',
    details: 'El documento "Contrato de Servicios - Juan Pérez" ha sido firmado digitalmente. Puedes descargar el documento final desde la sección de documentos.',
    actionUrl: '/documents/1',
    actionText: 'Ver documento'
  },
  {
    id: '2',
    title: 'Nueva plantilla disponible',
    message: 'Se ha añadido una nueva plantilla PDF al sistema',
    time: '1 hora',
    read: false,
    type: 'info',
    category: 'system',
    details: 'La plantilla "Contrato de Arrendamiento" está ahora disponible para crear nuevos documentos. Incluye campos automáticos para datos del inquilino y propietario.',
    actionUrl: '/templates',
    actionText: 'Ver plantillas'
  },
  {
    id: '3',
    title: 'Documento enviado',
    message: 'Se envió el contrato a cliente@email.com',
    time: '2 horas',
    read: true,
    type: 'info',
    category: 'document',
    details: 'El documento ha sido enviado por correo electrónico al cliente. Se notificará cuando sea abierto o firmado.',
    actionUrl: '/documents/3',
    actionText: 'Ver estado'
  },
  {
    id: '4',
    title: 'Nuevo usuario registrado',
    message: 'Un nuevo usuario se ha registrado en el sistema',
    time: '3 horas',
    read: false,
    type: 'info',
    category: 'user',
    details: 'El usuario "Maria García" se ha registrado y está pendiente de aprobación. Revisa sus datos y asigna los permisos correspondientes.',
    actionUrl: '/admin/users',
    actionText: 'Gestionar usuarios'
  }
];

const defaultCustomization: AppCustomization = {
  theme_name: 'default',
  logo_url: null,
  app_title: 'Sistema de Gestión Documental',
  app_subtitle: '',
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
  accent_color: '#10b981',
  font_family: 'Inter'
};

const AppHeader = ({ title, subtitle }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeCustomization, setActiveCustomization] = useState<AppCustomization>(defaultCustomization);

  // Load active customization from system_config
  useEffect(() => {
    const fetchActiveCustomization = async () => {
      try {
        const { data: configData } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'app_customization')
          .single();

        if (configData?.value && typeof configData.value === 'object') {
          const customValue = configData.value as Record<string, unknown>;
          setActiveCustomization({
            theme_name: (customValue.theme_name as string) || defaultCustomization.theme_name,
            logo_url: (customValue.logo_url as string | null) || null,
            app_title: (customValue.app_title as string) || defaultCustomization.app_title,
            app_subtitle: (customValue.app_subtitle as string) || '',
            primary_color: (customValue.primary_color as string) || defaultCustomization.primary_color,
            secondary_color: (customValue.secondary_color as string) || defaultCustomization.secondary_color,
            accent_color: (customValue.accent_color as string) || defaultCustomization.accent_color,
            font_family: (customValue.font_family as string) || defaultCustomization.font_family,
          });
        }
      } catch (error) {
        console.error('Error fetching active customization:', error);
      }
    };

    fetchActiveCustomization();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailsOpen(true);
    setIsNotificationsOpen(false);
    
    // Mark as read when opened
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      toast({
        title: "Redirigiendo",
        description: `Navegando a ${notification.actionText}`,
      });
    }
  };

  // Get the title and subtitle from customization or props
  const displayTitle = activeCustomization.app_title || title || 'Sistema de Gestión Documental';
  const displaySubtitle = activeCustomization.app_subtitle || subtitle;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {/* Display custom logo if available, otherwise show default icon */}
            {activeCustomization.logo_url ? (
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                <img 
                  src={activeCustomization.logo_url} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-sm text-gray-500">{displaySubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <NotificationList
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onRemove={removeNotification}
                />
              </PopoverContent>
            </Popover>

            {/* Notification Details Modal */}
            <NotificationDetails
              notification={selectedNotification}
              isOpen={isDetailsOpen}
              onClose={() => setIsDetailsOpen(false)}
              onMarkAsRead={markAsRead}
              onAction={handleNotificationAction}
            />

            {/* Admin Panel Access */}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={profile?.avatar_url || ''} 
                      alt={profile?.full_name || user?.email || 'Usuario'} 
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
                        Administrador
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Panel Admin</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
