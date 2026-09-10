## Context

Ver `proposal.md` (Why). Base lista: `AppDialog` + `AppDataGrid` de fase 1 ya archivados. `RoomsPage.tsx` hoy solo da columna Acciones a admin; `BookingsPage.tsx` crea con form inline (`roomId/start/end` + `POST /bookings`) y lista con `AppDataGrid`. Backend `POST /api/v1/bookings` valida solape, max 2h, max 2/día, inactiva; `force:true` + admin salta solape e inactiva (`StoreBookingRequest.php:51-57`).

## Goals / Non-Goals

Goals:
- Un `BookingDialog` único sobre `AppDialog`, instanciado en Rooms (sala fija) y Bookings (selector + botón "Nueva reserva").
- Columna Reservar con regla por rol/inactiva; flag `force` solo admin.

Non-Goals:
- Sin backend, sin filtros servidor de reservas, sin calendario/disponibilidad (solo inicio/fin manual).
- No se toca `RoomDialog` ni la gestión de salas.

## Decisions

1. **Un dialog con `initialRoomId?` + `lockRoom?`, no dos dialogs.** Props: `open, initialRoomId?, lockRoom?, onClose, onCreated`. En Rooms se pasa la fila y se bloquea el selector (TextField disabled con nombre); en Bookings se muestra `select` de salas. Alternativa dos componentes duplicaría `toUtcIso`/`apiErrors`/422-inline.
2. **Mutación en el dialog (como `RoomDialog`), no en el padre.** El padre solo pasa `onCreated → invalidateQueries(['bookings'])`. Consistente con el patrón existente; el dialog sigue sin conocer routing.
3. **Reemplazar el form inline de Bookings, no convivir.** Convivir duplicaría el camino de creación y sus mensajes. El botón "Nueva reserva" abre el mismo dialog; el resto de la página (grid, Cancelar) no cambia.
4. **Force como checkbox solo admin dentro del dialog.** Se envía `force` solo cuando es `true` (se omite el campo en caso contrario para no ensuciar el payload de `user`). Alternativa prop separada por página — innecesaria, el rol sale de `useAuth`.
5. **Reservar como columna `renderCell` con `IconButton` + `Tooltip`** (coherente con Editar). Para `user` en inactiva: `disabled` + tooltip "Sala inactiva". Para admin siempre enabled; si la sala es inactiva el tooltip sugiere usar Forzar.

## Risks / Trade-offs

- [Admin pisa reservas con force sin darse cuenta] → Mitigación: checkbox con label explícito "Forzar (puede solapar)" + el error inline sigue mostrando otros 422.
- [Eliminar el form inline cambia el hábito en Bookings] → Mitigación: mismo contrato y mismos campos; verificación manual del flujo completo.
- [`valueFormatter` de fechas ya centralizado en columnas] → Sin cambio, se reutiliza.

## Migration Plan

1. Crear `src/components/BookingDialog.tsx` (sin uso), `tsc` pasa.
2. `RoomsPage`: columna Reservar + estado dialog/selectedRoom; `build` + manual user/admin.
3. `BookingsPage`: botón "Nueva reserva" + dialog con selector, eliminar form inline; `build` + manual.
4. Rollback: revert de las 2 páginas + borrar el componente (aditivo).

## Open Questions

Ninguna.
