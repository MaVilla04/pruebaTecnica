## 1. Componente de calendario

- [x] 1.1 Crear `frontend/src/components/BookingsCalendar.tsx` con grilla de mes (header `[<] Mes Año [>]`, filas lun–dom, celdas con eventos del día local vía `toLocalInput`); cada evento muestra hora local + sala (`room.name` o `Sala #<room_id>`) + chip de estado (`Activa`/`Cancelada`/`Finalizada`); tope visual "+N más" por celda; verificar con `npm run build` en verde
- [x] 1.2 Agregar en `frontend/src/pages/BookingsPage.tsx` el toggle `Calendario | Lista` y la query `['bookings', 'calendar']` a `GET /bookings?include_past=1` (sin filtro `user_id`, el backend ya devuelve propias para `user` y todas para `admin`); la vista Lista queda intacta; verificar que el toggle alterna vistas sin recargar y que el calendario incluye finalizadas

## 2. Verificación

- [x] 2.1 Verificar manualmente con rol `user` (solo propias, incl. finalizadas y canceladas) y con rol `admin` (todas), más `npm run build` en verde
