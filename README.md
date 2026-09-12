# Room Booking v1 (Reserva de Salas)

Local monorepo: `backend` (Laravel 13 API) + `frontend` (React + Vite SPA).

## Stack

- **Backend:** Laravel 13, PHP 8.4 via Sail, MySQL 8.4, Mailpit, Sanctum (Bearer tokens).
- **Frontend:** React 19 + Vite + TypeScript + MUI + React Query + Axios.
- **Contract:** `openspec/specs/{user-auth,rooms,bookings}/` is the source of truth.
  Archived change history lives in `openspec/changes/archive/`.

## Prerequisites

- Docker Desktop (for Sail: app on `:80`, MySQL, Mailpit).
- Node.js 20+ and npm (frontend only).
- No local PHP required. Always use Sail from `backend/`:
  `./vendor/bin/sail artisan ...` (host PHP is 8.2, container uses 8.4/8.5).

## Quickstart

### 1. Backend (from `backend/`)

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --seed   # admin + rooms + 1 demo booking
./vendor/bin/sail artisan --version        # sanity check
```

API base: `http://localhost/api/v1`.

### 2. Frontend (from `frontend/`)

```bash
npm install
npm run dev     # Vite on :5173, uses VITE_API_URL=http://localhost
npm run build   # typecheck (tsc -b) + production build
```

Env: copy `.env.example` if needed. It contains a single key:

```bash
VITE_API_URL=http://localhost
```

### 3. Demo credentials

Seeded by `database/seeders/DemoSeeder.php`:

- Email: `admin@example.com`
- Password: `password123` (role `admin`)

### Full reset

```bash
cd backend
./vendor/bin/sail down -v && ./vendor/bin/sail up -d && ./vendor/bin/sail artisan migrate --seed
```

## API contract (summary)

Auth: Bearer Sanctum token. Errors shape: `{message, errors}` (401 no token, 403 policy, 422 validation).

- `POST /register {name,email,password}` → `{data:{user,token}}`
- `POST /login {email,password}` → `{data:{user:{id,name,email,role},token}}`
- `POST /logout`, `GET /me` (auth required)
- `GET /rooms?capacity_min&location` (users see active only, admins see all)
- `POST / PUT / DELETE /rooms` (admin only)
- `POST /bookings {room_id,start_at,end_at[,force]}` — UTC ISO-8601, max 2h
  (`MAX_DURATION_MINUTES=120`), max 5/day per user in `America/Bogota` day
  (`MAX_PER_DAY=5`), no overlap on `[start,end)`, `force:true` admin-only override
- `GET /bookings?room_id&date&user_id` (non-admins only see their own)
- `DELETE /bookings/{id}` (soft cancel: `status=cancelled`; cancelled slots are re-bookable)

## Concurrency: how double booking is prevented

Single choke point: `backend/app/Actions/CreateBookingAction.php` (`execute()`).

1. `DB::transaction()` + `Room::whereKey($roomId)->lockForUpdate()->firstOrFail()` serializes
   concurrent `POST /bookings` for the **same room**.
2. Inside the lock it checks: admin `force` flag, room `is_active`, duration ≤ 2h,
   daily limit (5/day, Bogota day window via `BookingLimits::dayWindowForInstant()`),
   then `Booking::overlapsQuery()` (`backend/app/Models/Booking.php:51-61`):
   `status=active` + `(room_id = ? OR user_id = ?)` + `start_at < end AND end_at > start`
   (interval `[start,end)`, so adjacent slots are allowed).
3. Overlap → `422 {errors:{start_at:[...]}}`. Admin `force:true` skips the room-active
   and overlap guards; non-admin `force:true` → `422`.

Limitations (by design, MySQL has no exclusion constraint):

- Protection is application-level (transaction + row lock). There is no DB-level
  unique/exclusion constraint on the time range — only performance indexes on
  `(room_id,start_at,end_at)` and `(user_id,start_at,end_at)`.
- Same-room races serialize correctly. Same-user bookings in **different** rooms lock
  different `rooms` rows, so that race is not fully serialized.
