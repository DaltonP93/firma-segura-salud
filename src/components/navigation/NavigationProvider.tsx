import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles?: string[];
  isVisible: boolean;
  sortOrder: number;
  badge?: string | number;
}

interface NavigationContextType {
  navigationItems: NavigationItem[];
  activeItem: string;
  setActiveItem: (id: string) => void;
  toggleItemVisibility: (id: string) => void;
  updateItemOrder: (items: NavigationItem[]) => void;
  loading: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'layout-dashboard',
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'documents',
    label: 'Documentos',
    path: '/?tab=contracts',
    icon: 'file-text',
    isVisible: true,
    sortOrder: 2,
  },
  {
    id: 'templates',
    label: 'Plantillas',
    path: '/?tab=templates',
    icon: 'layers',
    isVisible: true,
    sortOrder: 3,
  },
  {
    id: 'pdf-templates',
    label: 'PDF Templates',
    path: '/?tab=pdf-templates',
    icon: 'file-text',
    isVisible: true,
    sortOrder: 4,
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    path: '/profile',
    icon: 'user',
    isVisible: true,
    sortOrder: 5,
  },
  {
    id: 'admin',
    label: 'Administración',
    path: '/admin',
    icon: 'settings',
    roles: ['admin', 'super_admin'],
    isVisible: true,
    sortOrder: 6,
  },
];

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(defaultNavigationItems);
  const [activeItem, setActiveItem] = useState('');
  const [loading, setLoading] = useState(true);
  const { profile, isAdmin } = useUserRole();

  useEffect(() => {
    loadNavigationCustomization();
  }, [profile]);

  const loadNavigationCustomization = async () => {
    try {
      // Load customized navigation from database if user is admin
      if (isAdmin) {
        const { data: customization } = await supabase
          .from('app_customization')
          .select('*')
          .eq('is_active', true)
          .single();

        if (customization) {
          // Apply navigation customizations from database
          // For now, we'll use the default items but this can be extended
          const filteredItems = defaultNavigationItems.filter(item => {
            if (item.roles) {
              return item.roles.includes(profile?.role || 'user');
            }
            return true;
          });
          setNavigationItems(filteredItems);
        }
      } else {
        // Filter items based on user role
        const filteredItems = defaultNavigationItems.filter(item => {
          if (item.roles) {
            return item.roles.includes(profile?.role || 'user');
          }
          return true;
        });
        setNavigationItems(filteredItems);
      }
    } catch (error) {
      console.error('Error loading navigation customization:', error);
      // Fallback to default items
      const filteredItems = defaultNavigationItems.filter(item => {
        if (item.roles) {
          return item.roles.includes(profile?.role || 'user');
        }
        return true;
      });
      setNavigationItems(filteredItems);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemVisibility = (id: string) => {
    setNavigationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
    );
  };

  const updateItemOrder = (newItems: NavigationItem[]) => {
    setNavigationItems(newItems);
  };

  return (
    <NavigationContext.Provider
      value={{
        navigationItems,
        activeItem,
        setActiveItem,
        toggleItemVisibility,
        updateItemOrder,
        loading,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
