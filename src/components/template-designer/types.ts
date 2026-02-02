export type FieldType = 'text' | 'date' | 'select' | 'number' | 'table' | 'checkbox' | 'textarea';
export type SignatureRole = 'client' | 'vendor' | 'witness';
export type SignatureKind = 'electronic' | 'digital';

export interface DesignerField {
  id: string;
  type: 'field';
  fieldType: FieldType;
  fieldKey: string;
  label: string;
  binding?: string;
  validation?: Record<string, unknown>;
  options?: unknown[];
  defaultValue?: string;
  placeholder?: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isRequired: boolean;
}

export interface DesignerSignatureArea {
  id: string;
  type: 'signature';
  role: SignatureRole;
  kind: SignatureKind;
  label?: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isRequired: boolean;
}

export type DesignerElement = DesignerField | DesignerSignatureArea;

export interface CanvasState {
  elements: DesignerElement[];
  selectedElementId: string | null;
  currentPage: number;
  zoom: number;
  pdfUrl: string | null;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texto',
  date: 'Fecha',
  select: 'Selección',
  number: 'Número',
  table: 'Tabla',
  checkbox: 'Casilla',
  textarea: 'Área de texto'
};

export const SIGNATURE_ROLE_LABELS: Record<SignatureRole, string> = {
  client: 'Cliente',
  vendor: 'Vendedor',
  witness: 'Testigo'
};

export const SIGNATURE_KIND_LABELS: Record<SignatureKind, string> = {
  electronic: 'Electrónica',
  digital: 'Digital (PAdES)'
};

// Data bindings disponibles para prellenar campos
export const AVAILABLE_BINDINGS = [
  { value: 'client.name', label: 'Nombre del Cliente' },
  { value: 'client.dni', label: 'DNI/Cédula' },
  { value: 'client.email', label: 'Email' },
  { value: 'client.phone', label: 'Teléfono' },
  { value: 'client.address', label: 'Dirección' },
  { value: 'client.birth_date', label: 'Fecha de Nacimiento' },
  { value: 'client.occupation', label: 'Ocupación' },
  { value: 'client.marital_status', label: 'Estado Civil' },
  { value: 'plan.name', label: 'Nombre del Plan' },
  { value: 'plan.coverage_amount', label: 'Monto de Cobertura' },
  { value: 'plan.monthly_premium', label: 'Prima Mensual' },
  { value: 'request.number', label: 'Número de Solicitud' },
  { value: 'request.date', label: 'Fecha de Solicitud' },
  { value: 'beneficiaries', label: 'Lista de Beneficiarios' },
  { value: 'current_date', label: 'Fecha Actual' }
];
