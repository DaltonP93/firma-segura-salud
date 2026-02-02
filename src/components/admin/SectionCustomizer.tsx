import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Settings } from 'lucide-react';

const SectionCustomizer = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalización de Secciones</h2>
          <p className="text-muted-foreground">Configura la apariencia de cada sección de la aplicación</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          La personalización de secciones individuales estará disponible en una próxima actualización.
          Por ahora, puedes usar la pestaña "Personalización" para configurar la apariencia general de la aplicación.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Secciones Disponibles
          </CardTitle>
          <CardDescription>
            Lista de secciones que podrás personalizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'dashboard', title: 'Dashboard', description: 'Panel principal con estadísticas' },
              { key: 'templates', title: 'Plantillas', description: 'Gestión de plantillas de documentos' },
              { key: 'pdf-templates', title: 'Plantillas PDF', description: 'Plantillas PDF personalizables' },
              { key: 'pdf-generator', title: 'Generador PDF', description: 'Crear documentos PDF' },
              { key: 'contracts', title: 'Contratos', description: 'Generar nuevos contratos' },
              { key: 'documents', title: 'Documentos', description: 'Gestión de documentos' },
              { key: 'sales', title: 'Ventas', description: 'Gestión de solicitudes de venta' },
              { key: 'signatures', title: 'Firmas', description: 'Firmas electrónicas' },
            ].map((section) => (
              <div key={section.key} className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionCustomizer;