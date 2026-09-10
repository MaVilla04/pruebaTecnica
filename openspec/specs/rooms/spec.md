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
