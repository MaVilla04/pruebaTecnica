## Why

Eliminar una sala (`DELETE /api/v1/rooms/{id}`) hoy la borra físicamente de la DB y, por el FK `bookings.room_id` con `cascadeOnDelete`, arrastra silenciosamente todo su historial de reservas. El principio rector del proyecto es no borrar nunca datos de dominio: la eliminación debe ocultar con estados, no destruir filas.

## What Changes

- `DELETE /api/v1/rooms/{id}` pasa a borrado lógico (columna `deleted_at`, trait `SoftDeletes`): la fila se conserva, se oculta de los listados y `GET` de una sala borrada responde `404`.
- El FK `bookings.room_id` cambia de `cascadeOnDelete` a `restrict`: borrar historial por cascada pasa a ser estructuralmente imposible.
- Las reservas de una sala borrada se conservan intactas.
- `is_active` queda sin cambios: inactivar (oculta a usuarios, bloquea reservas) sigue siendo un concepto distinto de eliminar.
- Sin endpoint `restore` en este change (se deja para después; el stub `RoomPolicy::restore` ya existe).
- Solo backend. Sin cambios de frontend en este change.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `rooms`: el requisito de gestión admin cambia — eliminar una sala la oculta (borrado lógico) en vez de destruirla, y sus reservas se preservan.

## Impact

- Solo `/backend`: migración (`deleted_at` en `rooms`), migración de FK (`restrict`), modelo `Room`, listados (excluyen borradas por scope global), tests (`RoomTest`, `BookingTest`).
- `DELETE` sigue respondiendo `204`; el contrato visible no cambia salvo que la fila persiste y `GET` de borrada da `404`.
- Verificación: `sail artisan test`, `sail pint --test`.
