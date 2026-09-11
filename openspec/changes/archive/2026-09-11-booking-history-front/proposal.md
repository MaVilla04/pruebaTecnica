## Why

El backend ya expone `status`, `is_past`, `room: {id, name, location}`, filtro `?include_past=1` y cancelación visible (`200`), pero el front de reservas sigue mostrando el `room_id` numérico, sin columna de estado, con un botón Cancelar de bajo énfasis siempre habilitado (incluso sobre canceladas o pasadas) y sin acceso al historial. Hay que alinear el flujo de reservas con el contrato nuevo.

## What Changes

- `types/api.ts`: `Booking` suma `status: 'active' | 'cancelled'`, `is_past: boolean` y `room?: {id, name, location} | null`.
- `BookingsPage`: columna Sala por nombre (fallback `Sala #id` si `room` es null), columna Ubicación (`—` si `room` es null), columna Estado con `Chip` (Activa/Cancelada/Finalizada), botón Cancelar `outlined` + `error` deshabilitado cuando no aplica, `Alert` ante fallo de cancelación (`422`), y toggle Próximas/Historial (`?include_past=1`).
- `BookingDialog`: sin cambios funcionales (solo hereda tipos).
- Solo flujo de reservas. Sin tocar `RoomsPage`, `AuthContext` ni backend.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `bookings`: la página de reservas muestra nombre de sala, estado con chip, cancelar destacado con reglas de habilitación y toggle de historial.

## Impact

- Solo `/frontend`: `BookingsPage.tsx`, `types/api.ts` (y `BookingDialog.tsx` solo si los tipos lo exigen).
- Verificación: `npx tsc --noEmit`, `npm run build`, `npm run lint`.
