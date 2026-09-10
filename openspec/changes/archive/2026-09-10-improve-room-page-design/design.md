## Context

RoomsPage es tabla MUI plana (columnas en inglés, `yes/no`, botón Editar texto, dos filtros server-side); RoomDialog apila nombre/capacidad/ubicación/switch con `DialogContent` sin padding extra. Theme MUI institucional ya existe (`src/theme.ts`). See proposal.md Why. Sin cambios backend.

## Goals / Non-Goals

**Goals:**
- Grid con aspecto DataGrid en español, Chip de estado, IconButton+Tooltip solo admin, búsqueda única en cliente, dialog reordenado sin labels cortados.

**Non-Goals:**
- Paginación servidor, ordenamiento backend, cambios API, tests E2E.

## Decisions

- **`@mui/x-data-grid` (MIT) + `@mui/icons-material` como grid**: columnas ES, `renderCell` para Chip e IconButton de editar, toolbar/sorting/pagination gratis. Icons-material provee el icono del IconButton (estándar MUI). Alternativa (estilizar `Table`) descartada: el usuario pidió DataGrid y aporta sorting/paginación sin código.
- **Búsqueda en cliente sobre filas cargadas**: un `TextField` filtra en memoria por nombre/ubicación/capacidad/estado; se retiran `capacity_min/location` del query. Dataset de salas pequeño, evita roundtrips y un cambio backend. Alternativa `?search=` servidor descartada por sobre-ingeniería.
- **Acciones solo admin vía `user?.role`**: ocultar columna es UX; el `403` backend sigue mandando. Tooltip MUI en el IconButton.
- **Dialog: orden nombre → ubicación → `Box flex` (capacidad + switch)** y `DialogContent sx` con padding/overflow que evita el corte de labels outlined en la animación. Campos espejo de `StoreRoomRequest`, sin cambios.
- **Columna Estado con `Chip` del theme** (`success` Activa, `default` Inactiva): usa semáforo MUI, no azules de marca.

## Risks / Trade-offs

- [Bundle] DataGrid suma peso (~+150-200kB gzip del chunk) → Mitigación: aceptable en v1 local; el warning de chunk ya existe por MUI.
- [Filtros server retirados] si las salas crecen a miles, cliente no escala → Mitigación: volver a `?search=` servidor; documentado en propuesta.
- [Labels cortados] animación Dialog + outlined → Mitigación: paddingTop/overflow visible en content + revisión visual.

## Migration Plan

Solo frontend: `npm i @mui/x-data-grid`, editar `RoomsPage.tsx` + `RoomDialog.tsx`, `npm run build` verde, revisión visual (`/rooms` admin/user, dialog crear/editar). Rollback: revert del/los commits.

## Open Questions

- Ninguna.
