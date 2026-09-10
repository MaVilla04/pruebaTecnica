## Context

Ver `proposal.md` (Why). Estado actual: `RoomsPage.tsx` define `DataGrid` inline con `sx` propio (altura `70vh`, header `primary.light`) y columna Acciones solo admin; `RoomDialog.tsx` acopla shell MUI + campos + mutación `POST/PUT /rooms` con reset-on-open vía `useEffect`; `BookingsPage.tsx` usa `Table` sin paginar con form inline de creación. No hay `src/components/`. Restricción: cero cambio visible, sin backend, preparar base para `BookingDialog` (fase 2).

## Goals / Non-Goals

Goals:
- Extraer `AppDialog` y `AppDataGrid` como única fuente de cáscara y usarlos en Rooms y Bookings.
- Dejar la mutación fuera del dialog (padre pasa `onSubmit` / `onSaved`) para que el shell no conozca endpoints.

Non-Goals:
- No se añade botón Reservar ni `BookingDialog` (fase 2, change `add-room-booking-action`).
- No se mueve el estilo al `theme` (`MuiDataGrid` overrides) — se mantiene wrapper para `localeText`/empty-state.
- No se unifica el layout página (`CrudListPage`) ni filtros servidor.

## Decisions

1. **AppDialog shell tonto, no FormDialog genérico.** Props `title, open, onClose, onSubmit?, submitLabel, loading?, error?, children`. Alternativa `FormDialog<T>` con `initialValues/onSubmit` centralizaría más pero añade magia de tipos y acopla formularios heterogéneos (salas vs reservas). El shell cubre confirm-dialog futuro gratis y deja cada form con su estado.
2. **AppDataGrid fino, no grueso.** Solo fija paginación, `disableRowSelectionOnClick`, `sx`, `localeText` es, empty-state. Columnas y filtrado siguen por página. Alternativa `CrudListPage<T>` (título+search+grid+dialog) impondría un layout que Bookings (filtros por fecha/sala) rompería pronto.
3. **Migrar Bookings `Table` → `AppDataGrid` dentro de este change.** Alternativa dejarlo fuera (change mínimo). Se incluye porque valida el wrapper con columnas de fecha (`toLocalInput`) y acción Cancelar; si solo se prueba en Rooms no hay prueba de reuso.
4. **Español en un solo sitio.** `localeText` (sin filas, paginación, etc.) vive en `AppDataGrid`, no por página.

## Risks / Trade-offs

- [Regresión visual: header, altura, chips cambian sin querer] → Mitigación: copiar `sx` exacto, verificación manual lado a lado + `tsc`/`build`.
- [Divergencia futura rompe el wrapper (filtros servidor, toolbar)] → Mitigación: wrapper acepta `sx`/`slots` passthrough; no se cierra la API.
- [Prop drilling `open/onClose/onSaved`] → Mitigación: aceptado para 2 páginas; no se introduce store/context.

## Migration Plan

1. Crear `src/components/AppDialog.tsx` + `AppDataGrid.tsx` (sin uso aún), `tsc` pasa.
2. `RoomDialog` compone `AppDialog`; `RoomsPage` usa ambos; `build` + manual admin/user.
3. `BookingsPage` migra tabla a `AppDataGrid`; `build` + manual.
4. Rollback: revert de los 3 archivos de página; los componentes nuevos son aditivos.

## Open Questions

Ninguna bloqueante. Reservar/force (visibilidad admin, inactivas, dialog en ambas vistas) se resuelve en fase 2.
