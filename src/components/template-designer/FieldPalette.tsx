import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Calendar, 
  List, 
  Hash, 
  Table, 
  CheckSquare, 
  AlignLeft,
  PenTool,
  FileSignature
} from 'lucide-react';
import { FieldType, SignatureRole, FIELD_TYPE_LABELS, SIGNATURE_ROLE_LABELS } from './types';

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
  onAddSignature: (role: SignatureRole) => void;
}

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  select: <List className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  table: <Table className="w-4 h-4" />,
  checkbox: <CheckSquare className="w-4 h-4" />,
  textarea: <AlignLeft className="w-4 h-4" />
};

const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField, onAddSignature }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Campos de Datos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-xs"
              onClick={() => onAddField(type)}
            >
              {FIELD_ICONS[type]}
              {FIELD_TYPE_LABELS[type]}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Áreas de Firma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(SIGNATURE_ROLE_LABELS) as SignatureRole[]).map((role) => (
            <Button
              key={role}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => onAddSignature(role)}
            >
              {role === 'client' ? (
                <PenTool className="w-4 h-4" />
              ) : (
                <FileSignature className="w-4 h-4" />
              )}
              Firma: {SIGNATURE_ROLE_LABELS[role]}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldPalette;
