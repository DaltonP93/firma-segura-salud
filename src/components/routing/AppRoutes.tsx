import React from 'react';
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Sales from "@/pages/Sales";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AdminPanel from "@/components/admin/AdminPanel";
import PersonalizationPanel from "@/components/personalization/PersonalizationPanel";
import SignatureManager from "@/components/signature/SignatureManager";
import SigningInterface from "@/components/signature/SigningInterface";
import TemplateDesignerPage from "@/pages/TemplateDesignerPage";

const AppRoutes = () => {
  return (
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
      
      {/* Public signing interface */}
      <Route 
        path="/sign/:token" 
        element={<SigningInterface />} 
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
        path="/sales" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <div className="p-6">
                <Sales />
              </div>
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
        path="/signatures" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <div className="p-6">
                <SignatureManager />
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

      {/* Template Designer */}
      <Route 
        path="/template-designer/:templateId" 
        element={
          <ProtectedRoute>
            <TemplateDesignerPage />
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
  );
};

export default AppRoutes;