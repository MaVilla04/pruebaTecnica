## Why

Cancelar una reserva (`DELETE /api/v1/bookings/{id}`) hoy la borra físicamente de la DB: el historial desaparece y la cancelación es invisible como dato. Además, `GET /api/v1/bookings` mezcla próximas y pasadas sin distinción, y el recurso nunca incluye la sala (solo `room_id`). El principio rector es no borrar datos de dominio y exponer nombre+ubicación de sala para consumo del front.

## What Changes

- Nueva columna `status` (`active`/`cancelled`, default `active`): `DELETE` cancela (marca) y responde `200` con el recurso cancelado en vez de `204` vacío.
- `BookingResource` expone `status`, `room: {id, name, location}` (eager-loaded) e `is_past` derivado (`end_at < now`, sin columna).
- `GET /api/v1/bookings` devuelve solo próximas por defecto; `?include_past=1` incluye el historial (todos los roles ven su propio historial; admin conserva sus filtros).
- Cancelar una reserva pasada responde `422`. Las validaciones (overlaps, "2 por día") solo miran `active`.
- "Día calendario" para el límite diario = día UTC (se hace explícito; sin cambio de `APP_TIMEZONE`, que queda en `UTC`).
- Tests `BookingTest` migran de fechas fijas a fechas relativas.
- Solo backend. Sin cambios de frontend en este change.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `bookings`: cancelación como cambio de estado visible, sala anidada en el recurso, historial de pasadas con filtro explícito y etiqueta "Finalizada".

## Impact

- Solo `/backend`: migración (`status`), modelo `Booking` (scopes), `BookingController` (index/destroy), `BookingResource`, `StoreBookingRequest` + `overlapsQuery` (solo `active`), tests.
- Contrato: `DELETE` pasa de `204` a `200` con recurso (**BREAKING** menor, acordado); `GET` filtra próximas por defecto (**BREAKING** menor, acordado; historial vía `?include_past=1`); forma del recurso suma `status`, `room`, `is_past`.
- Verificación: `sail artisan test`, `sail pint --test`.
