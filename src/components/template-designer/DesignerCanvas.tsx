import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';
import { DesignerElement, DesignerField, DesignerSignatureArea, FIELD_TYPE_LABELS, SIGNATURE_ROLE_LABELS } from './types';
import PDFViewer from '@/components/PDFViewer';

interface DesignerCanvasProps {
  pdfUrl: string | null;
  elements: DesignerElement[];
  selectedElementId: string | null;
  currentPage: number;
  zoom: number;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (element: DesignerElement) => void;
  onZoomChange: (zoom: number) => void;
}

const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
  pdfUrl,
  elements,
  selectedElementId,
  currentPage,
  zoom,
  onSelectElement,
  onUpdateElement,
  onZoomChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<DesignerElement | null>(null);

  // Filter elements for current page
  const pageElements = elements.filter(el => el.page === currentPage);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: DesignerElement) => {
    e.stopPropagation();
    e.preventDefault();
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedElement(element);
    setIsDragging(true);
    onSelectElement(element.id);
  }, [onSelectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedElement || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = (e.clientX - containerRect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - containerRect.top - dragOffset.y) / zoom;

    onUpdateElement({
      ...draggedElement,
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    });
  }, [isDragging, draggedElement, dragOffset, zoom, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedElement(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('pdf-container')) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  const getElementStyle = (element: DesignerElement): React.CSSProperties => {
    const isSelected = element.id === selectedElementId;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x * zoom,
      top: element.y * zoom,
      width: element.width * zoom,
      height: element.height * zoom,
      cursor: isDragging && draggedElement?.id === element.id ? 'grabbing' : 'grab',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${10 * zoom}px`,
      overflow: 'hidden',
      userSelect: 'none',
      zIndex: isSelected ? 100 : 10,
      transition: isDragging ? 'none' : 'box-shadow 0.2s'
    };

    if (element.type === 'field') {
      return {
        ...baseStyle,
        backgroundColor: isSelected ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--primary) / 0.15)',
        border: isSelected ? '2px solid hsl(var(--primary))' : '1px dashed hsl(var(--primary) / 0.5)',
        color: 'hsl(var(--primary-foreground))'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: isSelected ? 'hsl(var(--accent) / 0.4)' : 'hsl(var(--accent) / 0.2)',
        border: isSelected ? '2px solid hsl(var(--accent-foreground))' : '1px dashed hsl(var(--accent-foreground) / 0.5)',
        color: 'hsl(var(--accent-foreground))'
      };
    }
  };

  const getElementLabel = (element: DesignerElement): string => {
    if (element.type === 'field') {
      const field = element as DesignerField;
      return field.label || FIELD_TYPE_LABELS[field.fieldType];
    } else {
      const sig = element as DesignerSignatureArea;
      return sig.label || `Firma: ${SIGNATURE_ROLE_LABELS[sig.role]}`;
    }
  };

  return (
    <div className="space-y-2">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Move className="w-4 h-4" />
          Arrastra los elementos para posicionarlos
        </div>
      </div>

      {/* Canvas */}
      <Card className="overflow-auto max-h-[600px] bg-muted/20">
        <div
          ref={containerRef}
          className="relative min-h-[600px] pdf-container"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {pdfUrl ? (
            <div className="relative">
              <PDFViewer
                file={pdfUrl}
                width={800 * zoom}
                className="pointer-events-none"
              />
              
              {/* Elements Overlay */}
              {pageElements.map((element) => (
                <div
                  key={element.id}
                  style={getElementStyle(element)}
                  onMouseDown={(e) => handleMouseDown(e, element)}
                >
                  <span className="truncate px-1 text-xs font-medium">
                    {getElementLabel(element)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
              <p>Sube un PDF para comenzar a diseñar la plantilla</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DesignerCanvas;
