## Why

El patrón legible de llamadas API (`const payload`, línea en blanco, `const res = await api...`, retorno del `.data` desenvuelto — fijado en `BookingDialog`) no se aplica en 6 call sites: `RoomDialog` (sin blanco/res/return), 2 GETs y 1 DELETE en one-liner, y `login`/`register` en `AuthContext` con el objeto inline. Unificar la forma facilita leer qué se envía y qué vuelve en cada llamada.

## What Changes

- `RoomDialog.tsx`: línea en blanco tras el payload; ramas put/post con `const res` + `return`.
- `BookingDialog.tsx` (GET rooms), `BookingsPage.tsx` (GET bookings, DELETE): expandir one-liners a bloque multi-línea con `const res` / `await` explícito.
- `AuthContext.tsx`: `const payload` en `login` y `register` (`logout` intacto, sin payload).
- Solo forma: mismas URLs, mismos payloads, mismos tipos, misma lógica.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna (refactor puro, sin cambios de REQUIREMENTS).

## Impact

- Solo `/frontend`: 4 archivos (`RoomDialog`, `BookingDialog`, `BookingsPage`, `AuthContext`). Riesgo mínimo; verificación `tsc`, `build`, `lint`.
