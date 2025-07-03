
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useNavigation } from './NavigationProvider';
import { 
  LayoutDashboard,
  FileText,
  Layers,
  Settings,
  Plus,
  Eye,
  PenTool
} from 'lucide-react';

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'file-text': FileText,
  'layers': Layers,
  'settings': Settings,
  'plus': Plus,
  'eye': Eye,
  'pen-tool': PenTool,
};

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  const { navigationItems, activeItem, setActiveItem } = useNavigation();
  const location = useLocation();

  const getNavClass = (isActive: boolean) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const isActiveRoute = (path: string) => {
    if (path.includes('?tab=')) {
      const [basePath, tabParam] = path.split('?tab=');
      return location.pathname === basePath && location.search.includes(`tab=${tabParam}`);
    }
    return location.pathname === path;
  };

  const visibleItems = navigationItems
    .filter(item => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navegación Principal
          </SidebarGroupLabel>
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
                        onClick={() => setActiveItem(item.id)}
                      >
                        <IconComponent className="h-4 w-4" />
                        {!collapsed && (
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
