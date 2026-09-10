## Why

RoomsPage y BookingsPage duplican cáscara de UI: el `sx` del DataGrid vive inline en RoomsPage, BookingsPage usa `Table` pelado sin paginación ni textos en español, y RoomDialog mezcla shell (Dialog/Title/Actions) con formulario y mutación `POST/PUT /rooms`. Cada ajuste visual o de diálogo hay que hacerlo dos veces y no hay prueba de reuso real.

## What Changes

- Nuevo `frontend/src/components/AppDialog.tsx`: shell tonto sobre MUI Dialog con props `title, open, onClose, onSubmit?, submitLabel, loading?, error?, children`. Centraliza reset-on-open, error inline y disabled-while-pending. Sin llamadas a `api`.
- Nuevo `frontend/src/components/AppDataGrid.tsx`: wrapper de `@mui/x-data-grid` con defaults actuales (pageSizeOptions `[5,10,25]`, pageSize 10, `disableRowSelectionOnClick`, altura `70vh`, header `primary.light`, fondo blanco) más `localeText` en español y empty-state unificado. Columnas las sigue definiendo cada página.
- `RoomDialog.tsx` pasa a componer `AppDialog` + formulario (name, location, capacity + switch); la mutación se mantiene fuera o inyectada vía `onSubmit` para que el dialog no sepa de endpoints.
- `RoomsPage.tsx` migra a `AppDataGrid` + `AppDialog` sin cambiar comportamiento (mismos filtros cliente, mismos Chips, mismas acciones admin).
- `BookingsPage.tsx` migra su `Table` a `AppDataGrid` (columnas ID, sala, inicio/fin local con `toLocalInput`, acción Cancelar) sin cambiar comportamiento.
- Sin cambios de backend ni de contrato API. Sin cambios visibles para el usuario.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna (refactor puro, sin cambios de REQUIREMENTS).

## Impact

- Solo `/frontend`: nuevo `src/components/`, edición de `src/pages/RoomsPage.tsx`, `src/pages/RoomDialog.tsx`, `src/pages/BookingsPage.tsx`. Sin migraciones ni endpoints.
- Riesgo bajo: regresión visual (se verifica con `tsc`, `build` y recorrido manual admin/user). Prepara la base para `add-room-booking-action` (BookingDialog sobre AppDialog).
