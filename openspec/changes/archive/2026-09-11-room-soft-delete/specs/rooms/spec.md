## MODIFIED Requirements

### Requirement: Admin can manage rooms
The system SHALL allow users with role `admin` to create, update, deactivate and delete rooms. Room fields are `name` (unique, required), `capacity` (integer >= 1, required), `location` (string, required), `is_active` (boolean, default true). Deleting a room SHALL be a soft delete: the row is preserved, hidden from all listings, and all of its bookings are preserved. Deactivation (`is_active: false`) remains a separate concept from deletion.

#### Scenario: Admin creates a room
- **WHEN** admin sends `POST /api/v1/rooms` with `{name: "Lab B-201", capacity: 20, location: "Building B - Floor 2"}`
- **THEN** system responds `201` with the created room resource including `is_active: true`

#### Scenario: Non-admin cannot manage rooms
- **WHEN** a user with role `user` sends `POST /api/v1/rooms`
- **THEN** system responds `403`

#### Scenario: Duplicate room name rejected
- **WHEN** admin creates a room with an existing `name`
- **THEN** system responds `422` with `{message, errors: {name: [...]}}`

#### Scenario: Delete hides room but preserves row and bookings
- **WHEN** admin sends `DELETE /api/v1/rooms/{id}` on a room with bookings
- **THEN** system responds `204`, the room no longer appears in `GET /api/v1/rooms` (not even for admins), `GET /api/v1/rooms/{id}` responds `404`, and all of its bookings still exist

#### Scenario: Deleted rooms excluded from listings
- **WHEN** admin requests `GET /api/v1/rooms` after deleting a room
- **THEN** system excludes the deleted room from the response
