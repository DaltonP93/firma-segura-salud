import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import FieldPalette from './FieldPalette';
import PropertiesPanel from './PropertiesPanel';
import DesignerCanvas from './DesignerCanvas';
import { 
  DesignerElement, 
  DesignerField, 
  DesignerSignatureArea, 
  FieldType, 
  SignatureRole 
} from './types';
import { templateDesignerService, TemplateFieldConfig, SignatureArea } from '@/services/templateDesignerService';

interface TemplateDesignerProps {
  templateId: string;
  templateName: string;
  initialPdfUrl?: string;
  versionId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const TemplateDesigner: React.FC<TemplateDesignerProps> = ({
  templateId,
  templateName,
  initialPdfUrl,
  versionId,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl || null);
  const [elements, setElements] = useState<DesignerElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing design if versionId is provided
  useEffect(() => {
    const loadDesign = async () => {
      if (!versionId) {
        setIsLoading(false);
        return;
      }

      try {
        const { fields, signatureAreas } = await templateDesignerService.loadDesign(versionId);
        
        const loadedElements: DesignerElement[] = [
          ...fields.map((f): DesignerField => ({
            id: f.id,
            type: 'field',
            fieldType: f.field_type as FieldType,
            fieldKey: f.field_key,
            label: f.label,
            binding: f.binding || undefined,
            validation: f.validation as Record<string, unknown>,
            options: f.options as unknown[],
            defaultValue: f.default_value || undefined,
            placeholder: f.placeholder || undefined,
            page: f.page,
            x: Number(f.x),
            y: Number(f.y),
            width: Number(f.width),
            height: Number(f.height),
            fontSize: f.font_size,
            isRequired: f.is_required
          })),
          ...signatureAreas.map((s): DesignerSignatureArea => ({
            id: s.id,
            type: 'signature',
            role: s.role,
            kind: s.kind,
            label: s.label || undefined,
            page: s.page,
            x: Number(s.x),
            y: Number(s.y),
            width: Number(s.width),
            height: Number(s.height),
            isRequired: s.is_required
          }))
        ];

        setElements(loadedElements);
      } catch (error) {
        console.error('Error loading design:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el diseño existente",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDesign();
  }, [versionId, toast]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  }, []);

  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddField = useCallback((type: FieldType) => {
    const newField: DesignerField = {
      id: generateId(),
      type: 'field',
      fieldType: type,
      fieldKey: `campo_${elements.length + 1}`,
      label: `Campo ${elements.length + 1}`,
      page: currentPage,
      x: 50,
      y: 50 + (elements.filter(e => e.page === currentPage).length * 40),
      width: 150,
      height: 30,
      fontSize: 12,
      isRequired: true
    };
    setElements(prev => [...prev, newField]);
    setSelectedElementId(newField.id);
  }, [currentPage, elements.length]);

  const handleAddSignature = useCallback((role: SignatureRole) => {
    const newSignature: DesignerSignatureArea = {
      id: generateId(),
      type: 'signature',
      role,
      kind: 'electronic',
      page: currentPage,
      x: 50,
      y: 400 + (elements.filter(e => e.page === currentPage && e.type === 'signature').length * 80),
      width: 200,
      height: 60,
      isRequired: true
    };
    setElements(prev => [...prev, newSignature]);
    setSelectedElementId(newSignature.id);
  }, [currentPage, elements]);

  const handleUpdateElement = useCallback((updatedElement: DesignerElement) => {
    setElements(prev => 
      prev.map(el => el.id === updatedElement.id ? updatedElement : el)
    );
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElementId(null);
  }, []);

  const handleSave = async () => {
    if (!versionId) {
      toast({
        title: "Error",
        description: "No hay versión de plantilla seleccionada",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const fields: Omit<TemplateFieldConfig, 'id'>[] = elements
        .filter((el): el is DesignerField => el.type === 'field')
        .map((f, index) => ({
          template_version_id: versionId,
          field_key: f.fieldKey,
          label: f.label,
          field_type: f.fieldType,
          binding: f.binding || null,
          validation: f.validation || {},
          options: f.options || [],
          default_value: f.defaultValue || null,
          placeholder: f.placeholder || null,
          page: f.page,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          font_size: f.fontSize,
          is_required: f.isRequired,
          sort_order: index
        }));

      const signatureAreas: Omit<SignatureArea, 'id'>[] = elements
        .filter((el): el is DesignerSignatureArea => el.type === 'signature')
        .map((s, index) => ({
          template_version_id: versionId,
          role: s.role,
          kind: s.kind,
          page: s.page,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          is_required: s.isRequired,
          label: s.label || null,
          sort_order: index
        }));

      await templateDesignerService.saveDesign(versionId, fields, signatureAreas);

      toast({
        title: "Diseño Guardado",
        description: "Los cambios han sido guardados exitosamente"
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el diseño",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cargando diseño...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Diseñador de Plantilla</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{templateName}</p>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Diseño'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Field Palette */}
        <div className="col-span-2">
          <FieldPalette
            onAddField={handleAddField}
            onAddSignature={handleAddSignature}
          />
        </div>

        {/* Center - Canvas */}
        <div className="col-span-7">
          {/* PDF Upload */}
          {!pdfUrl && (
            <Card className="mb-4">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="pdf-upload" className="text-sm font-medium">
                      Subir PDF Base
                    </Label>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Page Navigation */}
          {pdfUrl && (
            <div className="flex items-center justify-center gap-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <DesignerCanvas
            pdfUrl={pdfUrl}
            elements={elements}
            selectedElementId={selectedElementId}
            currentPage={currentPage}
            zoom={zoom}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onZoomChange={setZoom}
          />
        </div>

        {/* Right Panel - Properties */}
        <div className="col-span-3">
          <PropertiesPanel
            element={selectedElement}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateDesigner;
