
# Plan de Implementación Integral: Sistema de Ventas y Firma Digital

## Resumen Ejecutivo

Este plan implementa el diseño completo propuesto por Copilot para transformar el sistema actual en una solución integral de gestión de ventas de seguros con firma electrónica, siguiendo el flujo: **Venta → Datos → Plan → Documentos → Firma → Cierre**.

---

## Análisis del Estado Actual

### Lo que YA existe:
- Sistema de autenticación con roles (admin/user)
- Gestión de ventas (`sales_requests`) con beneficiarios
- Declaración de salud (`health_declarations`)
- Plantillas PDF (`pdf_templates`) con campos
- Sistema de firma electrónica (`signature_requests`, `signers`, `signature_fields`)
- Edge functions para WhatsApp y Email
- Storage buckets configurados
- Portal público de firma (`/sign/:token`)

### Lo que FALTA según el diseño de Copilot:

1. **Modelo de Datos Extendido:**
   - `template_versions` - Versionado de plantillas
   - `signature_areas` - Áreas de firma por rol con posicionamiento
   - `template_fields` - Campos con binding a datos y validaciones
   - Vinculación de documentos a ventas (`sale_id` en documents)

2. **Diseñador Visual de Templates:**
   - Canvas interactivo con Fabric.js para arrastrar campos
   - Posicionamiento preciso de áreas de firma (electrónica/digital)
   - Vista previa del PDF con PDF.js
   - Serialización de posiciones a JSON

3. **Flujo de Vendedor Completo:**
   - Prefill de plantillas con datos de la venta
   - Generación de PDF real (no solo texto)
   - Selección de documentos a enviar
   - Marcar "Listo para Firma"
   - Enlaces WhatsApp listos para copiar

4. **Máquina de Estados del Documento:**
   - draft → ready → sent → partially_signed → signed / expired / void

5. **Generación Real de PDFs:**
   - Edge function para renderizar HTML/templates a PDF

---

## Plan de Implementación por Fases

### Fase 1: Extensión del Modelo de Datos (Prioridad Alta)

#### 1.1 Nuevas Tablas de Base de Datos

```text
template_versions
├── id (uuid, PK)
├── template_id (uuid, FK → pdf_templates)
├── version (int)
├── storage_key (text) - archivo base
├── engine_opts (jsonb) - opciones de render
├── created_at, is_active

signature_areas
├── id (uuid, PK)
├── template_version_id (uuid, FK)
├── role (text) - cliente|vendedor|testigo
├── kind (text) - electronic|digital
├── page (int)
├── x, y, width, height (numeric)
├── is_required (boolean)

template_fields_config
├── id (uuid, PK)
├── template_version_id (uuid, FK)
├── key (text) - nombre variable
├── label (text)
├── type (text) - text|date|select|table
├── binding (text) - ej: "client.name", "beneficiaries[0].dni"
├── validation (jsonb)
├── options (jsonb)
├── x, y, width, height, page (numeric)
```

#### 1.2 Modificaciones a Tablas Existentes

- `documents`: Agregar `sale_id` (FK → sales_requests), `sha256_hex`, `ready_for_sign`, `generated_at`
- `pdf_templates`: Agregar `engine` (hbs|docx|pdfbase)
- `sales_requests`: Agregar estados adicionales: `ready`, `sent`, `partially_signed`, `expired`, `void`

---

### Fase 2: Diseñador Visual de Templates (Prioridad Alta)

#### 2.1 Componentes del Editor

```text
src/components/template-designer/
├── TemplateDesigner.tsx        - Contenedor principal
├── DesignerCanvas.tsx          - Canvas con Fabric.js
├── FieldPalette.tsx            - Paleta de campos arrastrables
├── SignatureAreaTool.tsx       - Herramienta de áreas de firma
├── PropertiesPanel.tsx         - Panel de propiedades del campo
├── VersionManager.tsx          - Gestión de versiones
├── BindingSelector.tsx         - Selector de binding a datos
└── PreviewMode.tsx             - Vista previa con datos reales
```

#### 2.2 Funcionalidades del Diseñador

- **Visualización PDF:** Usar PDF.js para mostrar el PDF base
- **Canvas Interactivo:** Fabric.js sobre el PDF para drag & drop
- **Tipos de Campos:**
  - Texto (con binding a datos)
  - Fecha
  - Select (opciones configurables)
  - Tabla (para beneficiarios)
  - Área de Firma (electrónica o digital)
- **Serialización:** Guardar posiciones x, y, width, height, page en JSON

---

### Fase 3: Flujo de Vendedor Mejorado (Prioridad Alta)

#### 3.1 Nuevo Componente de Detalle de Venta

```text
src/components/sales/SalesRequestDetail/
├── index.tsx                    - Layout principal con tabs
├── ClientInfoTab.tsx            - Datos del titular
├── BeneficiariesTab.tsx         - Lista de beneficiarios
├── PlanSelectionTab.tsx         - Selección de plan de seguro
├── DocumentsTab.tsx             - Templates seleccionados y generados
├── PrefillPanel.tsx             - Formulario de prefill por documento
├── DocumentActionsBar.tsx       - Render, Vista previa, Listo para firma
├── SendingPanel.tsx             - Selección de docs + envío
└── AuditTimeline.tsx            - Historial de eventos
```

#### 3.2 Funcionalidad de Prefill

