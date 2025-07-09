
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    id: 'signatures',
    label: 'Firmas Electrónicas',
    path: '/signatures',
    icon: 'pen-tool',
    isVisible: true,
    sortOrder: 3,
  },
  {
    id: 'sales',
    label: 'Ventas',
    path: '/sales',
    icon: 'shopping-cart',
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
  const [loading, setLoading] = useState(false);

  console.log('NavigationProvider rendering with items:', navigationItems.length);

  // Simplified initialization - no complex role checking to avoid circular dependencies
  useEffect(() => {
    console.log('NavigationProvider - initializing navigation items');
    setNavigationItems(defaultNavigationItems);
    setLoading(false);
  }, []);

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
