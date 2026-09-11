## 1. Normalizar llamadas API

- [x] 1.1 Normalizar `RoomDialog.tsx` (blanco tras payload, `const res` + `return` en ramas put/post), expandir GET en `BookingDialog.tsx` y GET + DELETE en `BookingsPage.tsx` a bloque multi-línea explícito, y extraer `const payload` en `login`/`register` de `AuthContext.tsx` (`logout` intacto); verificar `npx tsc --noEmit`, `npm run build` y `npm run lint` pasan en `/frontend`
