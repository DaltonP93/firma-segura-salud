
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
import { 
  LayoutDashboard,
  FileText,
  Layers,
  Settings,
  Plus,
  Eye,
  PenTool,
  User
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
};

const AppSidebar = () => {
  const { state } = useSidebar();
  const { navigationItems, activeItem, setActiveItem } = useNavigation();
  const location = useLocation();

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

  const visibleItems = navigationItems
    .filter(item => item.isVisible)
    .filter(item => !['templates', 'pdf-templates'].includes(item.id)) // Remove templates and pdf-templates
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
                        onClick={() => setActiveItem(item.id)}
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
