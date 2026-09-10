## Purpose

Allows admins to manage computer rooms (name, capacity, location, active flag) so users can discover and book them.

## ADDED Requirements

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
