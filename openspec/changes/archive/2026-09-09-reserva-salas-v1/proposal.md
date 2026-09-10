## Why

No existe una forma sencilla de gestionar reservas de salas de cómputo: hoy se haría manual, con choques de horarios y sin control de fair use. Se necesita una v1 mínima (API + SPA) usable en local con Sail para reservar por bloques horarios sin solapes.

## What Changes

- Scaffold monorepo local: `/backend` (Laravel 13 API, PHP 8.4 via Sail + MySQL) y `/frontend` (React Vite + MUI, dev server separado, `VITE_API_URL`).
- Auth con Sanctum y roles `admin|user`: registro/login/logout, `admin` gestiona salas y reservas, `user` solo crea/ve/cancela las propias.
- CRUD de salas (`rooms`) con `name unique, capacity, location, is_active`.
- Reservas (`bookings`) con `user_id, room_id, start_at, end_at`, validación de no-solape por sala y por usuario, límites v1: max 2h por reserva, max 2 reservas/día/usuario, admin con override.
- API versionada `/api/v1` con FormRequest + ApiResource + Policy, formato de error único `{message, errors}`, Pint.
- Frontend TS base equilibrado (strict Vite default, tipado obligatorio solo en contrato API), React Query + MUI.
- Docs base AI-friendly: `AGENTS.md` con comandos Sail, contrato API en specs.

## Capabilities

### New Capabilities
- `rooms`: gestión de salas de cómputo (CRUD admin, listado filtrado por capacity/location, activación/desactivación).
- `bookings`: creación, listado y cancelación de reservas con reglas de no-solape, límites de duración/frecuencia y override de admin.
- `user-auth`: registro, login/logout con Sanctum, roles admin/user y autorización por Policy.

### Modified Capabilities
- Ninguna (repo greenfield, sin specs previas).

## Impact

- Nuevo código en `/backend` (migraciones users/rooms/bookings, controllers, requests, resources, policies, tests de solape) y `/frontend` (tipos api.ts, páginas salas/reservas con MUI + React Query).
- Dependencias: Sail (app PHP 8.4, mysql 8.4, mailpit), Sanctum; Node 20 + Vite para frontend. Sin impacto en prod (deploy local-only, Sail es dev-only).
- Breaking: N/A (proyecto nuevo).
