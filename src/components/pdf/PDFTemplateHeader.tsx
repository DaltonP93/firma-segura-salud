
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';

interface PDFTemplateHeaderProps {
  onCreateTemplate: () => void;
}

const PDFTemplateHeader = ({ onCreateTemplate }: PDFTemplateHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl text-primary">Plantillas PDF Interactivas</CardTitle>
        <Button 
          onClick={onCreateTemplate}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Plantilla PDF
        </Button>
      </div>
    </CardHeader>
  );
};

export default PDFTemplateHeader;
