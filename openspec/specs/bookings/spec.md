# Bookings Specification

## Purpose

Lets users reserve computer rooms by time slot while preventing double-booking of rooms or users and enforcing fair-use limits.

## Requirements

### Requirement: Booking creation with overlap validation
The system SHALL reject a booking when its `[start_at, end_at)` overlaps any existing non-cancelled booking for the same `room_id` OR for the same `user_id` (even in a different room). Overlap test is `new.start_at < existing.end_at AND new.end_at > existing.start_at`. Adjacent slots (`new.start_at == existing.end_at`) SHALL be allowed.

#### Scenario: Overlapping same room rejected
- **WHEN** room A has booking `09:00-11:00` and any user requests room A `10:00-12:00`
- **THEN** system responds `422` with error on `start_at`

#### Scenario: Same user overlapping different room rejected
- **WHEN** user Juan has booking in room A `09:00-11:00` and requests room B `10:00-12:00`
- **THEN** system responds `422`

#### Scenario: Non-overlapping same day allowed
- **WHEN** user Juan has booking `09:00-11:00` and requests `12:00-14:00` (same or different room)
- **THEN** system responds `201` with the booking resource

#### Scenario: Adjacent slots allowed
- **WHEN** existing booking is `09:00-11:00` and request is `11:00-13:00`
- **THEN** system responds `201`

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

### Requirement: Unified booking dialog with admin force
The system SHALL provide a single booking dialog used both from the rooms list (room pre-selected) and from the bookings page (room selectable) to create bookings via `POST /api/v1/bookings` with `{room_id, start_at, end_at}` in UTC ISO-8601. The dialog SHALL show validation failures (`422`) inline without closing, and on success (`201`) SHALL close and refresh the bookings list without reloading the view. The dialog SHALL show a "Forzar" checkbox only to users with role `admin`; when checked the request SHALL include `force: true`. Users with role `user` SHALL never send `force`.

#### Scenario: Create booking from rooms dialog
- **WHEN** a user submits the dialog with `{room_id: 3, start_at: "2026-09-10T09:00:00Z", end_at: "2026-09-10T11:00:00Z"}`
- **THEN** the system sends `POST /api/v1/bookings`, closes the dialog on `201` and shows the new booking without reloading the view

#### Scenario: Overlap shown inline
- **WHEN** a user submits a slot overlapping another booking
- **THEN** the system keeps the dialog open and shows the `422` error on the corresponding field

#### Scenario: Force visible only to admins
- **WHEN** an admin opens the booking dialog
- **THEN** the system shows the "Forzar" checkbox, and when checked sends `force: true`
- **WHEN** a user with role `user` opens the booking dialog
- **THEN** the system shows no "Forzar" checkbox and never sends `force`

#### Scenario: Bookings page uses the same dialog
- **WHEN** a user activates "Nueva reserva" on the bookings page
- **THEN** the system opens the same booking dialog with a room selector instead of the previous inline form

### Requirement: Bookings page shows room names, status and history
The system SHALL render the bookings page with a Sala column showing the room `name` (falling back to `Sala #<room_id>` when `room` is null), an Ubicación column showing the room `location` (`—` when `room` is null), an Estado column with a colored chip (`Activa` for active upcoming, `Cancelada` for cancelled, `Finalizada` for past), and a Cancelar action styled as an outlined error button, enabled only for active upcoming bookings and disabled while the request is pending. Cancellation failures SHALL be shown in an error alert without losing the list. The page SHALL offer a Próximas/Historial toggle that queries `GET /api/v1/bookings` with `?include_past=1` for history.

#### Scenario: Room shown by name
- **WHEN** a booking arrives with `room: {name: "Atlas", location: "Piso 2"}`
- **THEN** the grid shows "Atlas" in Sala and "Piso 2" in Ubicación instead of the numeric `room_id`

#### Scenario: Status chips
- **WHEN** bookings are active upcoming, cancelled, and past
- **THEN** the grid shows chips Activa, Cancelada and Finalizada respectively

#### Scenario: Cancel disabled when not applicable
- **WHEN** a row is cancelled or past
- **THEN** its Cancelar button is disabled

#### Scenario: Cancel failure shown inline
- **WHEN** cancelling fails (e.g. `422` on a past booking)
- **THEN** the page shows the error in an alert and keeps the list visible

#### Scenario: History toggle
- **WHEN** the user activates Historial
- **THEN** the page queries with `?include_past=1` and shows past bookings; deactivating returns to upcoming only

### Requirement: Bookings calendar

The system SHALL offer a monthly calendar view on the bookings page, in read-only mode, showing bookings as events on their local day. A user with role `user` SHALL see only their own bookings; a user with role `admin` SHALL see all bookings. The calendar SHALL include finished (`is_past`) and cancelled bookings. The list view SHALL remain unchanged (detail grid, cancel action, create dialog, Upcoming/History toggle), and creating or cancelling bookings from the calendar SHALL NOT be supported.

#### Scenario: User sees own bookings including finished

- **WHEN** a user with role `user` opens the calendar view
- **THEN** the system shows only bookings where `user_id` equals the requester, including bookings with `is_past: true` and with `status: "cancelled"`

#### Scenario: Admin sees all bookings

- **WHEN** a user with role `admin` opens the calendar view
- **THEN** the system shows bookings from all users, including finished and cancelled ones

#### Scenario: Events show local day, room and status

- **WHEN** the calendar renders a booking with `start_at` in UTC
- **THEN** the event appears on the local calendar day with the local time, the room name (or `Sala #<room_id>` fallback) and the same status as the list view (`Activa`, `Cancelada`, `Finalizada`)

#### Scenario: Calendar is read-only

- **WHEN** the user clicks a calendar day or event
- **THEN** the system does not open the create dialog nor offer cancellation; creating and cancelling remain available only in the list view
