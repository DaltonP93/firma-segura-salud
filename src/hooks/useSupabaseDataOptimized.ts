
import { useContracts } from './useContracts';
import { useTemplates } from './useTemplates';
import { usePDFTemplates } from './usePDFTemplates';

export const useSupabaseDataOptimized = () => {
  const contracts = useContracts();
  const templates = useTemplates();
  const pdfTemplates = usePDFTemplates();

  const loading = contracts.loading || templates.loading || pdfTemplates.loading;

  const refetchAll = async () => {
    await Promise.all([
      contracts.refetch(),
      templates.refetch(),
      pdfTemplates.refetch(),
    ]);
  };

  console.log('useSupabaseDataOptimized returning:', {
    loading,
    contracts: contracts.contracts.length,
    templates: templates.templates.length,
    pdfTemplates: pdfTemplates.pdfTemplates.length
  });

  return {
    // Contracts
    contracts: contracts.contracts,
    createDocument: contracts.createDocument,
    updateDocumentStatus: contracts.updateDocumentStatus,
    
    // Templates
    templates: templates.templates,
    createTemplate: templates.createTemplate,
    
    // PDF Templates
    pdfTemplates: pdfTemplates.pdfTemplates,
    createPDFTemplate: pdfTemplates.createPDFTemplate,
    updatePDFTemplate: pdfTemplates.updatePDFTemplate,
    deletePDFTemplate: pdfTemplates.deletePDFTemplate,
    
    // General
    loading,
    refetch: refetchAll,
  };
};
