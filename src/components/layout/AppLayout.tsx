import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { PersonalizationProvider } from "@/components/personalization/PersonalizationProvider";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  console.log('AppLayout - Rendering layout');
  
  return (
    <NavigationProvider>
      <PersonalizationProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <AppHeader />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </PersonalizationProvider>
    </NavigationProvider>
  );
};

export default AppLayout;