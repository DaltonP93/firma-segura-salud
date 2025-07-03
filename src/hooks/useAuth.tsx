
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setAuthState({
          user: session?.user ?? null,
          loading: false,
        });
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setAuthState({
          user: session?.user ?? null,
          loading: false,
        });
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        setAuthState({
          user: null,
          loading: false,
        });
      }
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { data: null, error: error as any };
    }
  };

  const signInWithUsername = async (username: string, password: string) => {
    try {
      // First get the user's email from their username
      const { data: userProfile, error: profileError } = await supabase
        .rpc('get_user_by_username_or_email', { identifier: username });
      
      if (profileError || !userProfile || userProfile.length === 0) {
        return {
          data: null,
          error: { message: 'Usuario no encontrado' }
        };
      }

      // Then sign in with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userProfile[0].email,
        password,
      });
      
      return { data, error };
    } catch (error) {
      console.error('Unexpected username sign in error:', error);
      return { data: null, error: error as any };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string, username?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const signUpData: any = {
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      };

      // If username is provided, add it to the metadata
      if (username) {
        signUpData.options.data.username = username;
      }

      const { data, error } = await supabase.auth.signUp(signUpData);
      
      // If signup successful and username provided, update the profile
      if (!error && data.user && username) {
        await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { data: null, error: error as any };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { error: error as any };
    }
  };

  return {
    ...authState,
    signInWithEmail,
    signInWithUsername,
    signUpWithEmail,
    signOut,
  };
};
