## 1. Estado visible de cancelación

- [x] 1.1 Agregar columna `status` (`active`/`cancelled`, default `active`) a `bookings` con índice y scopes `active()` en el modelo `Booking`; verificar `sail artisan migrate` aplica sin errores
- [x] 1.2 Cambiar `BookingController::destroy` a cancelar (`status=cancelled`, `422` si pasada) respondiendo `200` con el recurso, y filtrar `index` a próximas por defecto con `?include_past=1` para historial; verificar con tests de endpoint
- [x] 1.3 Excluir `cancelled` de `overlapsQuery` y del conteo diario en `StoreBookingRequest`; verificar con tests (slot cancelado se puede re-reservar, no cuenta en el límite)
- [x] 1.4 Exponer `status`, `room: {id, name, location}` (eager `with('room')`) e `is_past` en `BookingResource`; verificar forma del contrato en tests

## 2. Tests y calidad

- [x] 2.1 Migrar `BookingTest` de fechas fijas a fechas relativas a `now()` y agregar cobertura (cancel conserva fila, pasada `422`, historial filtrado, room anidado); verificar `sail artisan test` en verde
- [x] 2.2 Pasar `sail pint --test` (o `pint` + fix) y `sail artisan test` completo en verde
