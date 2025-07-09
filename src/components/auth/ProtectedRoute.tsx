import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - user:', user?.email, 'loading:', loading);

  if (loading) {
    console.log('ProtectedRoute - Still loading, showing spinner');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;