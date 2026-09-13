# Room Booking v1 (Reserva de Salas)

Monorepo local: `backend` (API Laravel 13) + `frontend` (SPA React + Vite).

## Stack

- **Backend:** Laravel 13, PHP 8.4 vía Sail, MySQL 8.4, Mailpit, Sanctum (Bearer tokens).
- **Frontend:** React 19 + Vite + TypeScript + MUI + React Query + Axios.
- **Contrato API:** `openspec/specs/{user-auth,rooms,bookings}/` es la fuente de verdad.

## Requisitos

- Docker Desktop (Sail: app en `:80`, MySQL, Mailpit).
- Node.js 20+ y npm (solo frontend).
- No necesitas PHP local. Usa siempre Sail desde `backend/`: `./vendor/bin/sail artisan ...`.

## Clonar y correr

```bash
git clone <repo-url>
cd pruebaTecnica
```

### 1. Backend (desde `backend/`)

```bash
cd backend
composer install
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan --version   # sanity check
```

API base: `http://localhost/api/v1`.

El seed (`database/seeders/DemoSeeder.php`) crea:

- Admin: `admin@example.com` / `password123` (rol `admin`)
- 3 salas de ejemplo + 1 reserva demo

### 2. Frontend (desde `frontend/`)

```bash
cd ../frontend
npm install
cp .env.example .env   # opcional, ya trae VITE_API_URL=http://localhost
npm run dev            # Vite en :5173
```

### 3. Verificar que funciona

```bash
# Login (devuelve token Bearer)
curl -s -X POST http://localhost/api/v1/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## Comandos del día a día

```bash
cd backend
./vendor/bin/sail up -d                    # levantar
./vendor/bin/sail artisan migrate --seed   # migrar + seed
./vendor/bin/sail artisan test             # suite PHPUnit
./vendor/bin/sail artisan test --filter=BookingOverlap
./vendor/bin/sail pint --test              # lint (sin escribir)
./vendor/bin/sail pint                     # lint + fix (antes de commit)
./vendor/bin/sail down                     # detener

cd ../frontend
npm run dev     # desarrollo
npm run build   # typecheck (tsc -b) + build
npm run lint    # oxlint
```

### Reset total (borra el volumen MySQL)

```bash
cd backend
./vendor/bin/sail down -v && ./vendor/bin/sail up -d && ./vendor/bin/sail artisan migrate --seed
```

## API (resumen)

Auth: token Bearer de Sanctum. Errores: `{message, errors}` (401 sin token, 403 policy, 422 validación).

- `POST /register {name,email,password}` → `{data:{user,token}}`
- `POST /login {email,password}` → `{data:{user:{id,name,email,role},token}}`
- `POST /logout`, `GET /me` (requieren auth)
- `GET /rooms?capacity_min&location` (usuarios ven solo activas, admins todas)
- `POST / PUT / DELETE /rooms` (solo `admin`)
- `POST /bookings {room_id,start_at,end_at[,force]}` — fechas UTC ISO-8601, máx 2h
  (`MAX_DURATION_MINUTES=120`), máx 5/día por usuario en día `America/Bogota`
  (`MAX_PER_DAY=5`), sin solape en `[start,end)`, `force:true` solo admin
- `GET /bookings?room_id&date&user_id` (no-admins solo ven las propias)
- `DELETE /bookings/{id}` (cancelación suave: `status=cancelled`, el slot se libera)

## Cómo se evita la doble reserva

Punto único: `backend/app/Actions/CreateBookingAction.php` (`execute()`).

1. `DB::transaction()` + `lockForUpdate()` sobre la fila de `rooms` serializa
   `POST /bookings` concurrentes para la **misma sala**.
2. Dentro del lock verifica: flag `force` (admin), sala activa, duración ≤ 2h,
   límite diario (ventana Bogotana vía `BookingLimits::dayWindowForInstant()`)
   y `Booking::overlapsQuery()`: `status=active` + `(room_id OR user_id)` +
   `start_at < end AND end_at > start` (adyacentes permitidos).
3. Solape → `422 {errors:{start_at:[...]}}`. `force:true` de no-admin → `422`.

Límite conocido (v1): la protección es a nivel aplicación, sin constraint de
exclusión en MySQL. Reservas del mismo usuario en salas **distintas** no se
serializan entre sí.

## Troubleshooting

- `php artisan` falla en el host → usa `./vendor/bin/sail artisan` (mismatch de versión PHP esperado).
- API inalcanzable → revisa `sail up -d` y que nada ocupe el puerto `80`.
- Frontend sin datos → `VITE_API_URL` debe ser `http://localhost` con Sail local.
- DB en estado raro → reset total (`sail down -v ...`).
- Límite diario inesperado → el día se cuenta en `America/Bogota`, no UTC
  (ver `BookingLimits::DAY_TIMEZONE`).

## Estructura

```text
backend/    API Laravel 13 (Sail + MySQL + Mailpit). Lógica: app/Actions/CreateBookingAction.php
frontend/   SPA React + Vite (MUI + React Query). Usa VITE_API_URL
openspec/   Contrato API (specs/) + historial archivado (changes/archive/)
```
