
import type { SalesRequestWithDetails } from '@/components/sales/SalesRequestsList';
import type { SalesRequest, Beneficiary } from '@/components/sales/SalesRequestForm';
import type { Notification } from '@/components/notifications/NotificationItem';

export const mockSalesRequest: SalesRequestWithDetails = {
  id: 'test-sales-request-1',
  request_number: 'SR-2024-001',
  client_name: 'Juan Pérez',
  client_email: 'juan.perez@example.com',
  client_phone: '+1234567890',
  client_dni: '12345678',
  client_birth_date: '1990-01-01',
  client_address: 'Calle Falsa 123, Ciudad',
  policy_type: 'life_insurance',
  coverage_amount: 100000,
  monthly_premium: 150,
  status: 'draft',
  notes: 'Solicitud de prueba',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  completed_at: null,
  beneficiaries_count: 2,
};

export const mockSalesRequestForm: SalesRequest = {
  client_name: 'Juan Pérez',
  client_email: 'juan.perez@example.com',
  client_phone: '+1234567890',
  client_dni: '12345678',
  client_birth_date: '1990-01-01',
  client_address: 'Calle Falsa 123, Ciudad',
  policy_type: 'life_insurance',
  insurance_plan_id: 'plan-1',
  client_occupation: 'Ingeniero',
  client_income: 5000,
  client_marital_status: 'single',
  medical_exams_required: false,
  agent_notes: 'Cliente interesado',
  priority_level: 'medium',
  source: 'web',
  notes: 'Notas adicionales',
  status: 'draft',
};

export const mockBeneficiaries: Beneficiary[] = [
  {
    description: 'María Pérez',
    relationship: 'spouse',
    dni: '87654321',
    birth_date: '1992-05-15',
    phone: '+1987654321',
    email: 'maria.perez@example.com',
    price: 50000,
    is_primary: true,
    weight: 65,
    height: 165,
  },
  {
    description: 'Pedro Pérez',
    relationship: 'child',
    dni: '11223344',
    birth_date: '2015-08-20',
    phone: '',
    email: '',
    price: 50000,
    is_primary: false,
    weight: 30,
    height: 120,
  },
];

export const mockNotification: Notification = {
  id: 'notification-1',
  title: 'Nueva Solicitud Creada',
  message: 'Solicitud SR-2024-001 para Juan Pérez ha sido creada',
  time: '2024-01-01 10:00:00',
  read: false,
  type: 'success',
  category: 'document',
  details: 'La solicitud requiere completar la declaración jurada de salud',
  actionUrl: '/sales',
  actionText: 'Ver Solicitud',
};

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'agent',
};
