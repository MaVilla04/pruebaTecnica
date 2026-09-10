## 1. Scaffold + base docs

- [x] 1.1 Bootstrap backend via `curl -s "https://laravel.build/backend?php=84&with=mysql,mailpit" | bash`, mover a `/backend`, verificar `sail up -d` levanta app+mysql
- [x] 1.2 Crear `AGENTS.md` raíz con comandos Sail (`sail up -d`, `sail artisan migrate`, `sail pint`), estructura `/backend` `/frontend` y `VITE_API_URL`, verificar lectura en 1 min
- [x] 1.3 Instalar Sanctum + Pint en backend y verificar `sail artisan --version` y `sail pint --test` pasan

## 2. Backend auth + rooms

- [x] 2.1 Migraciones `users(role admin|user)`, `rooms(name unique, capacity, location, is_active)` + modelos y verificar `sail artisan migrate` OK
- [x] 2.2 Auth Sanctum `register/login/logout/me` + `RoomPolicy` y verificar login devuelve token y `POST /api/v1/rooms` como user da 403
- [x] 2.3 CRUD rooms con FormRequest + Resource + filtros `capacity_min,location` y verificar Pest/PHPUnit cubre crear, duplicado 422 y oculto inactivo

## 3. Backend bookings (núcleo)

- [x] 3.1 Migración `bookings(user_id, room_id, start_at, end_at)` con índices + `NoOverlapRule` + `CreateBookingAction` y verificar test unitario de overlap (solape misma sala rechaza, adyacente permite)
- [x] 3.2 `StoreBookingRequest` con límites (start<end, max 2h, futuro, sala activa, max 2/día) + endpoints list/cancel + override admin `force:true` y verificar suite de 7 casos del spec pasa
- [x] 3.3 `BookingPolicy` + Resources + formato error `{message,errors}` y verificar `GET /bookings` filtra por owner y `DELETE` ajeno da 403

## 4. Frontend base + integración

- [x] 4.1 Scaffold Vite React-TS + MUI + React Query con `tsconfig strict:true` base, `types/api.ts` (Room, Booking, User) y verificar `npm run build` pasa
- [x] 4.2 Páginas login, salas (tabla + filtro capacidad) y mis reservas (crear/cancelar) contra `VITE_API_URL` y verificar flujo manual: login → reservar 09-11 → solape 10-12 da 422 visible → 12-14 da 201
- [x] 4.3 Seed demo (admin, 3 salas, 1 reserva) + README quickstart y verificar reset `sail down -v && sail up -d && sail artisan migrate --seed` deja app usable
