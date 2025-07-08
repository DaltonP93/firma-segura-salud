import React from 'react';
import DocumentViewer from './DocumentViewer';

interface Document {
  id: string;
  document_number: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  template_type?: string;
  policy_type?: string;
  status: string;
  created_at: string;
  signature_request_id?: string;
  total_signers: number;
  completed_signers: number;
}

interface SignatureViewerProps {
  document: Document;
  onClose: () => void;
}

const SignatureViewer = ({ document, onClose }: SignatureViewerProps) => {
  return <DocumentViewer document={document} onClose={onClose} />;
};

export default SignatureViewer;