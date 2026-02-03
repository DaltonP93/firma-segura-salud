
# Plan de Reestructuración Completa - Estilo prepaga-digital

## Resumen Ejecutivo

Reestructurar toda la aplicación para que siga el diseño profesional y minimalista del proyecto de referencia "prepaga-digital", manteniendo todas las funcionalidades existentes pero con una experiencia de usuario mejorada.

---

## Fase 1: Sistema de Autenticación (Login ya implementado)

**Estado:** Completado en la sesión anterior.

- Páginas standalone para Login, Register y Reset Password
- Diseño centrado con card blanco sobre fondo gris claro
- Logo Shield con branding "Seguro Digital"

---

## Fase 2: Layout y Navegación Global

### 2.1 Sidebar Mejorado (`AppSidebar.tsx`)

**Cambios:**
- Agregar icono de carrito de compras (ShoppingCart) al mapa de iconos para la sección Ventas
- Mantener la funcionalidad de colapsar/expandir
- Mejorar indicadores visuales de ruta activa
- Añadir footer con información del usuario en el sidebar

### 2.2 Header Simplificado (`AppHeader.tsx`)

**Cambios:**
- Eliminar duplicación de botón Admin (ya está en el sidebar)
- Mantener notificaciones y menú de usuario
- Simplificar el diseño visual

---

## Fase 3: Módulo de Ventas - Vista de Tabla Profesional

### 3.1 Nueva Lista de Solicitudes (`SalesRequestsTable.tsx`)

**Crear nuevo componente:**
```text
src/components/sales/SalesRequestsTable.tsx
```

**Características:**
- Vista de tabla con columnas: N° Solicitud, Cliente, Email, Teléfono, Tipo de Póliza, Estado, Beneficiarios, Fecha, Acciones
- Cabeceras ordenables
- Filtros en línea por estado
- Búsqueda integrada
- Paginación
- Acciones rápidas en cada fila con iconos (Ver, Editar, Declaración, Firma, WhatsApp, Eliminar)
- Badges de estado con colores distintivos

### 3.2 Modal de Envío WhatsApp (`WhatsAppSendModal.tsx`)

**Crear nuevo componente:**
```text
src/components/sales/WhatsAppSendModal.tsx
```

**Características:**
- Vista previa del mensaje antes de enviar
- Selector de plantilla de mensaje
- Botón "Copiar Link" prominente
- Botón "Abrir WhatsApp"
- Historial de mensajes enviados (si existe)

### 3.3 Refactorización de SalesManager

**Modificar `SalesManager.tsx`:**
- Reemplazar `SalesRequestsList` (cards) por `SalesRequestsTable`
- Mantener tabs pero con diseño simplificado
- Integrar el modal de WhatsApp

### 3.4 Estadísticas de Ventas Mejoradas (`SalesStatsCards.tsx`)

**Modificar componente existente:**
- Diseño de cards más compacto
- Iconos más prominentes
- Colores consistentes con el tema

---

## Fase 4: Panel de Administración Reestructurado

### 4.1 Tabs Reorganizados (`AdminPanel.tsx`)

**Nueva estructura de tabs:**
1. **Configuración** - Setup del sistema y estado
2. **APIs** - Configuración de Resend y WhatsApp
3. **Personalización** - Tema, logo, colores
4. **Tipos de Empresa** - CRUD de tipos
5. **Secciones** - Visibilidad y orden de navegación
6. **Usuarios** - Gestión de usuarios

**Cambios visuales:**
- Reducir de 9 a 6 tabs principales
- Mover "Preguntas Salud" y "Planes" dentro de "Configuración"
- Mover "Resumen" al Dashboard principal

### 4.2 Configuración Unificada (`SystemSetupDashboard.tsx`)

**Modificar para incluir:**
- Dashboard de estado del sistema
- Acceso a datos maestros (Preguntas Salud, Planes)
- Indicadores de progreso de configuración

### 4.3 Gestión de Usuarios Mejorada (`UserManagement.tsx`)

**Modificar:**
- Vista de tabla profesional en lugar de cards
- Filtros avanzados
- Acciones en línea
- Modal de creación/edición mejorado

### 4.4 Gestión de Secciones Mejorada (`SectionCustomizer.tsx`)

**Modificar:**
- Lista de secciones con switches de visibilidad
- Reordenamiento con drag-and-drop (usando sorteo manual por ahora)
- Asignación de roles por sección

---

## Fase 5: Página de Perfil Completa

### 5.1 Rediseño de Profile (`Profile.tsx`)

**Nueva estructura:**

