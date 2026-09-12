## Context

See `proposal.md` (Why). Current state: `BookingsPage.tsx` renders `AppDataGrid` plus a Próximas/Historial toggle (`GET /bookings` with `?include_past=1` for history). Each `Booking` already carries everything a calendar needs (`start_at`/`end_at` UTC ISO-8601, `status`, `is_past`, `room {name, location}`), `toLocalInput` converts UTC to local input format, and status chips (`Activa`/`Cancelada`/`Finalizada`) already exist. No calendar library is installed (MUI + DataGrid + React Query only). For role `admin`, `BookingController@index` returns all bookings when no `user_id` filter is sent, so no backend change is needed.

## Goals / Non-Goals

Goals:

- Vista mensual de solo lectura con cero dependencias nuevas y cero cambios de backend.
- Reutilizar query (`?include_past=1`), conversión local y chips existentes.

Non-Goals:

- No hay crear/cancelar desde el calendario (queda en diálogo + grilla).
- No hay vistas de semana/día ni drag-and-drop.
- No se muestra el nombre del usuario en eventos del admin (la API expone `user_id`, no el nombre; follow-up aparte).

## Decisions

1. **Calendario propio con MUI, no FullCalendar.** Alternativa: FullCalendar (vistas mes/semana probadas) pero suma dependencia, estilos propios y superficie innecesaria para "ver reservas del mes". Una grilla de mes con `Box` + eventos por día cubre el caso con control total del estilo existente.
2. **Toggle `Calendario | Lista` en `BookingsPage`, no reemplazo.** La lista conserva detalle + Cancelar + diálogo; el calendario es lectura. Alternativa: apilar ambos (descartada: duplica scroll y carga visual; el usuario eligió toggle).
3. **Query propia `['bookings', 'calendar']` siempre con `?include_past=1`.** Independiente del toggle Próximas/Historial de la lista, porque el calendario por definición incluye finalizadas. Agrupación por día local (vía `toLocalInput`), no por día UTC ni Bogota: el calendario muestra lo que el usuario ve en su zona.
4. **Admin sin filtro `user_id`.** El backend ya devuelve todo para admin; el frontend no envía nada distinto salvo la misma query. Mostrar `user_id` numérico en el evento del admin es opcional y barato; el nombre queda fuera (requeriría incluir `user` en `BookingResource`).

## Risks / Trade-offs

- [Riesgo] Meses con muchas reservas (admin, todas) saturan las celdas → Mitigación: tope visual "+N más" por celda con conteo (detalle del task).
- [Trade-off] Grilla propia en vez de librería: hay que cuidar bordes de mes y semanas de 6 filas → aceptado; lógica de calendario mensual es acotada y testeable con `npm run build` + verificación manual.

## Migration Plan

1. `BookingsCalendar.tsx` → toggle + query en `BookingsPage` → `npm run build` + verificación manual (user y admin). Rollback: revert (solo frontend, sin migraciones).

## Open Questions

Ninguna.
