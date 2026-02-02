# Plan de Implementación Integral: Sistema de Ventas y Firma Digital

## Estado: En Progreso 🚧

---

## ✅ Fase 1: Extensión del Modelo de Datos (COMPLETADO)

### Nuevas Tablas Creadas:
- ✅ `template_versions` - Versionado de plantillas con storage_key y engine_opts
- ✅ `signature_areas` - Áreas de firma con posicionamiento (x, y, width, height, page)
- ✅ `template_fields_config` - Campos con binding a datos y validaciones

### Modificaciones a Tablas Existentes:
- ✅ `documents`: Agregados `sale_id`, `sha256_hex`, `ready_for_sign`, `generated_at`, `template_version_id`, `field_values`
- ✅ `pdf_templates`: Agregada columna `engine` (hbs|docx|pdfbase)

### Índices y RLS:
- ✅ Índices optimizados para búsquedas frecuentes
- ✅ Políticas RLS habilitadas en todas las tablas nuevas
- ✅ Trigger automático para crear versión inicial de template

---

## ✅ Fase 2: Diseñador Visual de Templates (COMPLETADO)

### Componentes Creados:
- ✅ `src/components/template-designer/TemplateDesigner.tsx` - Contenedor principal
- ✅ `src/components/template-designer/DesignerCanvas.tsx` - Canvas interactivo para drag & drop
- ✅ `src/components/template-designer/FieldPalette.tsx` - Paleta de campos arrastrables
- ✅ `src/components/template-designer/PropertiesPanel.tsx` - Panel de propiedades
- ✅ `src/components/template-designer/types.ts` - Tipos y constantes
- ✅ `src/pages/TemplateDesignerPage.tsx` - Página del diseñador

### Servicios:
- ✅ `src/services/templateDesignerService.ts` - CRUD para versiones, campos y áreas de firma

### Rutas:
- ✅ `/template-designer/:templateId` - Ruta protegida para el diseñador

### Funcionalidades:
- ✅ Visualización de PDF base
- ✅ Drag & drop de campos sobre el PDF
- ✅ Tipos de campos: texto, fecha, select, número, tabla, checkbox, textarea
- ✅ Áreas de firma: electrónica y digital por rol (cliente, vendedor, testigo)
- ✅ Zoom y navegación de páginas
- ✅ Binding a datos automáticos (cliente, beneficiarios, plan)
- ✅ Serialización/deserialización de diseño

---

## ✅ Fase 3: Flujo de Vendedor Mejorado (COMPLETADO)

### Componentes de Detalle de Venta Refactorizados:
- ✅ `src/components/sales/SalesRequestDetail/index.tsx` - Layout con tabs
- ✅ `src/components/sales/SalesRequestDetail/ClientInfoTab.tsx` - Info del cliente
- ✅ `src/components/sales/SalesRequestDetail/BeneficiariesTab.tsx` - Lista de beneficiarios
- ✅ `src/components/sales/SalesRequestDetail/DocumentsTab.tsx` - Templates y documentos
- ✅ `src/components/sales/SalesRequestDetail/SendingPanel.tsx` - Envío WhatsApp/Email

### Integración WhatsApp:
- ✅ `src/utils/whatsappHelper.ts` - Helpers para enlaces WhatsApp sin API
- ✅ Botón "Copiar Link WhatsApp" con mensaje prellenado
- ✅ Botón "Abrir WhatsApp" que abre el chat directamente

---

## ✅ Fase 4: Generación de PDFs (COMPLETADO)

### Edge Function:
- ✅ `supabase/functions/render-document/index.ts` - Procesa templates y genera hash SHA-256

### Funcionalidades:
- ✅ Carga de configuración de campos y áreas de firma
- ✅ Procesamiento de valores de campos
- ✅ Generación de hash SHA-256 para integridad
- ✅ Actualización de documento con metadatos

---

## 🔄 Fase 5: Sistema de Firma Mejorado (PENDIENTE)

### Por Implementar:
- [ ] Mostrar PDF real con campos posicionados en portal de firma
- [ ] Captura de firma en canvas con coordenadas exactas
- [ ] Generación de certificado de firma
- [ ] Visualización de evidencias (IP, timestamp, hash)

---

## 🔄 Fase 6: Mejoras Adicionales (PENDIENTE)

### Por Implementar:
- [ ] Generación real de PDF con pdf-lib (actualmente solo metadatos)
- [ ] Vista previa de documento antes de enviar
- [ ] Recordatorios automáticos de firma
- [ ] Dashboard de métricas de ventas

---

## Resumen de Archivos Nuevos

```
src/
├── components/
│   ├── template-designer/
│   │   ├── TemplateDesigner.tsx
│   │   ├── DesignerCanvas.tsx
│   │   ├── FieldPalette.tsx
│   │   ├── PropertiesPanel.tsx
│   │   └── types.ts
│   └── sales/
│       └── SalesRequestDetail/
│           ├── index.tsx
│           ├── ClientInfoTab.tsx
│           ├── BeneficiariesTab.tsx
│           ├── DocumentsTab.tsx
│           └── SendingPanel.tsx
├── pages/
│   └── TemplateDesignerPage.tsx
├── services/
│   └── templateDesignerService.ts
└── utils/
    └── whatsappHelper.ts

supabase/functions/
└── render-document/
    └── index.ts
```

---

## Dependencias Agregadas

- ✅ `fabric@^5.3.0` - Canvas interactivo para diseñador

---

## Próximos Pasos Recomendados

1. **Probar el flujo completo**: Crear solicitud → Declaración de salud → Ver documentos → Enviar por WhatsApp
2. **Diseñar una plantilla**: Ir a `/template-designer/:id` y posicionar campos
3. **Mejorar generación PDF**: Implementar pdf-lib para generar PDFs reales con campos superpuestos
4. **Portal de firma**: Mostrar campos en posiciones correctas para firma
