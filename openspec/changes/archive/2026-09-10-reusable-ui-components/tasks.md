## 1. Cáscara reutilizable

- [x] 1.1 Crear `frontend/src/components/AppDialog.tsx` (props title, open, onClose, onSubmit?, submitLabel, loading?, error?, children; sin llamadas a `api`) y verificar `npx tsc --noEmit` pasa en `/frontend`
- [x] 1.2 Crear `frontend/src/components/AppDataGrid.tsx` (defaults pageSizeOptions `[5,10,25]`, pageSize 10, `disableRowSelectionOnClick`, `sx` actual, `localeText` es, empty-state, passthrough `sx`/`slots`) y verificar `tsc` pasa

## 2. Migración Rooms (sin cambio visible)

- [x] 2.1 Refactorizar `RoomDialog.tsx` a componer `AppDialog` + formulario (misma mutación POST/PUT, mismo reset-on-open, mismo error inline) y verificar `tsc` pasa
- [x] 2.2 Migrar `RoomsPage.tsx` a `AppDialog` + `AppDataGrid` (mismas columnas, filtros cliente, Chips, acciones admin) y verificar `npm run build` pasa

## 3. Migración Bookings tabla (sin cambio visible)

- [x] 3.1 Migrar `BookingsPage.tsx` de `Table` a `AppDataGrid` (columnas ID, sala, inicio/fin local con `toLocalInput`, acción Cancelar; se mantiene form inline de creación en este change) y verificar `npm run build` pasa

## 4. Verificación

- [x] 4.1 Recorrido manual: como admin crear→201 y editar→200 sin recarga y 422 inline en RoomDialog; como user sin botones admin; Bookings lista y cancela igual que antes; y `sail pint --test` no aplica (solo frontend)
