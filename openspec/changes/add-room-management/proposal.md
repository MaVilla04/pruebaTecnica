## Why

La gestión de salas hoy solo existe vía API: el admin no puede crear ni editar salas desde la SPA y depende de llamadas manuales. RoomsPage solo lista, lo que frena la administración del día a día.

## What Changes

- Botón "Nueva sala" en `RoomsPage`, visible solo para `role === 'admin'`, que abre un Dialog de creación (name, capacity, location, is_active default true).
- Columna/botón "Editar" por fila, visible solo para admin, que abre el mismo Dialog precargado y guarda con `PUT /rooms/{id}`.
- El Dialog envía `POST /rooms` (crear) o `PUT /rooms/{id}` (editar), muestra errores `422` inline con `apiErrors` y refresca la tabla vía `invalidateQueries(['rooms'])` sin recargar ni desmontar la vista.
- Sin cambios de backend: `POST/PUT /api/v1/rooms` ya exigen admin vía `RoomPolicy` y validan con `Store/UpdateRoomRequest`.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `rooms`: la gestión de salas gana UI visible por rol (botones crear/editar solo admin, Dialog dual crear/editar sin recarga). El contrato API no cambia.

## Impact

- Solo `/frontend`: nuevo `src/pages/RoomDialog.tsx`, edición de `src/pages/RoomsPage.tsx`. Sin migraciones, sin cambios API.
- Riesgo bajo: si el admin pierde permisos en backend, el Dialog muestra el `403` inline; el `user` nunca ve los botones pero tampoco podría usar el endpoint.
