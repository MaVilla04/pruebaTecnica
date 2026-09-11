## Why

El límite "2 reservas activas por día" se computa sobre día calendario UTC (`whereDate` en `start_at`), mientras el usuario percibe el día en hora local de Colombia: una reserva de las 20:44 COT cuenta para el día UTC siguiente y el cupo se agota "antes de tiempo" (caso real: booking #5, `01:44 UTC` = `20:44 COT` del día anterior). Además, el tope acordado sube de 2 a 5 reservas activas por día.

## What Changes

- El "día calendario" del cupo diario y del filtro `GET /bookings?date=` pasa de día UTC a día en `America/Bogota` (fijo en backend, sin input del cliente).
- Tope diario `BookingLimits::MAX_PER_DAY` pasa de 2 a 5 (solo activas, sin cambio).
- Almacenamiento sigue en UTC naive (`datetime`), serialización UTC ISO-8601 e `is_past`/upcoming por instante: sin cambios. Frontend sin cambios.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `bookings`: el "día calendario" del límite diario y del filtro `?date=` pasa de día UTC a día en `America/Bogota`, y el máximo sube de 2 a 5 activas por día.

## Impact

- Solo backend: `StoreBookingRequest` (ventana diaria Bogota), `BookingController@index` (filtro `date` Bogota), `BookingLimits` (constante + TZ del día), tests `BookingTest` (fixture no-UTC).
- Sin cambios de contrato: sin headers nuevos, sin campos nuevos, sin cambios en el recurso ni en otros endpoints.
- Verificación: `sail artisan test`, `sail pint --test`.
