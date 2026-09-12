# AI Context — Room Booking v1

How AI assistance was guided on this repo.

## 1. System instructions given to the AI

- Stack is fixed: Laravel 13 API (`backend`, PHP 8.4 via Sail + MySQL 8.4) and
  React Vite + TS + MUI + React Query (`frontend`). Do not introduce new
  frameworks or change the auth scheme (Sanctum Bearer, `/api/v1`).
- Contract first: `openspec/specs/{user-auth,rooms,bookings}/spec.md` is the source
  of truth. Archived decisions live in `openspec/changes/archive/`. If code and
  spec disagree, flag it instead of silently changing behavior.
- Backend conventions (enforced): thin controllers, validation in `FormRequest`,
  output via `ApiResource`, authorization via `Policy`, business rules in
  `app/Actions/` + `app/Support/` constants. Dates are UTC ISO-8601 on the wire;
  the frontend converts to local time. DB table names in English.
- Environment rules: never use host `php artisan` (host is PHP 8.2); always
  `./vendor/bin/sail artisan` from `backend/`. Run `sail pint` before commit.
  Frontend env is a single key: `VITE_API_URL=http://localhost`.
- Concurrency honesty: MySQL has no range-exclusion constraint here, so the
  anti-double-booking guarantee is application-level (`DB::transaction` +
  `lockForUpdate` + overlap check). Document limits instead of claiming
  full serializability.

## 2. Main prompts used (in order)

1. `Propose the room-booking change with OpenSpec artifacts (proposal, specs for
   rooms/bookings/user-auth, design, tasks).` → produced the contract under
   `openspec/` (now archived + synced to `openspec/specs/`).
2. `Implement the backend following thin-controller / FormRequest / Resource /
   Policy conventions; centralize booking rules in CreateBookingAction with
   BookingLimits constants; cover overlap, adjacent slots, daily limit and
   admin force with sequential tests.` → produced `app/Actions/CreateBookingAction.php`,
   `app/Models/Booking.php::overlapsQuery`, `app/Support/BookingLimits.php`,
   `BookingOverlapTest.php`, `BookingTest.php`.
3. `Build the frontend pages (rooms, booking calendar/history) with React Query
   and explicit API calls; convert UTC to local for display.` → produced the
   `frontend/src/` pages and API layer.
4. `Review the race: what does lockForUpdate on rooms actually serialize, and
   what remains racy? Write it up honestly without adding new infrastructure.`
   → documented same-room vs. same-user-different-room behavior in `README.md`.
5. `Write the final docs: root README with install/run/parallel-curl
   concurrency test, plus this AI context file.` → this change (docs only).

## 3. How the AI was asked to structure code

- `BookingController@store` delegates to `CreateBookingAction::execute()`
  (single choke point, wrapped in `DB::transaction`).
- Overlap predicate lives once in `Booking::overlapsQuery()`:
  `status=active` + `(room_id OR user_id)` + `start_at < end AND end_at > start`,
  i.e. `[start,end)` so adjacent bookings are legal.
- Tunables live once in `BookingLimits` (`MAX_DURATION_MINUTES=120`,
  `MAX_PER_DAY=5`, `DAY_TIMEZONE=America/Bogota` with UTC day-window helpers).
- Cancel is soft (`status=cancelled`); cancelled rows are ignored by overlap
  and daily-limit queries, so the slot becomes re-bookable.
- Tests mirror the structure: action-level (`BookingOverlapTest`) for the pure
  rule matrix, HTTP-level (`BookingTest`) for status codes and error shape
  `{message, errors}`.

## 4. Guardrails and limits

- AI was told not to add DB triggers, raw exclusion constraints, queues, or
  new scripts for the concurrency demo — the manual test is parallel `curl`
  only (see `README.md`, no new dependencies).
- Known accepted gap: same-user bookings in different rooms lock different
  `rooms` rows and can race. Fixing it (e.g. user-level lock or serialized
  insert guard) was deliberately left out of scope for v1.
- Verify docs changes with: `sail pint --test`, `sail artisan test
  --filter=BookingOverlap`, `npm run build`.
