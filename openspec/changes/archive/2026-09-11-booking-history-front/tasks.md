## 1. Tipos y columnas

- [x] 1.1 Alinear `Booking` en `types/api.ts` (`status`, `is_past`, `room: {id, name, location} | null`); verificar `npx tsc --noEmit` pasa
- [x] 1.2 Columna Sala por nombre con fallback `Sala #id` y columna Estado con `Chip` (Activa/Cancelada/Finalizada); verificar visualmente con `npm run dev` y `npx tsc --noEmit` pasa

## 2. Acción cancelar e historial

- [x] 2.1 Botón Cancelar `outlined` + `error`, deshabilitado si `cancelled || is_past || pending`, con `Alert` ante fallo; verificar cancelación exitosa refresca y fallo muestra error sin perder la lista
- [x] 2.2 Toggle Próximas/Historial con `?include_past=1` (`queryKey` incluye el flag); verificar que Historial muestra pasadas y volver oculta
- [x] 2.3 Pasar `npm run build` y `npm run lint` en `/frontend` en verde