- Existing automated coverage is sequential only:
  `backend/tests/Feature/BookingOverlapTest.php` (action-level overlap/adjacent/daily-limit)
  and `backend/tests/Feature/BookingTest.php` (HTTP 422/201, admin override, cancelled re-book).
  The parallel test below is manual (commands only, nothing to install).

## Concurrency: manual parallel test (copy-paste)

Requires the backend running and seeded. All commands run from any shell with `curl` + `python3`.

```bash
# 1. Login and save the token
TOKEN=$(curl -s -X POST http://localhost/api/v1/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
echo "$TOKEN"

# 2. Pick a room (use id 1, or take one from the list)
curl -s http://localhost/api/v1/rooms -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
ROOM_ID=1

# 3. Choose a FUTURE free slot (UTC ISO-8601). Adjust the date so it is free.
START="2030-01-15T14:00:00Z"
END="2030-01-15T15:00:00Z"

# 4. Fire two identical bookings in parallel; expect exactly one 201 and one 422
curl -s -o /tmp/book_a.json -w "A:%{http_code}\n" -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"room_id\":$ROOM_ID,\"start_at\":\"$START\",\"end_at\":\"$END\"}" &
curl -s -o /tmp/book_b.json -w "B:%{http_code}\n" -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"room_id\":$ROOM_ID,\"start_at\":\"$START\",\"end_at\":\"$END\"}" &
wait
cat /tmp/book_a.json; echo
cat /tmp/book_b.json; echo
```

Expected: one response `201` (booking created), the other `422` with
`errors.start_at = ["The selected time slot overlaps another booking."]`.
Either A or B can win — that is the point (only one wins).

```bash
# 5. Adjacent slots must both succeed ([start,end) semantics)
curl -s -o /dev/null -w "adj1:%{http_code}\n" -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"room_id\":$ROOM_ID,\"start_at\":\"2030-01-15T15:00:00Z\",\"end_at\":\"2030-01-15T16:00:00Z\"}"
curl -s -o /dev/null -w "adj2:%{http_code}\n" -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"room_id\":$ROOM_ID,\"start_at\":\"2030-01-15T16:00:00Z\",\"end_at\":\"2030-01-15T17:00:00Z\"}"

# 6. Admin override (optional): force:true over an taken slot returns 201
curl -s -X POST http://localhost/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"room_id\":$ROOM_ID,\"start_at\":\"$START\",\"end_at\":\"$END\",\"force\":true}" \
  | python3 -m json.tool
```

Cleanup: `DELETE /bookings/{id}` sets `status=cancelled`, freeing the slot
(`GET /tmp/book_*.json` contains the winning `id`).

## Tests and lint

```bash
cd backend
./vendor/bin/sail artisan test        # PHPUnit/Pest suite (overlap coverage is sequential)
./vendor/bin/sail artisan test --filter=BookingOverlap
./vendor/bin/sail pint --test         # lint, no writes
./vendor/bin/sail pint                # lint + fix (run before commit)

cd ../frontend
npm run build                         # tsc + vite build
```

## Troubleshooting

- `php artisan` fails on host → use `./vendor/bin/sail artisan` (PHP version mismatch is expected).
- API unreachable → check `sail up -d` state and that nothing else occupies port `80`.
- `VITE_API_URL` wrong → frontend calls fail; it must be `http://localhost` for local Sail.
- Stale DB state → full reset (`sail down -v ...`, deletes the MySQL volume).
- Daily-limit surprises → the day is counted in `America/Bogota`, not UTC
  (see `BookingLimits::DAY_TIMEZONE`).

## Project structure

```text
backend/    Laravel 13 API (Sail + MySQL + Mailpit). Booking logic: app/Actions/CreateBookingAction.php
frontend/   React Vite SPA (MUI + React Query). Uses VITE_API_URL
openspec/   API contract (specs/) + archived change history (changes/archive/)
docs/       AI guidance (AI-CONTEXT.md) and other project notes
```
