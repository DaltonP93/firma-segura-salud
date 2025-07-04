
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { PersonalizationProvider } from "@/components/personalization/PersonalizationProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPanel from "./components/admin/AdminPanel";
import PersonalizationPanel from "./components/personalization/PersonalizationPanel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - user:', user?.email, 'loading:', loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log('PublicRoute - user:', user?.email, 'loading:', loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    console.log('PublicRoute - User authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout component for authenticated pages
const AppLayout = ({ children }: { children: React.ReactNode }) => {
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

const App = () => {
  console.log('App - Rendering main app');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              
              {/* Protected routes with layout */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <div className="p-6">
                        <AdminPanel />
                      </div>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <div className="p-6">
                        <PersonalizationPanel />
                      </div>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Index />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
