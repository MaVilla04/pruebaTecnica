## Context

Ver `proposal.md` (Why). Estado actual: `AppDialog` (61 líneas, 9 props) es consumido solo por `RoomDialog` (`src/pages/RoomDialog.tsx`, le mapea title/open/onClose/onSubmit/submitLabel/loading/error) y `BookingDialog` (`src/components/BookingDialog.tsx`, mismo mapeo más `loading` fusionado de dos queries). El `sx` del shell (título `primary.dark`, contenido en columna con `pt:3` anti-recorte, `Alert` de error, botones Cancelar + submit `contained`) vive solo en `AppDialog`. Restricción: cero cambio visible; `AppDataGrid` y `PageTitle` (change futuro) fuera de alcance.

## Goals / Non-Goals

Goals:
- Eliminar la capa `AppDialog` y dejar cada dialog componiendo MUI directo, recuperando el mapeo 1:1 estado → UI.
- Borrar `src/components/AppDialog.tsx` sin dejar imports huérfanos.

Non-Goals:
- No se cambian campos, mutaciones, `force`, validaciones ni textos de ningún dialog.
- No se crea `PageTitle` ni se tocan los títulos de página (siguiente change).
- No se toca `AppDataGrid` ni paginación/locale.

## Decisions

1. **Inline directo, no adelgazar el wrapper.** Alternativa C (AppDialog solo-layout con `actions?: ReactNode`) conservaría la capa y su `sx` centralizado, pero mantiene el archivo y el mapeo título/error/open/onClose; con 2 consumidores el ahorro no compensa. Se elige borrar: cada dialog recupera ~30 líneas de shell idénticas a las que delegaba.
2. **Copiar el `sx` exacto del shell a cada dialog.** El `pt:3` del `DialogContent` existe por el bug histórico de labels recortados (`improve-room-page-design`); se replica tal cual en ambos, no se "mejora" de pasada.
3. **Orden: inlinear primero, borrar después.** Primero `RoomDialog`, luego `BookingDialog` (cada uno con su `tsc`), y solo al final borrar `AppDialog.tsx` para que el compilador confirme que no quedan usos.

## Risks / Trade-offs

- [Divergencia futura de los dos shells (padding, colores, textos)] → Mitigación: aceptado explícitamente; si aparece un 3er dialog se re-evalúa extraer.
- [Borrado deja import huérfano o referencia en docs] → Mitigación: `tsc` + `grep` de `AppDialog` tras el borrado; el historial de este change documenta la decisión.

## Migration Plan

1. `RoomDialog`: inline MUI, `tsc` pasa.
2. `BookingDialog`: inline MUI, `tsc` pasa.
3. Borrar `AppDialog.tsx`, `grep AppDialog` vacío, `build` pasa.
4. Rollback: revert de los 3 paths (el borrado es restaurable desde git).

## Open Questions

Ninguna.
