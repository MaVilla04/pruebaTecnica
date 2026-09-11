## Context

See `proposal.md` (Why). Current state: `RoomController::destroy` calls `$room->delete()` (hard delete), `Room` has no `SoftDeletes` trait and `rooms` has no `deleted_at` column, and the FK `bookings.room_id` uses `cascadeOnDelete()` — deleting a room silently wipes its bookings. Both policies already contain `restore`/`forceDelete` stubs (SoftDeletes naming convention), so the codebase anticipates this pattern. `is_active` stays as the separate active/inactive concept enforced by `RoomPolicy::view` and `StoreBookingRequest`.

## Goals / Non-Goals

Goals:
- Room deletion becomes a soft delete with zero API shape change (`204`, listados excluyen borradas, `show` de borrada da `404` por route binding).
- Cascade deletion of bookings becomes structurally impossible.

Non-Goals:
- No `restore` endpoint (fica para después).
- No tocan `bookings`: ni resource, ni queries, ni `status` (eso es el change siguiente).
- No cambia `is_active` ni sus validaciones.

## Decisions

1. **SoftDeletes para rooms (no `status`).** Alternativa: columna `status` como en bookings. Elegido SoftDeletes porque el borrado de salas no necesita estados múltiples ni visibilidad del estado en el resource (la sala simplemente desaparece de los listados), y el framework resuelve exclusión + `404` en binding sin código extra. El `status` explícito se reserva para bookings, donde `cancelled` sí debe ser visible y filtrable.
2. **FK `restrict` en vez de mantener `cascade`.** Con soft delete el cascade nunca dispararía, pero dejarlo es una trampa para un futuro `forceDelete`. `restrict` convierte la invariante ("borrar sala nunca borra reservas") en estructural. Requiere migración que dropee y recree la constraint.
3. **Sin endpoint restore en este change.** Añadiría superficie API (`POST /rooms/{id}/restore`) por un caso de uso aún no pedido. El modelo queda preparado (`restore` en policy ya existe).

## Risks / Trade-offs

- [Riesgo] `Room::delete()` en seeders/tests borra soft sin que se note → Mitigación: tests afirman `assertSoftDeleted` explícitamente.
- [Riesgo] `unique:rooms,name` bloquea reusar el nombre de una sala borrada → Mitigación: aceptado en este change (conservador); si se quiere liberar nombres, es otro change.
- [Trade-off] Las salas borradas siguen ocupando fila + sus bookings cuentan en DB → aceptado: es el punto del principio (nunca borrar dominio).

## Migration Plan

1. Migración `deleted_at` en `rooms` (nullable, sin backfill necesario).
2. Migración FK: drop constraint `cascade`, recreate con `restrict` (MySQL 8.4).
3. `Room` + `SoftDeletes`; sin cambios en controladores (el scope global y el binding hacen el trabajo).
4. Tests + `pint`. Rollback: revert de migraciones.

## Open Questions

Ninguna.
