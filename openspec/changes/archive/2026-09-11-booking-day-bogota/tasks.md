## 1. Límite diario y filtro por día Bogota

- [x] 1.1 Subir `BookingLimits::MAX_PER_DAY` de 2 a 5, agregar `DAY_TIMEZONE = 'America/Bogota'` y cambiar el conteo diario en `StoreBookingRequest` de `whereDate` UTC a ventana `[00:00, 24:00)` Bogota convertida a UTC; verificar con tests (sexto booking del día Bogota `422` y fixture `20:44 COT` = `01:44 UTC` imputada al día local previo)
- [x] 1.2 Aplicar la misma ventana Bogota al filtro `?date=` en `BookingController@index` (admin y user); verificar con test (`?date=2026-09-10` incluye `04:59 UTC` y excluye `05:00 UTC`)

## 2. Tests y calidad

- [x] 2.1 Agregar cobertura en `BookingTest` (tope 5, borde medianoche Bogota, filtro `date` por día Bogota); verificar `sail artisan test` en verde
- [x] 2.2 Pasar `sail pint --test` y `sail artisan test` completo en verde
