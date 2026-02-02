import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  DesignerElement, 
  DesignerField, 
  DesignerSignatureArea,
  FIELD_TYPE_LABELS,
  SIGNATURE_ROLE_LABELS,
  SIGNATURE_KIND_LABELS,
  AVAILABLE_BINDINGS,
  FieldType,
  SignatureRole,
  SignatureKind
} from './types';

interface PropertiesPanelProps {
  element: DesignerElement | null;
  onUpdate: (element: DesignerElement) => void;
  onDelete: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onUpdate, onDelete }) => {
  if (!element) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecciona un elemento para ver sus propiedades
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleFieldUpdate = (field: keyof DesignerField | keyof DesignerSignatureArea, value: unknown) => {
    onUpdate({
      ...element,
      [field]: value
    } as DesignerElement);
  };

  if (element.type === 'field') {
    const fieldElement = element as DesignerField;
    return (
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Campo: {FIELD_TYPE_LABELS[fieldElement.fieldType]}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(element.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Clave del Campo</Label>
            <Input
              value={fieldElement.fieldKey}
              onChange={(e) => handleFieldUpdate('fieldKey', e.target.value)}
              placeholder="nombre_campo"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Etiqueta</Label>
            <Input
              value={fieldElement.label}
              onChange={(e) => handleFieldUpdate('label', e.target.value)}
              placeholder="Nombre del Campo"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Tipo de Campo</Label>
            <Select
              value={fieldElement.fieldType}
              onValueChange={(value) => handleFieldUpdate('fieldType', value as FieldType)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                  <SelectItem key={type} value={type}>{FIELD_TYPE_LABELS[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Binding (Datos Automáticos)</Label>
            <Select
              value={fieldElement.binding || ''}
              onValueChange={(value) => handleFieldUpdate('binding', value || undefined)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Sin binding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin binding</SelectItem>
                {AVAILABLE_BINDINGS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Placeholder</Label>
            <Input
              value={fieldElement.placeholder || ''}
              onChange={(e) => handleFieldUpdate('placeholder', e.target.value || undefined)}
              placeholder="Texto de ayuda"
              className="h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Ancho</Label>
              <Input
                type="number"
                value={fieldElement.width}
                onChange={(e) => handleFieldUpdate('width', Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Alto</Label>
              <Input
                type="number"
                value={fieldElement.height}
                onChange={(e) => handleFieldUpdate('height', Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Tamaño de Fuente</Label>
            <Input
              type="number"
              value={fieldElement.fontSize}
              onChange={(e) => handleFieldUpdate('fontSize', Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Requerido</Label>
            <Switch
              checked={fieldElement.isRequired}
              onCheckedChange={(checked) => handleFieldUpdate('isRequired', checked)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Signature area properties
  const signatureElement = element as DesignerSignatureArea;
  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Firma: {SIGNATURE_ROLE_LABELS[signatureElement.role]}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(element.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Rol del Firmante</Label>
          <Select
            value={signatureElement.role}
            onValueChange={(value) => handleFieldUpdate('role', value as SignatureRole)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SIGNATURE_ROLE_LABELS) as SignatureRole[]).map((role) => (
                <SelectItem key={role} value={role}>{SIGNATURE_ROLE_LABELS[role]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Tipo de Firma</Label>
          <Select
            value={signatureElement.kind}
            onValueChange={(value) => handleFieldUpdate('kind', value as SignatureKind)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SIGNATURE_KIND_LABELS) as SignatureKind[]).map((kind) => (
                <SelectItem key={kind} value={kind}>{SIGNATURE_KIND_LABELS[kind]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Etiqueta</Label>
          <Input
            value={signatureElement.label || ''}
            onChange={(e) => handleFieldUpdate('label', e.target.value || undefined)}
            placeholder="Firma del Cliente"
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Ancho</Label>
            <Input
              type="number"
              value={signatureElement.width}
              onChange={(e) => handleFieldUpdate('width', Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Alto</Label>
            <Input
              type="number"
              value={signatureElement.height}
              onChange={(e) => handleFieldUpdate('height', Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Requerido</Label>
          <Switch
            checked={signatureElement.isRequired}
            onCheckedChange={(checked) => handleFieldUpdate('isRequired', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertiesPanel;
