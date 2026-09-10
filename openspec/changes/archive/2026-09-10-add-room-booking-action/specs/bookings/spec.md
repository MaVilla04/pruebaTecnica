## ADDED Requirements

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