```text
┌─────────────────────────────────────────────────────────┐
│  Mi Perfil                                              │
│  Gestiona tu información personal                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │   Foto Perfil    │  │   Estadísticas             │  │
│  │   + Estado       │  │   - Ventas realizadas      │  │
│  │   + Rol          │  │   - Documentos creados     │  │
│  │   + Desde        │  │   - Firmas gestionadas     │  │
│  └──────────────────┘  └────────────────────────────┘  │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Información Personal                             │ │
│  │   Nombre, Usuario, Teléfono, Empresa               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Configuración de Seguridad                       │ │
│  │   - Cambiar contraseña                             │ │
│  │   - Configurar 2FA                                 │ │
│  │   - Sesiones activas                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Historial de Actividad                           │ │
│  │   Últimas acciones realizadas                      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Nuevos Componentes de Perfil

**Crear:**
```text
src/components/profile/ProfileStats.tsx
src/components/profile/ActivityHistory.tsx
src/components/profile/SecuritySettings.tsx
```

---

## Fase 6: Dashboard Principal Mejorado

### 6.1 Rediseño de Dashboard (`Dashboard.tsx`)

**Cambios:**
- Stats cards más prominentes
- Gráficos con mejor estilo
- Accesos rápidos a acciones frecuentes
- Actividad reciente mejorada

---

## Fase 7: Página Index Simplificada

### 7.1 Modificar Index (`Index.tsx`)

**Cambios:**
- Eliminar el header duplicado (ya está en AppLayout)
- Mantener tabs pero con diseño simplificado
- Usar el layout con sidebar

---

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/components/sales/SalesRequestsTable.tsx` | Vista de tabla para solicitudes |
| `src/components/sales/WhatsAppSendModal.tsx` | Modal de envío WhatsApp |
| `src/components/profile/ProfileStats.tsx` | Estadísticas del usuario |
| `src/components/profile/ActivityHistory.tsx` | Historial de actividad |
| `src/components/profile/SecuritySettings.tsx` | Configuración de seguridad |

## Archivos a Modificar

| Archivo | Cambios Principales |
|---------|---------------------|
| `src/components/navigation/AppSidebar.tsx` | Agregar icono ShoppingCart, footer de usuario |
| `src/components/navigation/AppHeader.tsx` | Simplificar, remover botón Admin duplicado |
| `src/components/sales/SalesManager.tsx` | Usar tabla en lugar de cards |
| `src/components/admin/AdminPanel.tsx` | Reorganizar tabs (6 en lugar de 9) |
| `src/components/admin/SectionCustomizer.tsx` | Añadir funcionalidad de visibilidad/orden |
| `src/components/admin/user-management/UserList.tsx` | Cambiar de cards a tabla |
| `src/pages/Profile.tsx` | Rediseño completo con stats e historial |
| `src/pages/Dashboard.tsx` | Mejorar visualización |
| `src/pages/Index.tsx` | Remover header duplicado |

---

## Secuencia de Implementación

### Sprint 1: Navegación y Layout
1. Modificar `AppSidebar.tsx` - agregar ShoppingCart icon
2. Simplificar `AppHeader.tsx`
3. Actualizar `Index.tsx` - remover header duplicado

### Sprint 2: Módulo de Ventas
1. Crear `SalesRequestsTable.tsx`
2. Crear `WhatsAppSendModal.tsx`
3. Modificar `SalesManager.tsx` para usar tabla
4. Mejorar `SalesStatsCards.tsx`

### Sprint 3: Panel de Administración
1. Reorganizar tabs en `AdminPanel.tsx`
2. Mejorar `SectionCustomizer.tsx`
3. Modificar `UserList.tsx` a vista de tabla
4. Consolidar datos maestros en configuración

### Sprint 4: Perfil y Dashboard
1. Crear componentes de perfil (Stats, History, Security)
2. Rediseñar `Profile.tsx`
3. Mejorar `Dashboard.tsx`

---

## Notas Técnicas

- **Sin nuevas dependencias:** Usar componentes existentes de Shadcn/UI
- **Mantener funcionalidad:** Todas las funciones existentes se conservan
- **Diseño responsivo:** Mantener compatibilidad móvil
- **Consistencia visual:** Seguir el estilo minimalista de prepaga-digital

---

## Resultado Esperado

Al completar esta reestructuración:

1. **Navegación:** Sidebar funcional con todos los módulos y icono correcto para Ventas
2. **Ventas:** Vista de tabla profesional con todas las acciones y modal de WhatsApp
3. **Admin:** Panel organizado en 6 tabs claros y funcionales
4. **Perfil:** Página completa con estadísticas, historial y seguridad
5. **Dashboard:** Visualización mejorada de métricas y actividad
6. **Index:** Integrado correctamente con el layout sin duplicación de headers
