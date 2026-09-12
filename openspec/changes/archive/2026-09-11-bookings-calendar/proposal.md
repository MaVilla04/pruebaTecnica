## Why

La vista de reservas solo ofrece una grilla tabular: no hay forma de ver las reservas distribuidas en el tiempo (qué días están ocupados, huecos libres, carga del mes). Un calendario mensual visible para usuarios y administradores resuelve esa lectura de un vistazo, incluyendo las reservas ya finalizadas.

## What Changes

- La página de reservas gana un toggle de vista `Calendario | Lista`.
- La vista Calendario muestra una grilla de mes con las reservas como eventos por día (hora local, sala, estado), en modo solo lectura.
- El usuario ve sus propias reservas (próximas y finalizadas); el administrador ve las de todos los usuarios (próximas y finalizadas).
- La vista Lista queda intacta: crear (diálogo), cancelar y toggle Próximas/Historial siguen ahí.
- Sin cambios de backend ni de contrato API; sin dependencias nuevas.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `bookings`: la página de reservas ofrece una vista de calendario mensual (solo lectura) con las reservas del usuario (rol `user`) o con todas las reservas (rol `admin`), incluyendo finalizadas.

## Impact

- Solo frontend: nuevo `src/components/BookingsCalendar.tsx`, cambios en `src/pages/BookingsPage.tsx` (toggle + query de calendario). Reutiliza `GET /bookings?include_past=1`, `toLocalInput` y los chips de estado existentes.
- Sin cambios de contrato: sin endpoints nuevos, sin campos nuevos.
- Verificación: `npm run build`, verificación manual con rol `user` y `admin`.
