## 1. Inline MUI en dialogs

- [x] 1.1 Inlinear MUI `Dialog/DialogTitle/DialogContent/DialogActions` en `frontend/src/pages/RoomDialog.tsx` (mismo `sx` del shell, mismo `Alert`, mismos botones Crear/Guardar, misma mutación) y verificar `npx tsc --noEmit` pasa en `/frontend`
- [x] 1.2 Inlinear MUI `Dialog` en `frontend/src/components/BookingDialog.tsx` (mismo `sx`, mismo `Alert`, mismos botones Cancelar/Reservar con `loading` fusionado, mismo checkbox Forzar solo admin) y verificar `npx tsc --noEmit` pasa

## 2. Borrado y verificación

- [x] 2.1 Borrar `frontend/src/components/AppDialog.tsx`, verificar `grep AppDialog` vacío en `/frontend/src` y `npm run build` pasa
- [x] 2.2 Recorrido manual: abrir/cerrar crear sala, editar sala, reservar desde Salas (user y admin con Forzar) y Nueva reserva desde Bookings; 422 inline intacto en ambos dialogs. Nota: crear reserva devuelve 422 también con usuario nuevo y la tabla muestra siempre sala 1 — pendiente revisión backend (fuera de alcance de este change).
