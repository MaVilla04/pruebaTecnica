# AGENTS.md — Reserva de Salas v1 (monorepo local)

## Estructura
- `/backend` — Laravel 13 API (PHP 8.4 via Sail + MySQL 8.4 + Mailpit). Entry-point backend: `sail artisan`, `sail pint`, `sail test`.
- `/frontend` — React Vite + TS + MUI + React Query (dev server separado). Contrato API en `openspec/changes/reserva-salas-v1/specs/`.
- `/openspec/changes/reserva-salas-v1/` — proposal, specs (`rooms`, `bookings`, `user-auth`), design, tasks. Fuente de verdad del contrato.

## Comandos Sail (correr desde `/backend`)
```bash
./vendor/bin/sail up -d                    # levanta app+mysql+mailpit
./vendor/bin/sail artisan migrate          # migra (DB `laravel`, host `mysql`)
./vendor/bin/sail artisan migrate --seed   # migra + DemoSeeder (admin + salas)
./vendor/bin/sail artisan --version        # sanity check
./vendor/bin/sail pint --test              # lint (sin escribir)
./vendor/bin/sail pint                     # lint + fix
./vendor/bin/sail artisan test             # suite PHPUnit/Pest
./vendor/bin/sail down -v                  # reset total (borra volumen MySQL)
```
NO usar `php artisan` local (host tiene PHP 8.2, container usa 8.4/8.5). Siempre `sail artisan`.

## Frontend (correr desde `/frontend`)
```bash
npm install
npm run dev     # Vite :5173, usa VITE_API_URL
npm run build   # verificación TS + build
```
Env: `VITE_API_URL=http://localhost` (Sail expone app en `:80`). Ver `.env.example` frontend.

## Contrato API v1 (`/api/v1`, Bearer Sanctum)
- `POST /register {name,email,password} | POST /login -> {data:{user:{id,name,email,role},token}}`
- `POST /logout`, `GET /me` (auth)
- `GET /rooms?capacity_min&location` (solo activas para `user`, todas para `admin`) | `POST/PUT/DELETE /rooms` (solo `admin`)
- `POST /bookings {room_id,start_at,end_at[,force]}` (UTC ISO-8601, max 2h, max 2/día, no-solape `[start,end)`, `force:true` solo admin) | `GET /bookings?room_id&date&user_id` (owner filtra propio) | `DELETE /bookings/{id}`
- Errores: `{message, errors}` (422 validación, 403 policy, 401 sin token).

## Convenciones
- Thin controllers, validación en FormRequest, salida via ApiResource, authz via Policy.
- Fechas UTC ISO-8601; frontend convierte a local. Límites en `BookingLimits` consts.
- DB names en inglés (`rooms`, `bookings`). Pint obligatorio antes de commit.
