
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Type, Calendar, Edit } from 'lucide-react';
import type { PDFField } from '../pdf/PDFFieldTypes';

interface DocumentFieldsFormProps {
  fields: PDFField[];
  fieldValues: Record<string, string>;
  onFieldValueChange: (fieldId: string, value: string) => void;
}

const DocumentFieldsForm = ({ fields, fieldValues, onFieldValueChange }: DocumentFieldsFormProps) => {
  const getFieldIcon = (type: PDFField['type']) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'textarea': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'signature': return <Edit className="w-4 h-4" />;
      case 'email': return <Type className="w-4 h-4" />;
      case 'phone': return <Type className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const renderField = (field: PDFField) => {
    const value = fieldValues[field.id] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onFieldValueChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onFieldValueChange(field.id, e.target.value)}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => onFieldValueChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'phone':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => onFieldValueChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Edit className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Click para firmar</p>
          </div>
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onFieldValueChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Campos del Documento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.id}>
              <Label className="flex items-center gap-2">
                {getFieldIcon(field.type)}
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentFieldsForm;
