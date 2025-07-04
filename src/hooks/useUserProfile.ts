
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserProfile = () => {
  const { user } = useAuth();

  console.log('useUserProfile hook called, user:', user?.email);

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
        return null;
      }
      
      console.log('User profile loaded:', data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  console.log('useUserProfile returning:', { 
    profile: profile?.full_name, 
    isAdmin, 
    isSuperAdmin, 
    isLoading, 
    role: profile?.role 
  });

  return {
    profile,
    isAdmin,
    isSuperAdmin,
    isLoading,
    error,
    role: profile?.role || 'user',
  };
};
