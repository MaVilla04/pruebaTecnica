## Why

`AppDialog` (`frontend/src/components/AppDialog.tsx`) envuelve MUI `Dialog` con 9 props y solo tiene 2 consumidores (`RoomDialog`, `BookingDialog`), que le mapean ~7 props cada uno. La capa cuesta más líneas de las que ahorra y el tercer consumidor que la amortizaría (confirm-dialog) no llegó; el `PageTitle` reutilizable que sí hace falta va en un change aparte.

## What Changes

- `frontend/src/pages/RoomDialog.tsx` vuelve a usar MUI `Dialog/DialogTitle/DialogContent/DialogActions` directos, con su `sx`, `Alert` de error y botones Crear/Guardar.
- `frontend/src/components/BookingDialog.tsx` vuelve a usar MUI `Dialog` directo, con su `Alert`, botones Cancelar/Reservar y `loading` de sus mutaciones.
- Se borra `frontend/src/components/AppDialog.tsx`.
- Sin cambios de comportamiento visible, sin backend, sin contrato API.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna (refactor puro, sin cambios de REQUIREMENTS).

## Impact

- Solo `/frontend`: edición de `src/pages/RoomDialog.tsx` y `src/components/BookingDialog.tsx`, borrado de `src/components/AppDialog.tsx`. `AppDataGrid` intacto.
- Riesgo bajo: duplicación de la cáscara en 2 sitios (título `primary.dark`, padding anti-recorte, botones en español); si aparece un 3er dialog se re-evalúa extraer de nuevo. Se verifica con `tsc`, `build` y recorrido manual de los 3 dialogs.
