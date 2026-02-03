
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useNavigation } from './NavigationProvider';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  LayoutDashboard,
  FileText,
  Layers,
  Settings,
  Plus,
  Eye,
  PenTool,
  User,
  ShoppingCart
} from 'lucide-react';

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'file-text': FileText,
  'layers': Layers,
  'settings': Settings,
  'plus': Plus,
  'eye': Eye,
  'pen-tool': PenTool,
  'user': User,
  'shopping-cart': ShoppingCart,
};

const AppSidebar = () => {
  const { state } = useSidebar();
  const { navigationItems, setActiveItem } = useNavigation();
  const { profile, isLoading } = useUserProfile();
  const location = useLocation();

  console.log('AppSidebar rendering - state:', state, 'profile loading:', isLoading, 'profile:', profile?.role);

  const isCollapsed = state === 'collapsed';

  const getNavClass = (isActive: boolean) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const isActiveRoute = (path: string) => {
    if (path.includes('?tab=')) {
      const [basePath, tabParam] = path.split('?tab=');
      return location.pathname === basePath && location.search.includes(`tab=${tabParam}`);
    }
    return location.pathname === path;
  };

  // Filter items based on user role - more defensive approach
  const visibleItems = navigationItems
    .filter(item => {
      if (!item.isVisible) return false;
      
      // If item has role restrictions
      if (item.roles && item.roles.length > 0) {
        // If profile is still loading, hide role-restricted items temporarily
        if (isLoading) {
          console.log('Profile still loading, hiding role-restricted item:', item.id);
          return false;
        }
        
        // If profile is loaded, check role
        if (profile && profile.role) {
          const hasRole = item.roles.includes(profile.role);
          console.log('Checking role for item:', item.id, 'user role:', profile.role, 'required roles:', item.roles, 'has access:', hasRole);
          return hasRole;
        }
        
        // If no profile or role, hide role-restricted items
        console.log('No profile or role, hiding role-restricted item:', item.id);
        return false;
      }
      
      // Show items without role restrictions
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  console.log('AppSidebar - visible items:', visibleItems.map(item => item.id));

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          {!isCollapsed && (
            <span className="text-lg font-semibold">Menu</span>
          )}
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || FileText;
                const isActive = isActiveRoute(item.path);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path} 
                        className={getNavClass(isActive)}
                        onClick={() => {
                          console.log('Navigation item clicked:', item.id);
                          setActiveItem(item.id);
                        }}
                      >
                        <IconComponent className="h-4 w-4" />
                        {!isCollapsed && (
                          <span className="flex items-center justify-between w-full">
                            {item.label}
                            {item.badge && (
                              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