- Generar formulario automático basado en `template_fields_config`
- Prellenar campos con datos de `sales_request` y `beneficiaries`
- Validar campos antes de permitir generación
- Guardar valores en `document.metadata`

---

### Fase 4: Generación Real de PDFs (Prioridad Alta)

#### 4.1 Edge Function para Render

```text
supabase/functions/render-document/
├── index.ts                     - Handler principal
├── pdfRenderer.ts               - Lógica de generación
└── templateEngine.ts            - Procesamiento Handlebars
```

**Proceso:**
1. Recibir `template_version_id` + `field_values`
2. Cargar template base desde Storage
3. Procesar con Handlebars (HTML) o manipular PDF
4. Generar PDF final
5. Calcular SHA-256
6. Subir a Storage (bucket: `documents`)
7. Actualizar documento con `storage_key` y `sha256_hex`

#### 4.2 Librería de PDF para Deno

- Usar `pdf-lib` para manipulación de PDF en Edge Functions
- Agregar campos de texto sobre el PDF base
- Colocar placeholders para firmas

---

### Fase 5: Sistema de Firma Mejorado (Prioridad Media)

#### 5.1 Mejoras al Portal de Firma

- Mostrar el PDF real con PDF.js
- Posicionar campos de firma exactamente donde se definieron
- Captura de firma en canvas posicionado
- Validación de campos requeridos

#### 5.2 Evidencia y Certificado

```text
src/components/signature/
├── SigningInterface.tsx         - (existente, mejorar)
├── SignatureCertificate.tsx     - Generador de certificado
├── AuditEvidence.tsx            - Visualización de evidencias
└── SignatureVerifier.tsx        - Verificación de firmas
```

**Datos de Evidencia:**
- IP, User Agent, Timestamp
- Hash SHA-256 del documento
- Coordenadas de firma
- Captura de consentimiento

---

### Fase 6: Integración WhatsApp Mejorada (Prioridad Media)

#### 6.1 Helper de Enlaces

```typescript
// src/utils/whatsappHelper.ts
export function buildWhatsAppLinks(phoneIntl: string, message: string) {
  const enc = encodeURIComponent(message);
  return {
    waMe: `https://wa.me/${phoneIntl}?text=${enc}`,
    waApi: `https://api.whatsapp.com/send?phone=${phoneIntl}&text=${enc}`
  };
}
```

#### 6.2 Componente "Copiar Link WhatsApp"

- Mostrar mensaje prellenado con variables
- Botón de copiar link
- Opción de abrir WhatsApp Web

---

## Secuencia de Implementación

### Sprint 1 (Semana 1-2): Fundación
1. Crear migraciones para nuevas tablas
2. Modificar tablas existentes
3. Actualizar tipos TypeScript

### Sprint 2 (Semana 3-4): Diseñador de Templates
1. Instalar Fabric.js
2. Crear componentes del diseñador
3. Implementar serialización/deserialización

### Sprint 3 (Semana 5-6): Flujo de Vendedor
1. Refactorizar SalesRequestDetail
2. Implementar prefill de templates
3. Edge function de render PDF

### Sprint 4 (Semana 7-8): Firma y Envío
1. Mejorar portal de firma
2. Integración WhatsApp con links listos
3. Generación de certificados

---

## Detalles Técnicos

### Dependencias Nuevas Requeridas

```json
{
  "fabric": "^5.3.0",
  "pdfjs-dist": "^3.11.174"
}
```

### Estructura de Archivos Nuevos

```text
src/
├── components/
│   ├── template-designer/
│   │   ├── TemplateDesigner.tsx
│   │   ├── DesignerCanvas.tsx
│   │   ├── FieldPalette.tsx
│   │   ├── SignatureAreaTool.tsx
│   │   └── PropertiesPanel.tsx
│   └── sales/
│       └── SalesRequestDetail/
│           ├── index.tsx
│           ├── DocumentsTab.tsx
│           ├── PrefillPanel.tsx
│           └── SendingPanel.tsx
├── utils/
│   └── whatsappHelper.ts
└── services/
    └── pdfGenerationService.ts

supabase/functions/
└── render-document/
    └── index.ts
```

### Migraciones de Base de Datos

**Migración 1: template_versions**
```sql
CREATE TABLE public.template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES pdf_templates(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  storage_key text,
  engine_opts jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Migración 2: signature_areas**
```sql
CREATE TABLE public.signature_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_version_id uuid REFERENCES template_versions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'vendor', 'witness')),
  kind text NOT NULL CHECK (kind IN ('electronic', 'digital')),
  page integer DEFAULT 1,
  x numeric NOT NULL,
  y numeric NOT NULL,
  width numeric NOT NULL,
  height numeric NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Migración 3: Extensiones a documents**
```sql
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS sale_id uuid REFERENCES sales_requests(id),
ADD COLUMN IF NOT EXISTS sha256_hex text,
ADD COLUMN IF NOT EXISTS ready_for_sign boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS generated_at timestamptz;
```

---

## Resultado Esperado

Al completar este plan, el sistema permitirá:

1. **Vendedor:** Crear venta → Seleccionar plan → Agregar beneficiarios → Seleccionar templates → Prerellenar campos → Generar PDFs → Marcar "Listo" → Copiar link WhatsApp

2. **Cliente:** Recibir link por WhatsApp → Abrir portal de firma → Ver documento PDF → Completar campos → Firmar → Recibir confirmación

3. **Sistema:** Generar certificado de firma → Actualizar estados → Registrar auditoría → Notificar a vendedor
