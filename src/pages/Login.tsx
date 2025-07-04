import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useAuthErrorHandler } from '@/components/auth/AuthErrorHandler';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    handleSignInError,
    handleSignUpError,
    handlePasswordResetError,
    handleSocialLoginError,
    handleValidationError,
    handleUnexpectedError,
  } = useAuthErrorHandler();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (email: string, password: string) => {
    if (!email || !password) {
      handleValidationError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    console.log('Attempting to sign in:', { email });
    
    try {
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        handleSignInError(error);
      } else {
        console.log('Sign in successful');
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente",
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      handleUnexpectedError();
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    if (!email || !password || !fullName) {
      handleValidationError("Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      handleValidationError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    console.log('Attempting to sign up:', { email, fullName });
    
    try {
      const { error } = await signUpWithEmail(email, password, fullName);
      
      if (error) {
        handleSignUpError(error);
      } else {
        console.log('Sign up successful');
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar tu cuenta antes de iniciar sesión",
          duration: 6000,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      handleUnexpectedError();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (resetEmail: string) => {
    if (!resetEmail) {
      handleValidationError("Por favor ingresa tu email");
      return;
    }

    setResetLoading(true);
    console.log('Attempting password reset for:', resetEmail);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        handlePasswordResetError(error);
      } else {
        console.log('Password reset email sent successfully');
        toast({
          title: "Email enviado",
          description: "Revisa tu email para restablecer tu contraseña",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      handleUnexpectedError();
    } finally {
      setResetLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
    console.log('Attempting social login with:', provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error('Social login error:', error);
        handleSocialLoginError(provider);
      }
    } catch (err) {
      console.error('Unexpected social login error:', err);
      handleUnexpectedError();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sistema de Gestión Documental</CardTitle>
          <p className="text-gray-600">
            Accede para gestionar plantillas, documentos y firmas digitales
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
              <TabsTrigger value="reset">Recuperar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <LoginForm onSubmit={handleSignIn} loading={loading} />
              <SocialLoginButtons onSocialLogin={handleSocialLogin} />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <SignupForm onSubmit={handleSignUp} loading={loading} />
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              <PasswordResetForm onSubmit={handlePasswordReset} loading={resetLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
