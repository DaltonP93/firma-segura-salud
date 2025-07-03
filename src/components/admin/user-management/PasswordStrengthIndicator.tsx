
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    special: boolean;
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  let score = 0;
  let label = '';
  let color = '';

  if (password.length === 0) {
    score = 0;
    label = 'Sin contraseña';
    color = 'text-gray-500';
  } else if (metRequirements <= 2) {
    score = 25;
    label = 'Muy débil';
    color = 'text-red-600';
  } else if (metRequirements === 3) {
    score = 50;
    label = 'Débil';
    color = 'text-orange-600';
  } else if (metRequirements === 4) {
    score = 75;
    label = 'Buena';
    color = 'text-yellow-600';
  } else if (metRequirements === 5) {
    score = 100;
    label = 'Excelente';
    color = 'text-green-600';
  }

  return { score, label, color, requirements };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Fortaleza de la contraseña:</span>
        <span className={`text-sm font-medium ${passwordStrength.color}`}>
          {passwordStrength.label}
        </span>
      </div>
      <Progress 
        value={passwordStrength.score} 
        className="h-2"
      />
      
      <div className="space-y-1">
        <div className="text-xs text-gray-600">Requisitos:</div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex items-center gap-2">
            {passwordStrength.requirements.length ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span>Mínimo 8 caracteres</span>
          </div>
          <div className="flex items-center gap-2">
            {passwordStrength.requirements.lowercase ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span>Una letra minúscula</span>
          </div>
          <div className="flex items-center gap-2">
            {passwordStrength.requirements.uppercase ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span>Una letra mayúscula</span>
          </div>
          <div className="flex items-center gap-2">
            {passwordStrength.requirements.numbers ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span>Un número</span>
          </div>
          <div className="flex items-center gap-2">
            {passwordStrength.requirements.special ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span>Un carácter especial</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
