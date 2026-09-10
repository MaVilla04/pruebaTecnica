# Rooms Specification

## Purpose

Allows admins to manage computer rooms (name, capacity, location, active flag) so users can discover and book them.

## Requirements

### Requirement: Admin can manage rooms
The system SHALL allow users with role `admin` to create, update and deactivate rooms. Room fields are `name` (unique, required), `capacity` (integer >= 1, required), `location` (string, required), `is_active` (boolean, default true).

#### Scenario: Admin creates a room
- **WHEN** admin sends `POST /api/v1/rooms` with `{name: "Lab B-201", capacity: 20, location: "Building B - Floor 2"}`
- **THEN** system responds `201` with the created room resource including `is_active: true`

#### Scenario: Non-admin cannot manage rooms
- **WHEN** a user with role `user` sends `POST /api/v1/rooms`
- **THEN** system responds `403`

#### Scenario: Duplicate room name rejected
- **WHEN** admin creates a room with an existing `name`
- **THEN** system responds `422` with `{message, errors: {name: [...]}}`

### Requirement: Anyone authenticated can list active rooms
The system SHALL expose `GET /api/v1/rooms` with optional filters `capacity_min` and `location`, returning only rooms where `is_active` is true for role `user`, and all rooms for role `admin`.

#### Scenario: User filters by capacity
- **WHEN** user requests `GET /api/v1/rooms?capacity_min=20`
- **THEN** system returns only active rooms with `capacity >= 20`

#### Scenario: Inactive rooms hidden from users
- **WHEN** user requests `GET /api/v1/rooms`
- **THEN** system excludes rooms with `is_active: false`

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

### Requirement: Rooms grid in Spanish with status chip
The system SHALL render the rooms list as a data grid with Spanish column headers (Nombre, Capacidad, Ubicación, Estado and Acciones for admins), where Estado is shown as a colored chip (Activa/Inactiva) instead of plain text.

#### Scenario: Spanish grid with chips
- **WHEN** any authenticated user opens the rooms page
- **THEN** the system shows a grid with headers Nombre, Capacidad, Ubicación, Estado and each row shows Estado as a chip reflecting `is_active`

### Requirement: Admin edit action with tooltip
The system SHALL show an Acciones column with an edit icon button and hover tooltip only to admins; users with role `user` SHALL see no Acciones column.

#### Scenario: Tooltip on edit
- **WHEN** an admin hovers the edit action
- **THEN** the system shows a tooltip describing the action

#### Scenario: No actions for users
- **WHEN** a user with role `user` opens the rooms page
- **THEN** the system shows no Acciones column

### Requirement: Unified client-side search
The system SHALL provide a single search box that filters the loaded rows by any visible value (name, location, capacity, status), replacing the separate capacity/location filters.

#### Scenario: Search by any value
- **WHEN** the user types "B-201" or "20" in the search box
- **THEN** the system shows only rows matching that value in any column

### Requirement: Reordered dialog layout
The system SHALL show the room dialog fields in order name, location, then capacity side-by-side with the active switch, with enough padding that outlined labels are never clipped.

#### Scenario: Dialog order and padding
- **WHEN** an admin opens the room dialog
- **THEN** the system shows Nombre, Ubicación, then Capacidad next to the Activa switch, with no clipped labels

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
