## Context

Ver `proposal.md` (Why). Tres títulos `h5` inconsistentes: `RoomsPage.tsx:119` (con color, sin gutter), `BookingsPage.tsx:63` y `LoginPage.tsx:31` (con gutter, sin color). `AppDataGrid` queda intacto; este es el último change de front antes del backend.

## Goals / Non-Goals

Goals:
- Un `PageTitle` (`h5`, `primary.dark`, `gutterBottom`, `children`) usado en las 3 páginas.

Non-Goals:
- No se tocan layouts, toolbars ni dialogs; no se añaden props (p. ej. acciones a la derecha) — si hicieran falta, van en otro change.

## Decisions

1. **Un componente de una línea sobre `Typography`, sin props de estilo.** Alternativa aceptar `sx`/`variant` opcionales: se descarta, el punto es fijar el estándar, no parametrizarlo.
2. **Incluir `LoginPage`.** Son 3 swaps del mismo costo; dejarla fuera conservaría la inconsistencia que motiva el change.
3. **`gutterBottom` + color para los 3.** Único delta visible intencional (Bookings/Login ganan color, Rooms gana espaciado inferior).

## Risks / Trade-offs

- [Diferencia visual mínima en títulos] → Mitigación: intencional y uniforme; vistazo manual a las 3 páginas.

## Migration Plan

1. Crear `PageTitle.tsx`, 3 swaps, `tsc` + `build`.
2. Rollback: revert de 4 paths.

## Open Questions

Ninguna.
