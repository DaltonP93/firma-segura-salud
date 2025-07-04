
import React from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PDFControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  pageNumber: number;
  numPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const PDFControls: React.FC<PDFControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onRotate,
  pageNumber,
  numPages,
  onPrevPage,
  onNextPage
}) => {
  return (
    <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-lg">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
        <Button size="sm" variant="outline" onClick={onZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onRotate}>
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
      
      {numPages > 0 && (
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onPrevPage}
            disabled={pageNumber <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {pageNumber} de {numPages}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onNextPage}
            disabled={pageNumber >= numPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFControls;
