## ADDED Requirements

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
