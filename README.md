# Reserva de Salas v1

Monorepo local: `backend` (Laravel 13 API) + `frontend` (React Vite SPA).

## Quickstart

```bash
cd backend
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --seed   # admin + 3 salas + 1 reserva demo
cd ../frontend
npm install
npm run dev    # Vite :5173, usa VITE_API_URL=http://localhost
```

Demo login: `admin@example.com` / `password123`.

Reset total:

```bash
cd backend
./vendor/bin/sail down -v && ./vendor/bin/sail up -d && ./vendor/bin/sail artisan migrate --seed
```

## Contrato API

Ver `openspec/changes/reserva-salas-v1/specs/` (fuente de verdad).
Base: `http://localhost/api/v1` con Bearer Sanctum.

- `POST /register {name,email,password}` → `{data:{user,token}}`
- `POST /login` → `{data:{user:{id,name,email,role},token}}`
- `POST /logout`, `GET /me` (auth)
- `GET /rooms?capacity_min&location` | `POST/PUT/DELETE /rooms` (admin)
- `POST /bookings {room_id,start_at,end_at[,force]}` (UTC ISO-8601, max 2h, max 2/día, no-solape `[start,end)`) | `GET /bookings?room_id&date&user_id` | `DELETE /bookings/{id}`
