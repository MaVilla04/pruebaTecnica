## Context

See `proposal.md` (Why). Current state: `BookingController::destroy` hard-deletes (`204`), `Booking` has no `status`, `BookingResource` returns `{id, room_id, user_id, start_at, end_at}`, `index` lists everything ordered by `start_at` with no time filter, and overlap/daily-count queries count all rows. `APP_TIMEZONE` is `UTC` and the whole chain (front `toUtcIso` → `Carbon->utc()` → naive `datetime` → `->utc()->toIso8601String()` → front `toLocalInput`) is UTC-consistent. Policies already carry `restore`/`forceDelete` stubs. Rooms already soft-delete (change `room-soft-delete`, commit `ecd824e`); `bookings.room_id` FK is `restrict`.

## Goals / Non-Goals

Goals:
- Cancellation becomes a visible state change (`200` + resource), rows never deleted.
- Upcoming-only listing by default with explicit history filter; past marker derived, no cron.
- `room` nested via eager load (no N+1); cancelled/past excluded from blocking validations.

Non-Goals:
- No frontend changes (grid, chips, "Finalizada" label rendering come in a later change; the term is fixed here as contract for it).
- No `APP_TIMEZONE` change; no per-user timezones.
- No `restore`/uncancel endpoint for bookings.
- No snapshot of room data (live reference; rooms soft-delete so the relation survives).

## Decisions

1. **`status` enum column (`active`/`cancelled`) over SoftDeletes.** The spec already speaks of "non-cancelled"/"active bookings", and cancellation must be *visible as data* (filterable, in the resource). SoftDeletes would hide it behind trash semantics.
2. **`DELETE` → `200` with resource (not `204`).** `204` communicates "gone"; the row persists and the client should receive the new state in-band. Accepted as minor breaking change.
3. **`is_past` derived, not stored.** `end_at < now` is always computable; a stored flag or cron would add a writer with no owner. UI term fixed as "Finalizada".
4. **Live `room` reference (no snapshot).** Since rooms soft-delete and the FK is `restrict`, the relation survives deletion; `with('room')` (+ trashed-aware if needed) shows name/location even for deleted rooms. Renames propagate — accepted (frozen history would need snapshot, deferred).
5. **UTC day for the daily limit.** `whereDate` + `after:now` already run in UTC; making it explicit in spec instead of changing timezone machinery. Single-TZ assumption documented.
6. **Tests to relative dates.** Fixes the 5 pre-existing `after:now` failures (hardcoded `2026-09-10`, proven against clean-tree baseline) by building slots off `now()`.

## Risks / Trade-offs

- [Riesgo] Clientes que esperaban `204` en DELETE o lista completa sin filtro → Mitigación: breaking menor acordado; versionado `/v1` ya delimita.
- [Riesgo] `include_past=1` sin paginar crece con el tiempo → Mitigación: aceptado por escala; paginación sería otro change.
- [Trade-off] `room: null` si la fila de sala desapareciera por `forceDelete` futuro → aceptado; el FK `restrict` lo impide mientras haya reservas.

## Migration Plan

1. Migración `status` en `bookings` (string/enum, default `active`, índice) — sin backfill (todo lo existente es activo por definición).
2. Modelo (scopes `active()`/`upcoming()`), resource (`status`, `room`, `is_past`), controlador (index/destroy), validaciones (`active()` en conteo y overlaps).
3. Tests (cancel conserva fila, cancelada no bloquea, pasadas filtradas, `422` en pasada, room anidado) + fechas relativas + `pint`. Rollback: revert de migración.

## Open Questions

Ninguna.
