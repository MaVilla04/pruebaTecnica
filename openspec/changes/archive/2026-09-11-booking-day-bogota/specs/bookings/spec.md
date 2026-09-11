## MODIFIED Requirements

### Requirement: Fair-use limits
The system SHALL enforce `start_at < end_at`, max duration 2 hours, max 5 active bookings per user per calendar day, `start_at` in the future, and reject bookings on inactive rooms. "Calendar day" means the day in `America/Bogota` containing the requested `start_at`; only bookings whose `start_at` falls inside that day window count toward the limit.

#### Scenario: Duration over 2h rejected
- **WHEN** user requests a 3-hour slot
- **THEN** system responds `422` on `end_at`

#### Scenario: Third booking same day rejected
- **WHEN** user already has 5 active bookings today (Bogota day) and requests a sixth
- **THEN** system responds `422`

#### Scenario: Daily count follows the Bogota day
- **WHEN** user holds a booking at `01:44 UTC` (which is `20:44` of the previous day in Bogota) and requests 5 same-day Bogota slots
- **THEN** the `01:44 UTC` booking counts toward the previous Bogota day and the 5 new slots respond `201`

#### Scenario: Booking on inactive room rejected
- **WHEN** user requests a room with `is_active: false`
- **THEN** system responds `422` on `room_id`

### Requirement: Listing and cancellation
The system SHALL allow users to list own upcoming bookings (`GET /api/v1/bookings` returns only bookings with `end_at >= now` by default), include past bookings with `?include_past=1`, allow admins to list all with filters (`room_id, date, user_id`) and to force-create/override overlaps, and allow owners or admins to cancel own/all bookings. Cancelling SHALL set `status` to `cancelled` and respond `200` with the booking resource (never delete the row). Cancelling a past booking SHALL respond `422`. Overlap checks and the "max 5 per day" limit SHALL only consider bookings with `status: active`. "Calendar day" for the daily limit and for the `date` filter means the day in `America/Bogota`. Every booking resource SHALL include `status`, `is_past` (derived, `end_at < now`) and nested `room: {id, name, location}` (null only if the room row is gone). Past bookings are displayed labeled "Finalizada".

#### Scenario: User sees only own bookings
- **WHEN** user requests `GET /api/v1/bookings`
- **THEN** system returns only upcoming bookings (`end_at >= now`) where `user_id` equals the requester

#### Scenario: History with explicit filter
- **WHEN** user requests `GET /api/v1/bookings?include_past=1`
- **THEN** system also returns past bookings, each with `is_past: true`, labeled "Finalizada"

#### Scenario: Date filter follows the Bogota day
- **WHEN** user requests `GET /api/v1/bookings?date=2026-09-10`
- **THEN** system returns bookings whose `start_at` falls inside `2026-09-10` in `America/Bogota` (i.e. `05:00 UTC 09-10` to `05:00 UTC 09-11`)

#### Scenario: Cancel keeps the row
- **WHEN** owner sends `DELETE /api/v1/bookings/{id}` on an upcoming booking
- **THEN** system responds `200` with the resource including `status: "cancelled"` and the row still exists

#### Scenario: Cancel past booking rejected
- **WHEN** owner sends `DELETE /api/v1/bookings/{id}` on a booking with `end_at < now`
- **THEN** system responds `422`

#### Scenario: Cancelled bookings do not block
- **WHEN** user cancelled a slot and requests the same slot again
- **THEN** overlap check and daily count ignore the cancelled booking

#### Scenario: Admin override allowed
- **WHEN** admin creates a booking with `force: true` overlapping an existing one
- **THEN** system responds `201`

#### Scenario: Contract shape
- **WHEN** client sends `POST /api/v1/bookings` with `{room_id: 1, start_at: "2026-09-10T09:00:00Z", end_at: "2026-09-10T11:00:00Z"}`
- **THEN** success is `201 {data: {id, room_id, user_id, start_at, end_at, status, is_past, room: {id, name, location}}}` and failure is `422 {message, errors}`
