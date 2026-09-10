## ADDED Requirements

### Requirement: Admin room management UI
The system SHALL show room creation and edition controls only to users with role `admin` in the rooms page: a "Nueva sala" button and per-row "Editar" buttons. Both open the same dialog: empty for creation (`POST /api/v1/rooms`), pre-filled for edition (`PUT /api/v1/rooms/{id}`). Validation failures SHALL be shown inside the dialog and a successful save SHALL refresh the table without reloading the view. Users with role `user` SHALL NOT see either control.

#### Scenario: Admin sees management controls
- **WHEN** an admin opens the rooms page
- **THEN** the system shows the "Nueva sala" button and one "Editar" button per row

#### Scenario: Non-admin sees no management controls
- **WHEN** a user with role `user` opens the rooms page
- **THEN** the system shows the table and filters but no "Nueva sala" nor "Editar" controls

#### Scenario: Create room from dialog
- **WHEN** admin submits the dialog with `{name: "Lab C-101", capacity: 25, location: "Building C"}`
- **THEN** the system sends `POST /api/v1/rooms`, closes the dialog on `201` and shows the new room in the table without reloading the view, preserving active filters

#### Scenario: Edit room from dialog
- **WHEN** admin opens "Editar" on a row, changes `capacity` and submits
- **THEN** the system sends `PUT /api/v1/rooms/{id}`, closes the dialog on `200` and shows updated values without reloading the view

#### Scenario: Duplicate name shown inline
- **WHEN** admin submits a `name` that already exists
- **THEN** the system keeps the dialog open and shows the `422` error on the corresponding field
