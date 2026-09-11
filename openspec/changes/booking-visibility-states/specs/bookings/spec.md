## MODIFIED Requirements

### Requirement: Listing and cancellation
The system SHALL allow users to list own upcoming bookings (`GET /api/v1/bookings` returns only bookings with `end_at >= now` by default), include past bookings with `?include_past=1`, allow admins to list all with filters (`room_id, date, user_id`) and to force-create/override overlaps, and allow owners or admins to cancel own/all bookings. Cancelling SHALL set `status` to `cancelled` and respond `200` with the booking resource (never delete the row). Cancelling a past booking SHALL respond `422`. Overlap checks and the "max 2 per day" limit SHALL only consider bookings with `status: active`. "Calendar day" for the daily limit means UTC day. Every booking resource SHALL include `status`, `is_past` (derived, `end_at < now`) and nested `room: {id, name, location}` (null only if the room row is gone). Past bookings are displayed labeled "Finalizada".

#### Scenario: User sees only own bookings
- **WHEN** user requests `GET /api/v1/bookings`
- **THEN** system returns only upcoming bookings (`end_at >= now`) where `user_id` equals the requester

#### Scenario: History with explicit filter
- **WHEN** user requests `GET /api/v1/bookings?include_past=1`
- **THEN** system also returns past bookings, each with `is_past: true`, labeled "Finalizada"

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
