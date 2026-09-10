## Context

RoomsPage (`frontend/src/pages/RoomsPage.tsx`) hoy solo lista con `useQuery(['rooms', capacityMin, location])` + filtros y tabla MUI. Auth expone `user.role` vía `useAuth()`; errores API se muestran con `apiErrors()` de `lib/api.ts`. Backend `POST/PUT /api/v1/rooms` ya exigen admin (`RoomPolicy::create/update`) y validan (`Store/UpdateRoomRequest`). See proposal.md Why.

## Goals / Non-Goals

**Goals:**
- Crear y editar salas desde la SPA solo para admin, con un único Dialog dual y sin recargar la vista.
- Reutilizar `apiErrors`, tipos `Room` y theme MUI existentes.

**Non-Goals:**
- Cambios de backend, eliminar/desactivar salas desde UI, paginación, tests E2E.

## Decisions

- **Nuevo `src/pages/RoomDialog.tsx` aparte (no inline en RoomsPage)**: el formulario + mutación quedan aislados y testeables; RoomsPage solo guarda `dialogOpen` + `editingRoom`. Alternativa inline descartada: mezcla estado de lista y de formulario en un archivo que ya crece.
- **Un Dialog dual por prop `room: Room | null`**: `null` → `POST /rooms`; con sala → `PUT /rooms/{id}` con valores precargados vía `useEffect`. Un solo formulario evita duplicar campos y manejo de `422`. Alternativa dos componentes descartada por duplicación.
- **Refresco con `invalidateQueries(['rooms'])` en `onSuccess`**: React Query re-fetchea en background y re-renderiza filas; filtros, scroll y Dialog desmontado se conservan. Sin `location.reload` ni `navigate`. Alternativa update optimista descartada: la tabla es pequeña y el re-fetch es barato y siempre consistente.
- **Visibilidad por `user?.role === 'admin'`**: ocultar botones es UX, no seguridad (el backend responde `403` si se fuerza la llamada). El `403` se muestra inline en el Dialog vía `apiErrors`.
- **Campos espejo de `StoreRoomRequest`**: `name` (requerido), `capacity` (number ≥ 1), `location` (requerido), `is_active` (switch, default true). `user_id` nunca sale del token.

## Risks / Trade-offs

- [Ocultar ≠ autorizar] un user podría llamar el endpoint por consola → Mitigación: backend ya da `403`; el Dialog lo muestra como error.
- [Nombre duplicado] `unique:rooms,name` → Mitigación: el `422` se pinta en el campo `name` sin cerrar el Dialog.
- [Filtros activos] crear una sala que no cumple el filtro → Mitigación: aparece tras limpiar filtros; comportamiento estándar de React Query, sin mensaje extra en v1.

## Migration Plan

Solo frontend, sin migraciones: `npm run build` verde + revisión manual (`/rooms` como admin: crear 201, editar 200, duplicado 422 inline; como user: sin botones). Rollback: revert del commit.

## Open Questions

- Ninguna.
