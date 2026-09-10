## ADDED Requirements

### Requirement: Reservar action per room row
The system SHALL show a "Reservar" action per row in the rooms list to all authenticated users. For users with role `user` the action SHALL be disabled with an explanatory tooltip on rows where `is_active` is false. For users with role `admin` the action SHALL always be enabled (admins can force bookings on inactive rooms). Activating the action SHALL open the booking dialog with that room pre-selected.

#### Scenario: User sees Reservar on active rooms
- **WHEN** a user with role `user` opens the rooms page
- **THEN** the system shows one "Reservar" action per row, enabled on active rooms

#### Scenario: Reservar disabled on inactive rooms for users
- **WHEN** a user with role `user` views a row with `is_active: false`
- **THEN** the system shows the "Reservar" action disabled with a tooltip explaining the room is inactive

#### Scenario: Admin can trigger Reservar on any room
- **WHEN** an admin views a row with `is_active: false`
- **THEN** the system shows the "Reservar" action enabled

#### Scenario: Reservar opens dialog with room pre-selected
- **WHEN** any authenticated user activates "Reservar" on a row
- **THEN** the system opens the booking dialog with that room already selected
