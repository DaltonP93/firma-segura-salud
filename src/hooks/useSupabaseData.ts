
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Contract, Template } from '@/pages/Index';
import { PDFTemplate } from '@/components/PDFTemplateBuilder';
import { documentsService } from '@/services/documentsService';
import { templatesService } from '@/services/templatesService';
import { pdfTemplatesService } from '@/services/pdfTemplatesService';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pdfTemplates, setPdfTemplates] = useState<PDFTemplate[]>([]);

  // Fetch all data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchDocuments(),
        fetchTemplates(),
        fetchPDFTemplates(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const documents = await documentsService.fetchDocuments();
      setContracts(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const templates = await templatesService.fetchTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchPDFTemplates = async () => {
    try {
      const pdfTemplates = await pdfTemplatesService.fetchPDFTemplates();
      setPdfTemplates(pdfTemplates);
    } catch (error) {
      console.error('Error fetching PDF templates:', error);
    }
  };

  const createDocument = async (contractData: Omit<Contract, 'id' | 'status' | 'createdAt'>) => {
    if (!user) return;

    try {
      const data = await documentsService.createDocument(contractData, user.id);
      await fetchDocuments();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el documento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDocumentStatus = async (contractId: string, status: Contract['status'], additionalData?: Partial<Contract>) => {
    try {
      await documentsService.updateDocumentStatus(contractId, status);
      await fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el documento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createTemplate = async (template: Omit<Template, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      await templatesService.createTemplate(template, user.id);
      await fetchTemplates();
      toast({
        title: "Plantilla Creada",
        description: `La plantilla "${template.name}" ha sido creada exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la plantilla",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createPDFTemplate = async (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await pdfTemplatesService.createPDFTemplate(template, user.id);
      await fetchPDFTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePDFTemplate = async (templateId: string, updates: Partial<PDFTemplate>) => {
    try {
      await pdfTemplatesService.updatePDFTemplate(templateId, updates);
      await fetchPDFTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePDFTemplate = async (templateId: string) => {
    try {
      await pdfTemplatesService.deletePDFTemplate(templateId);
      await fetchPDFTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la plantilla PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    loading,
    contracts,
    templates,
    pdfTemplates,
    createDocument,
    updateDocumentStatus,
    createTemplate,
    createPDFTemplate,
    updatePDFTemplate,
    deletePDFTemplate,
    refetch: fetchAllData,
  };
};
