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
The system SHALL enforce `start_at < end_at`, max duration 2 hours, max 2 active bookings per user per calendar day, `start_at` in the future, and reject bookings on inactive rooms.

#### Scenario: Duration over 2h rejected
- **WHEN** user requests a 3-hour slot
- **THEN** system responds `422` on `end_at`

#### Scenario: Third booking same day rejected
- **WHEN** user already has 2 active bookings today and requests a third
- **THEN** system responds `422`

#### Scenario: Booking on inactive room rejected
- **WHEN** user requests a room with `is_active: false`
- **THEN** system responds `422` on `room_id`

### Requirement: Listing and cancellation
The system SHALL allow users to list own bookings (`GET /api/v1/bookings`), admins to list all with filters (`room_id, date, user_id`) and to force-create/override overlaps, and owners or admins to cancel own/all bookings.

#### Scenario: User sees only own bookings
- **WHEN** user requests `GET /api/v1/bookings`
- **THEN** system returns only bookings where `user_id` equals the requester

#### Scenario: Admin override allowed
- **WHEN** admin creates a booking with `force: true` overlapping an existing one
- **THEN** system responds `201`

#### Scenario: Contract shape
- **WHEN** client sends `POST /api/v1/bookings` with `{room_id: 1, start_at: "2026-09-10T09:00:00Z", end_at: "2026-09-10T11:00:00Z"}`
- **THEN** success is `201 {data: {id, room_id, user_id, start_at, end_at}}` and failure is `422 {message, errors}`

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
