## Purpose

Provides email/password authentication with Sanctum tokens and role-based authorization distinguishing admins from regular users.

## ADDED Requirements

### Requirement: Registration and login with Sanctum
The system SHALL support `POST /api/v1/register` (`name, email unique, password min 8`), `POST /api/v1/login` (returns Bearer token), `POST /api/v1/logout` (revokes current token) and `GET /api/v1/me` (current user with `role`).

#### Scenario: Successful login
- **WHEN** user sends valid `email` and `password` to `POST /api/v1/login`
- **THEN** system responds `200` with `{data: {user: {id, name, email, role}, token}}`

#### Scenario: Invalid credentials
- **WHEN** user sends wrong password to `POST /api/v1/login`
- **THEN** system responds `422` with `{message, errors}`

### Requirement: Role-based authorization
The system SHALL assign default role `user` on registration, protect all `/api/v1/rooms` (write) and `/api/v1/bookings` routes with `auth:sanctum`, and enforce via Policy that only `admin` manages rooms/all bookings while `user` manages only own bookings.

#### Scenario: Unauthenticated access denied
- **WHEN** anonymous client requests `GET /api/v1/bookings`
- **THEN** system responds `401`

#### Scenario: User cannot delete another user's booking
- **WHEN** user A sends `DELETE /api/v1/bookings/{id of user B}`
- **THEN** system responds `403`
