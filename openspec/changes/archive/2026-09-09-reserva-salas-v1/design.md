## Context

Greenfield repo, local-only with Sail. See proposal.md Why. Backend `/backend` Laravel 13 + PHP 8.4 + MySQL 8.4 via Sail; frontend `/frontend` React Vite + MUI on separate dev server (`VITE_API_URL=http://localhost`). No prod deploy. DB names in English per decision.

## Goals / Non-Goals

**Goals:**
- Thin controllers, validation in FormRequest, output via ApiResource, authz via Policy.
- Overlap-safe bookings with DB index + app-level rule + tests.
- Frontend decoupled via versioned JSON contract.

**Non-Goals:**
- Prod Docker/CI/CD, Forge/Vercel deploy, LDAP/SSO, pagos, calendario externo, realtime websockets.

## Decisions

- **Sail PHP 8.4 + `laravel.build` with `mysql,mailpit`**: permite Laravel 13 aunque el host tenga PHP 8.2; `sail artisan/d` como único entrypoint backend. Alternativa (usar PHP local 8.2 + Laravel 12) descartada: nace en security-only.
- **Sanctum Bearer (no sessions)**: SPA separada en otro puerto necesita tokens; simple para prueba. Alternativa session-cookie descartada por CORS/CSRF extra.
- **Overlap en `CreateBookingAction` + `NoOverlapRule` + índice `(room_id, start_at, end_at)` y `(user_id, start_at, end_at)`**: DB acelera, regla unit-testeable, action reutilizada por admin override (`force: true` salta regla solo si `is_admin`). Alternativa solo-DB constraint descartada (mensajes 422 poco claros).
- **Límites en FormRequest (`max 2h`, `max 2/día` por `whereDate`)**: configuración como consts para futuro filtro. Alternativa middleware/observer descartada (menos visible).
- **Frontend TS base Vite `strict:true` sin `noUncheckedIndexedAccess`, `typescript-eslint:recommended`, tipado obligatorio solo en `types/api.ts` + React Query generics**: equilibrio flexibilidad/estabilidad acordado. Zod solo si el contrato crece.
- **Estructura `/backend` + `/frontend` en un repo**: un git, dos deploys lógicos (aunque hoy solo local).

## Risks / Trade-offs

- [Race condition] doble reserva simultánea → Mitigación: transacción + `lockForUpdate` en sala + re-check overlap en action; test de concurrencia básico.
- [Timezone] `start_at/end_at` UTC ISO-8601, frontend convierte a local; backend valida `date_format` + `after:now` → Mitigación: documentar en AGENTS + contrato.
- [Host PHP 8.2 vs container 8.4] comandos `php artisan` locales fallan → Mitigación: AGENTS.md exige `sail artisan`, CI usa container.
- [Fair use hardcodeado 2h/2-día] puede quedar corto → Mitigación: consts `BookingLimits` + mensaje 422 explicativo.

## Migration Plan

Local-only: `sail up -d`, `sail artisan migrate`, `sail artisan db:seed --class=DemoSeeder` (admin + salas demo), frontend `npm i && npm run dev`. Rollback: `sail artisan migrate:rollback` / `sail down -v` (borra volumen MySQL).

## Open Questions

- Ninguna bloqueante. Diferible: paginación default (15 vs 25), seed de salas reales del edificio.
