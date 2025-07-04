
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/components/admin/user-management/UserCard';

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  username?: string;
  phone?: string;
  company?: string;
  role: string;
}

export interface PasswordResetData {
  userId: string;
  forceReset?: boolean;
}

export const userManagementService = {
  // Fetch all users (admins only)
  async fetchAllUsers(): Promise<Profile[]> {
    console.log('Fetching all users...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    console.log('Users fetched successfully:', data?.length || 0, 'users');
    return data || [];
  },

  // Create a new user
  async createUser(userData: CreateUserData): Promise<void> {
    console.log('Creating user with email:', userData.email);

    // Create user via auth signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: userData.full_name,
          username: userData.username,
        },
      },
    });

    if (signUpError) {
      console.error('SignUp error:', signUpError);
      throw signUpError;
    }

    if (signUpData.user) {
      const userId = signUpData.user.id;
      console.log('User created with ID:', userId);

      // Try to create/update the profile
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: userData.full_name,
          username: userData.username,
          phone: userData.phone,
          company: userData.company,
          role: userData.role,
          email: userData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        // Don't throw here as the user was created successfully
        console.log('Profile will be created automatically when user confirms email');
      } else {
        console.log('Profile created/updated successfully');
      }
    }
  },

  // Update user profile
  async updateUser(userId: string, updates: Partial<Profile>): Promise<void> {
    console.log('Updating user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        username: updates.username,
        phone: updates.phone,
        company: updates.company,
        role: updates.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    console.log('User updated successfully');
  },

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    console.log('Sending password reset email to:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }

    console.log('Password reset email sent successfully');
  },

  // Update user password (for admin use)
  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    console.log('Updating password for user:', userId);
    
    // This requires admin privileges and should be done through the admin API
    // For now, we'll send a password reset email as a workaround
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      throw new Error('User email not found');
    }

    await this.sendPasswordReset(profile.email);
  },

  // Delete user profile
  async deleteUser(userId: string): Promise<void> {
    console.log('Deleting user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    console.log('User deleted successfully');
  },
};
