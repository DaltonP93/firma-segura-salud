import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';
import type { SalesRequestWithDetails } from './SalesRequestsList';

interface HealthDeclarationPDFGeneratorProps {
  salesRequest: SalesRequestWithDetails;
  healthAnswers: Record<string, any>;
  onGenerate: () => void;
  loading?: boolean;
}

const HealthDeclarationPDFGenerator: React.FC<HealthDeclarationPDFGeneratorProps> = ({
  salesRequest,
  healthAnswers,
  onGenerate,
  loading = false
}) => {
  const generatePDFContent = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Declaración de Salud - ${salesRequest.client_name}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; display: inline-block; width: 150px; }
        .field-value { display: inline-block; }
        .questions { margin-top: 20px; }
        .question { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; }
        .question-number { font-weight: bold; color: #333; }
        .answer { margin-top: 5px; font-weight: bold; }
        .answer.yes { color: #d9534f; }
        .answer.no { color: #5cb85c; }
        .description { margin-top: 5px; padding: 5px; background-color: #f9f9f9; border-left: 3px solid #007bff; }
        .signature-section { margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; }
        .signature-box { border: 1px solid #000; height: 60px; width: 300px; margin: 20px 0; }
        .legal-text { font-size: 10px; margin-top: 20px; padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>DECLARACIÓN DE SALUD</h1>
        <h2>SOLICITUD DE SEGURO DE VIDA</h2>
        <p>Solicitud No: ${salesRequest.request_number}</p>
        <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
    </div>

    <div class="section">
        <div class="section-title">INFORMACIÓN DEL SOLICITANTE</div>
        <div class="field">
            <span class="field-label">Nombre Completo:</span>
            <span class="field-value">${salesRequest.client_name}</span>
        </div>
        <div class="field">
            <span class="field-label">DNI/Cédula:</span>
            <span class="field-value">${salesRequest.client_dni || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Fecha de Nacimiento:</span>
            <span class="field-value">${salesRequest.client_birth_date || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Email:</span>
            <span class="field-value">${salesRequest.client_email}</span>
        </div>
        <div class="field">
            <span class="field-label">Teléfono:</span>
            <span class="field-value">${salesRequest.client_phone || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Dirección:</span>
            <span class="field-value">${salesRequest.client_address || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Ocupación:</span>
            <span class="field-value">N/A</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">INFORMACIÓN DE LA PÓLIZA</div>
        <div class="field">
            <span class="field-label">Tipo de Póliza:</span>
            <span class="field-value">${salesRequest.policy_type}</span>
        </div>
        <div class="field">
            <span class="field-label">Monto de Cobertura:</span>
            <span class="field-value">$${salesRequest.coverage_amount?.toLocaleString() || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Prima Mensual:</span>
            <span class="field-value">$${salesRequest.monthly_premium?.toLocaleString() || 'N/A'}</span>
        </div>
    </div>

    <div class="questions">
        <div class="section-title">CUESTIONARIO DE SALUD</div>
        <p style="margin-bottom: 20px; font-style: italic;">
            Por favor responda todas las preguntas de manera honesta y completa. 
            Una respuesta incorrecta puede resultar en la anulación de la póliza.
        </p>

        ${getQuestionsHTML(healthAnswers)}
    </div>

    <div class="signature-section">
        <div class="section-title">DECLARACIÓN Y FIRMA</div>
        
        <div class="legal-text">
            <p><strong>DECLARACIÓN:</strong></p>
            <p>Declaro que todas las respuestas proporcionadas en esta declaración de salud son 
            verdaderas, completas y precisas al momento de completar este formulario.</p>
            
            <p>Entiendo que cualquier información falsa, incompleta u omitida puede resultar en 
            la anulación de la póliza de seguro o el rechazo de reclamos futuros.</p>
            
            <p>Autorizo a la compañía de seguros a obtener información médica adicional si es 
            necesario para la evaluación de esta solicitud.</p>
            
            <p>He leído y entiendo completamente esta declaración y acepto todos sus términos.</p>
        </div>

        <div style="margin-top: 30px;">
            <div style="display: inline-block; width: 45%; vertical-align: top;">
                <p><strong>Firma del Solicitante:</strong></p>
                <div class="signature-box"></div>
                <p>Nombre: ${salesRequest.client_name}</p>
                <p>Fecha: _______________</p>
            </div>
            
            <div style="display: inline-block; width: 45%; vertical-align: top; margin-left: 10%;">
                <p><strong>Firma del Agente:</strong></p>
                <div class="signature-box"></div>
                <p>Nombre: _______________</p>
                <p>Fecha: _______________</p>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <p><strong>Número de Póliza:</strong> _______________</p>
            <p><strong>Fecha de Emisión:</strong> _______________</p>
        </div>
    </div>
</body>
</html>
    `;

    return content;
  };

  const getQuestionsHTML = (answers: Record<string, any>) => {
    const questions = [
      "¿Padece usted de alguna enfermedad o dolencia actualmente?",
      "¿Ha sido usted hospitalizado, operado o sometido a tratamiento médico en los últimos 5 años?",
      "¿Padece o ha padecido de enfermedades del corazón, arterias, venas o presión arterial?",
      "¿Padece o ha padecido de diabetes, enfermedades de los riñones, hígado o sistema digestivo?",
      "¿Padece o ha padecido de enfermedades del sistema nervioso, mental o psiquiátrico?",
      "¿Padece o ha padecido de cáncer, tumores o enfermedades de la sangre?",
      "¿Padece o ha padecido de enfermedades del sistema respiratorio?",
      "¿Padece o ha padecido de enfermedades de los huesos, músculos o articulaciones?",
      "¿Padece o ha padecido de enfermedades de la piel?",
      "¿Padece o ha padecido de enfermedades de los ojos o problemas de visión?",
      "¿Padece o ha padecido de enfermedades del oído o problemas de audición?",
      "¿Ha tenido algún accidente o lesión importante?",
      "¿Consume tabaco regularmente?",
      "¿Consume alcohol con frecuencia?",
      "¿Practica deportes de riesgo o actividades peligrosas?",
      "¿Tiene antecedentes familiares de enfermedades hereditarias?",
      "¿Está embarazada actualmente?",
      "¿Toma algún medicamento de forma regular?",
      "¿Ha consultado a algún médico en los últimos 12 meses?",
      "¿Ha sido rechazado, modificado o cancelado algún seguro anteriormente?",
      "¿Tiene alguna discapacidad física o mental?",
      "¿Viaja frecuentemente a países de alto riesgo?",
      "¿Trabaja en actividades de alto riesgo?",
      "¿Ha estado en tratamiento psicológico o psiquiátrico?",
      "¿Ha padecido de alguna enfermedad de transmisión sexual?",
      "¿Tiene alguna alergia conocida?",
      "¿Ha tenido problemas con drogas o sustancias controladas?",
      "¿Hay algún otro aspecto de su salud que considere importante mencionar?"
    ];

    return questions.map((question, index) => {
      const questionId = Object.keys(answers).find(key => 
        key.includes(`question_${index + 1}`) || 
        answers[key] !== undefined && !key.includes('_description')
      );
      
      const answer = questionId ? answers[questionId] : 'N/A';
      const descriptionKey = `${questionId}_description`;
      const description = answers[descriptionKey];
      
      return `
        <div class="question">
            <div class="question-number">${index + 1}. ${question}</div>
            <div class="answer ${answer === 'yes' ? 'yes' : answer === 'no' ? 'no' : ''}"}>
                Respuesta: ${answer === 'yes' ? 'SÍ' : answer === 'no' ? 'NO' : answer || 'Sin respuesta'}
            </div>
            ${description ? `<div class="description"><strong>Detalles:</strong> ${description}</div>` : ''}
        </div>
      `;
    }).join('');
  };

  const handleGeneratePDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 100);
      };
    }
    
    onGenerate();
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generando...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Generar PDF
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleGeneratePDF}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Descargar PDF
      </Button>
    </div>
  );
};

export default HealthDeclarationPDFGenerator;