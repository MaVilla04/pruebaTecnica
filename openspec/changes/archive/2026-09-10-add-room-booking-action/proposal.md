## Why

El `user` hoy solo mira la tabla de Salas y tiene que ir a `/bookings` a reservar a mano escribiendo el ID de sala; no hay acción de reserva en contexto. El `admin` además puede forzar reservas (`force:true` salta solape e inactiva en el backend), pero el frontend no expone ese flag en ningún sitio.

## What Changes

- Columna "Reservar" por fila en `RoomsPage`, visible para ambos roles: para `user` deshabilitada con tooltip en salas `is_active:false`; para `admin` siempre habilitada (con `force` puede reservar inactivas).
- Nuevo `frontend/src/components/BookingDialog.tsx` sobre `AppDialog`: props `room` (fija) o selector de sala, campos inicio/fin `datetime-local`, mutación `POST /bookings {room_id, start_at: toUtcIso, end_at: toUtcIso, force?}`, error `422` inline vía `apiErrors`, éxito cierra + `invalidateQueries(['bookings'])`.
- Checkbox "Forzar (solo admin)" en el dialog, visible solo si `role === 'admin'`, que envía `force:true`.
- `BookingsPage`: el form inline de creación se reemplaza por botón "Nueva reserva" que abre el mismo `BookingDialog` con selector de sala.
- Sin cambios de backend: `POST /api/v1/bookings` ya valida solape, max 2h, max 2/día e inactiva, y `force` solo admin.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `rooms`: la lista de salas gana acción Reservar por fila para ambos roles (deshabilitada en inactivas para `user`, siempre activa para `admin`).
- `bookings`: la creación se unifica en un `BookingDialog` reutilizable sobre `AppDialog` (usado en Salas con sala fija y en Mis reservas con selector), con flag `force` solo admin y error `422` inline.

## Impact

- Solo `/frontend`: nuevo `src/components/BookingDialog.tsx`, edición de `src/pages/RoomsPage.tsx` y `src/pages/BookingsPage.tsx`. Sin migraciones ni endpoints.
- Riesgo medio: el form inline de Bookings desaparece (cambio visible, aunque mismo contrato); el `force` mal usado por admin puede pisar reservas (el backend lo permite por diseño, el UI lo marca como acción explícita).
