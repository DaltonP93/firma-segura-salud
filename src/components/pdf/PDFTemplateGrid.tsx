
import { PDFTemplate } from '../PDFTemplateBuilder';
import PDFTemplateCard from './PDFTemplateCard';

interface PDFTemplateGridProps {
  templates: PDFTemplate[];
  onEditTemplate: (template: PDFTemplate) => void;
  onDeleteTemplate: (template: PDFTemplate) => void;
}

const PDFTemplateGrid = ({ templates, onEditTemplate, onDeleteTemplate }: PDFTemplateGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <PDFTemplateCard
          key={template.id}
          template={template}
          onEdit={onEditTemplate}
          onDelete={onDeleteTemplate}
        />
      ))}
    </div>
  );
};

export default PDFTemplateGrid;
