import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  
  console.log('PublicRoute - user:', user?.email, 'loading:', loading);

  if (loading) {
    console.log('PublicRoute - Still loading, showing spinner');
    return <LoadingSpinner />;
  }

  if (user) {
    console.log('PublicRoute - User authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('PublicRoute - No user, rendering children');
  return <>{children}</>;
};

export default PublicRoute;