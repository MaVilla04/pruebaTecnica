## Context

See `proposal.md` (Why). Current state: `StoreBookingRequest::withValidator` counts the day with `Booking::active()->where('user_id', ...)->whereDate('start_at', $start->toDateString())` where `$start` is UTC, and compares against `BookingLimits::MAX_PER_DAY = 2`. `BookingController@index` filtra `?date=` con el mismo `whereDate` UTC. `APP_TIMEZONE` es `UTC`; `start_at`/`end_at` llegan como UTC ISO-8601 y se guardan como `datetime` naive (UTC por convención). No hay input de TZ desde el cliente y no se agrega ninguno en este change.

## Goals / Non-Goals

Goals:
- El cupo diario y el filtro `?date=` siguen el día que el usuario ve (Bogota), con cero cambios en frontend y cero campos persistidos.
- La ventana diaria es un rango UTC explícito e index-friendly.

Non-Goals:
- No se toca almacenamiento (sigue UTC naive), serialización (`BookingResource` UTC ISO-8601), `is_past`/filtro upcoming (por instante), overlap checks, ni display (`toLocalInput`).
- No hay jobs de reseteo de cupo; la ventana se computa por request.
- No hay TZ por usuario ni configuración por entorno en este change.

## Decisions

1. **TZ fija `America/Bogota` como constante de dominio (`BookingLimits::DAY_TIMEZONE`), no header ni columna.** Alternativas: header `X-Timezone` (genérico pero confía en input del cliente para un control de fair-use y exige cambio front) y `users.timezone` (necesita migración + UI de edición). Para usuarios Bogota, la constante es determinista y de un solo punto de cambio.
2. **Ventana `[00:00, 24:00)` Bogota convertida a UTC, no `whereDate`.** Desde el `start_at` (o el `date` del filtro) se calculan `startOfDay`/`endOfDay` en Bogota y se convierten a UTC para `where('start_at', '>=', from)->where('start_at', '<', to)`. Rationale: hace explícito el borde (Bogota no observa DST, el offset es estable -05:00) y mantiene la query sargable en vez de depender de la TZ de sesión de MySQL.
3. **Mismo helper para cupo y filtro `?date=`.** Ambos son "día calendario visto por el usuario"; compartir la conversión evita que el listado y el cupo discrepen en el borde de las 19:00 COT (= 00:00 UTC).
4. **Bundle del bump 2 → 5 en este change.** Mismo bloque de validación, mismas líneas de spec y mismo archivo de tests; un change separado churnearía los mismos artefactos dos veces.

## Risks / Trade-offs

- [Riesgo] Usuarios futuros en otra TZ verán un "día" que no es el suyo → Mitigación: aceptado; el camino a TZ por request/usuario queda abierto (la lógica de ventana se reutiliza, solo cambia la fuente de la TZ).
- [Trade-off] `whereDate` → rango UTC: el día límite ya no se lee directo en la DB → aceptado; el rango es index-friendly y testeable con fixtures fijas.

## Migration Plan

1. `BookingLimits` (2 → 5 + `DAY_TIMEZONE`) → validación con ventana Bogota → filtro `?date=` con la misma ventana → tests (fixture `20:44 COT` = `01:44 UTC`, sexto booking `422`, borde `04:59/05:00 UTC`) → `pint` + suite. Rollback: revert (sin migraciones que revertir).

## Open Questions

Ninguna.
