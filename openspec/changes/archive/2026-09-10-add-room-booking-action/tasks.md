## 1. BookingDialog reutilizable

- [x] 1.1 Crear `frontend/src/components/BookingDialog.tsx` sobre `AppDialog` (props open, initialRoomId?, lockRoom?, onClose, onCreated; campos inicio/fin datetime-local, selector de sala cuando no bloqueada, checkbox Forzar solo admin vía `useAuth`, mutación `POST /bookings` con `toUtcIso` y `force` solo si true, error `422` inline vía `apiErrors`) y verificar `npx tsc --noEmit` pasa en `/frontend`
- [x] 1.2 Verificar que el dialog compila sin usarse (sin cambios de comportamiento) con `npm run build`

## 2. Reservar desde Salas

- [x] 2.1 Añadir columna "Reservar" en `RoomsPage.tsx` (visible ambos roles; `disabled` + tooltip en inactivas para `user`, siempre habilitada para `admin`; abre `BookingDialog` con sala fija y `onCreated → invalidateQueries(['bookings'])`) y verificar `npm run build` pasa

## 3. Unificar creación en Mis reservas

- [x] 3.1 Reemplazar el form inline de `BookingsPage.tsx` por botón "Nueva reserva" que abre el mismo `BookingDialog` con selector de sala, manteniendo grid y Cancelar, y verificar `npm run build` pasa

## 4. Verificación

- [x] 4.1 Recorrido manual: como `user` reservar desde Salas → 201 y aparece en Mis reservas sin recarga; solape → 422 inline sin cerrar; inactiva con botón deshabilitado; como `admin` reservar en inactiva con Forzar → 201; "Nueva reserva" en Bookings crea con selector; `npx tsc --noEmit` y `npm run build` pasan
