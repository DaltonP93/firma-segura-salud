import { useToast } from '@/hooks/use-toast';

export const useAuthErrorHandler = () => {
  const { toast } = useToast();

  const handleSignInError = (error: any) => {
    console.error('Sign in error:', error);
    let errorMessage = "Error al iniciar sesión";
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña";
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = "Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
    } else if (error.message.includes('Too many requests')) {
      errorMessage = "Demasiados intentos. Espera un momento e intenta de nuevo";
    } else if (error.message.includes('Invalid email')) {
      errorMessage = "El formato del email no es válido";
    }
    
    toast({
      title: "Error al iniciar sesión",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleSignUpError = (error: any) => {
    console.error('Sign up error:', error);
    let errorMessage = "Error al crear la cuenta";
    
    if (error.message.includes('User already registered')) {
      errorMessage = "Este email ya está registrado. Intenta iniciar sesión o usar otro email";
    } else if (error.message.includes('Password should be')) {
      errorMessage = "La contraseña debe tener al menos 6 caracteres";
    } else if (error.message.includes('Invalid email')) {
      errorMessage = "El formato del email no es válido";
    } else if (error.message.includes('Unable to validate email address')) {
      errorMessage = "No se pudo validar la dirección de email";
    } else if (error.message.includes('Email rate limit exceeded')) {
      errorMessage = "Se ha excedido el límite de emails. Intenta de nuevo más tarde";
    }
    
    toast({
      title: "Error al crear cuenta",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handlePasswordResetError = (error: any) => {
    console.error('Password reset error:', error);
    let errorMessage = "Error al enviar email de recuperación";
    
    if (error.message.includes('Email rate limit exceeded')) {
      errorMessage = "Se ha excedido el límite de emails. Intenta de nuevo más tarde";
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleSocialLoginError = (provider: string) => {
    toast({
      title: "Error",
      description: `Error al iniciar sesión con ${provider}`,
      variant: "destructive",
    });
  };

  const handleValidationError = (message: string) => {
    toast({
      title: "Campos requeridos",
      description: message,
      variant: "destructive",
    });
  };

  const handleUnexpectedError = () => {
    toast({
      title: "Error inesperado",
      description: "Ocurrió un error inesperado. Intenta de nuevo",
      variant: "destructive",
    });
  };

  return {
    handleSignInError,
    handleSignUpError,
    handlePasswordResetError,
    handleSocialLoginError,
    handleValidationError,
    handleUnexpectedError,
  };
};