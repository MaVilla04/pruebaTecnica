## 1. Borrado lógico de salas

- [x] 1.1 Agregar `deleted_at` a `rooms` (migración con `softDeletes`) y trait `SoftDeletes` al modelo `Room`; verificar `sail artisan migrate` aplica sin errores
- [x] 1.2 Cambiar FK `bookings.room_id` de `cascadeOnDelete` a `restrict` (migración drop + recreate); verificar `sail artisan migrate` y que el esquema muestra `restrict`
- [x] 1.3 Cubrir con tests: `DELETE /api/v1/rooms/{id}` responde `204` y conserva la fila (`assertSoftDeleted`), la sala borrada no sale en `GET /api/v1/rooms` ni siquiera para admin, `GET /api/v1/rooms/{id}` responde `404`, y sus bookings se conservan; verificar `sail artisan test` pasa
- [x] 1.4 Pasar `sail pint --test` (o `pint` + fix) y `sail artisan test` completo en verde
