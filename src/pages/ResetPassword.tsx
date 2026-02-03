import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useAuthErrorHandler } from '@/components/auth/AuthErrorHandler';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const {
    handlePasswordResetError,
    handleValidationError,
    handleUnexpectedError,
  } = useAuthErrorHandler();

  const handlePasswordReset = async (resetEmail: string) => {
    if (!resetEmail) {
      handleValidationError("Por favor ingresa tu email");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="pt-8 pb-8 px-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-foreground" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar Contraseña</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tu email para recibir un enlace de recuperación
            </p>
          </div>

          {/* Form */}
          <PasswordResetForm onSubmit={handlePasswordReset} loading={loading} />
          
          {/* Links */}
          <div className="text-center mt-4 text-sm">
            <Link 
              to="/login" 
              className="text-primary hover:underline"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
