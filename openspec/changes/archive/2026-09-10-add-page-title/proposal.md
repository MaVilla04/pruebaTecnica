## Why

Cada página titula a su manera: `RoomsPage` usa `h5` en `primary.dark` sin `gutterBottom`, `BookingsPage` y `LoginPage` usan `h5` con `gutterBottom` sin color. Un `PageTitle` reutilizable fija variante, color y espaciado en un sitio y cierra la unificación visual del front antes de pasar al backend.

## What Changes

- Nuevo `frontend/src/components/PageTitle.tsx`: `Typography` `h5` en `primary.dark` con `gutterBottom`, props `children`.
- Swap de una línea en `RoomsPage.tsx`, `BookingsPage.tsx` y `LoginPage.tsx` a `PageTitle`.
- Sin cambios de comportamiento, sin backend, sin contrato API. Único delta visible intencional: los 3 títulos quedan con el mismo color y espaciado.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna (refactor visual menor, sin cambios de REQUIREMENTS).

## Impact

- Solo `/frontend`: 1 archivo nuevo + 3 ediciones de una línea. Riesgo mínimo; se verifica con `tsc`, `build` y vistazo manual a las 3 páginas.
