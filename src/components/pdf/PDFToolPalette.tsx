
import { Button } from "@/components/ui/button";
import { Type, Calendar, Edit } from 'lucide-react';
import { PDFField } from './PDFFieldTypes';

interface PDFToolPaletteProps {
  selectedTool: PDFField['type'] | null;
  onToolSelect: (tool: PDFField['type'] | null) => void;
}

const PDFToolPalette = ({ selectedTool, onToolSelect }: PDFToolPaletteProps) => {
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

  const tools: PDFField['type'][] = ['text', 'textarea', 'email', 'phone', 'date', 'signature'];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Herramientas de Campo</h3>
      <div className="space-y-2">
        {tools.map((tool) => (
          <Button
            key={tool}
            variant={selectedTool === tool ? "default" : "outline"}
            size="sm"
            onClick={() => onToolSelect(tool)}
            className="w-full justify-start"
          >
            {getFieldIcon(tool)}
            <span className="ml-2 capitalize">{tool}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PDFToolPalette;
