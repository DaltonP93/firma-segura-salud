
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  console.log('useUserProfile hook called, user:', user?.email, 'user ID:', user?.id);

  // Invalidate cache when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('User changed, invalidating profile cache for:', user.id);
      queryClient.invalidateQueries({ 
        queryKey: ['user-profile'] 
      });
    }
  }, [user?.id, queryClient]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID, returning null');
        return null;
      }
      
      console.log('Fetching user profile for:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, email, username, phone, company, profile_image_url, created_at, updated_at')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('User profile loaded successfully:', {
        id: data?.id,
        role: data?.role,
        full_name: data?.full_name,
        email: data?.email
      });
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      console.log(`Profile fetch failed (attempt ${failureCount + 1}):`, error?.message);
      // Retry up to 3 times for network errors, but not for auth errors
      if (error?.code === 'PGRST116' || error?.message?.includes('JWT')) {
        console.log('Auth error detected, not retrying');
        return false;
      }
      return failureCount < 3;
    },
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  console.log('useUserProfile returning:', { 
    profile: profile?.full_name, 
    isAdmin, 
    isSuperAdmin, 
    isLoading, 
    role: profile?.role,
    hasError: !!error,
    errorMessage: error?.message 
  });

  // Log detailed role information for debugging
  if (profile?.role) {
    console.log('User role details:', {
      userId: user?.id,
      role: profile.role,
      isAdmin,
      isSuperAdmin,
      profileId: profile.id
    });
  }

  return {
    profile,
    isAdmin,
    isSuperAdmin,
    isLoading,
    error,
    role: profile?.role || 'user',
  };
};
