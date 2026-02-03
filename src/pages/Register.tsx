import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuthErrorHandler } from '@/components/auth/AuthErrorHandler';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    handleSignUpError,
    handleValidationError,
    handleUnexpectedError,
  } = useAuthErrorHandler();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
        navigate('/login');
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Crear Cuenta</h1>
            <p className="text-muted-foreground text-sm">
              Regístrate para acceder al sistema
            </p>
          </div>

          {/* Form */}
          <SignupForm onSubmit={handleSignUp} loading={loading} />
          
          {/* Links */}
          <div className="text-center mt-4 text-sm">
            <Link 
              to="/login" 
              className="text-primary hover:underline"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
