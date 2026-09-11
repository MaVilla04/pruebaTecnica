## Context

See `proposal.md` (Why). Backend contract (change `booking-visibility-states`, archived): resource `{id, room_id, user_id, start_at, end_at, status, is_past, room: {id, name, location} | null}`, `index` upcoming-only by default with `?include_past=1`, `destroy` → `200` with resource or `422` for past. Current front (`BookingsPage.tsx`, `types/api.ts`): `Booking` lacks `status`/`is_past`, Sala column renders numeric `room_id`, no Estado column, Cancelar is a text error button always enabled with silent failures, no history toggle. `RoomsPage` already sets the visual precedent (`Chip` for Estado).

## Goals / Non-Goals

Goals:
- Bookings page reflects the new contract with minimal, precedent-following MUI (chips like `RoomsPage`, outlined error button).
- Cancel action is honest: disabled when the backend would reject, errors visible otherwise.

Non-Goals:
- No changes to `BookingDialog` behavior, `RoomsPage`, `AuthContext`, or backend.
- No pagination/virtualization changes; no new data-fetching layer (plain React Query params).

## Decisions

1. **Sala como nombre y Ubicación en columna propia, con fallback `Sala #id` / `—`.** `room` puede ser `null` (sala físicamente desaparecida); mostrar el id crudo es mejor que una celda vacía y conserva trazabilidad.
2. **Estado derivado en cliente desde `status` + `is_past`.** Activa = active+próxima, Cancelada = cancelled, Finalizada = pasada. Sin lógica de fechas en el front (la fuente es el backend).
3. **Cancelar `outlined` + `error`, no `contained`.** Contained rojo compite con la acción primaria ("Nueva reserva", contained); outlined da presencia sin gritar. Deshabilitado cuando `cancelled || is_past || pending`.
4. **Toggle Próximas/Historial como segmented control junto a "Nueva reserva".** Un `useState<boolean>` alimenta `queryKey: ['bookings', showPast]` y el query param. Sin ruta separada: es un filtro de vista, no una página.
5. **`Booking` type alineado al recurso real.** `room` se estrecha de `Room` completo a `{id, name, location} | null`; se agregan `status` e `is_past`. `BookingDialog` solo hereda tipos (su `POST` ya devuelve la forma nueva).

## Risks / Trade-offs

- [Riesgo] `room: null` muestra `Sala #id`, menos amable → Mitigación: aceptado; solo ocurre si la fila de sala desapareció físicamente (el FK `restrict` lo impide con reservas).
- [Trade-off] Historial sin paginar del lado cliente más allá del DataGrid → aceptado por escala (precedente: resto de la app).

## Migration Plan

1. Tipos → columnas/estado/botón → toggle → `tsc` + `build` + `lint`.
2. Rollback: revert.

## Open Questions

Ninguna.
