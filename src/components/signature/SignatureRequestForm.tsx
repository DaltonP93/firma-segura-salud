import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText } from 'lucide-react';

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
}

interface Signer {
  name: string;
  email: string;
  phone?: string;
  role: 'signer' | 'beneficiary' | 'witness' | 'representative';
}

interface SignatureField {
  field_type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  page_number: number;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  is_required: boolean;
  placeholder_text?: string;
}

interface SignatureRequestData {
  title: string;
  message?: string;
  expiresAt?: Date;
  signers: Signer[];
  signatureFields: SignatureField[];
}

interface SignatureRequestFormProps {
  documents: Document[];
  onSubmit: (documentId: string, requestData: SignatureRequestData) => void;
  onCancel: () => void;
}

const SignatureRequestForm = ({ documents, onSubmit, onCancel }: SignatureRequestFormProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [signers, setSigners] = useState<Signer[]>([]);
  const [newSigner, setNewSigner] = useState<Signer>({
    name: '',
    email: '',
    phone: '',
    role: 'signer'
  });

  const availableDocuments = documents.filter(doc => !doc.signature_request_id);
  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  const handleAddSigner = () => {
    if (newSigner.name && newSigner.email) {
      setSigners([...signers, newSigner]);
      setNewSigner({ name: '', email: '', phone: '', role: 'signer' });
    }
  };

  const handleRemoveSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocumentId || !title || signers.length === 0) {
      return;
    }

    // Create default signature fields for each signer
    const signatureFields: SignatureField[] = signers.map((_, index) => ({
      field_type: 'signature',
      page_number: 1,
      x_position: 50 + (index * 200), // Spread signatures horizontally
      y_position: 700, // Bottom of page
      width: 150,
      height: 50,
      is_required: true,
      placeholder_text: `Firma de ${signers[index].name}`
    }));

    const requestData: SignatureRequestData = {
      title,
      message: message || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      signers,
      signatureFields
    };

    onSubmit(selectedDocumentId, requestData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Crear Nueva Solicitud de Firma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Selection */}
          <div className="space-y-2">
            <Label htmlFor="document">Seleccionar Documento</Label>
            <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un documento" />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.document_number} - {doc.client_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDocument && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm"><strong>Cliente:</strong> {selectedDocument.client_name}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedDocument.client_email}</p>
                <p className="text-sm"><strong>Tipo:</strong> {selectedDocument.template_type}</p>
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Solicitud</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Firma de Contrato de Seguro"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Fecha de Expiración (Opcional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje Personalizado (Opcional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensaje que se enviará a los firmantes..."
              rows={3}
            />
          </div>

          {/* Signers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Firmantes</Label>
              <Badge variant="secondary">{signers.length} firmante(s)</Badge>
            </div>

            {/* Add New Signer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-md">
              <Input
                placeholder="Nombre completo"
                value={newSigner.name}
                onChange={(e) => setNewSigner({ ...newSigner, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newSigner.email}
                onChange={(e) => setNewSigner({ ...newSigner, email: e.target.value })}
              />
              <Input
                placeholder="Teléfono (opcional)"
                value={newSigner.phone}
                onChange={(e) => setNewSigner({ ...newSigner, phone: e.target.value })}
              />
              <div className="flex gap-2">
                <Select 
                  value={newSigner.role} 
                  onValueChange={(value: any) => setNewSigner({ ...newSigner, role: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signer">Firmante</SelectItem>
                    <SelectItem value="beneficiary">Beneficiario</SelectItem>
                    <SelectItem value="witness">Testigo</SelectItem>
                    <SelectItem value="representative">Representante</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddSigner} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Signers List */}
            {signers.length > 0 && (
              <div className="space-y-2">
                {signers.map((signer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{signer.name}</p>
                      <p className="text-sm text-muted-foreground">{signer.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {signer.role === 'signer' && 'Firmante'}
                        {signer.role === 'beneficiary' && 'Beneficiario'}
                        {signer.role === 'witness' && 'Testigo'}
                        {signer.role === 'representative' && 'Representante'}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSigner(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedDocumentId || !title || signers.length === 0}
            >
              Crear Solicitud de Firma
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignatureRequestForm;