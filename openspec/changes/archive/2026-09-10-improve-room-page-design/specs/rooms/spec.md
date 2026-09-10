## ADDED Requirements

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
