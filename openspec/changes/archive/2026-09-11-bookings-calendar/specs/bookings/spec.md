## ADDED Requirements

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
