## Why

La página de salas se ve plana y genérica: tabla MUI básica con columnas en inglés, estado como texto `yes/no`, botón "Editar" de texto y dos filtros separados. El dialog tiene los campos en orden poco natural y riesgo de labels cortados. Para una prueba técnica que se comparte como evidencia, la UI debe sentirse producto.

## What Changes

- Tabla migrada a DataGrid (`@mui/x-data-grid`, nueva dependencia) con columnas en español: Nombre, Capacidad, Ubicación, Estado, Acciones.
- Columna Estado como `Chip` (Activa verde / Inactiva gris) y columna Acciones (solo admin) con `IconButton` de editar + `Tooltip`.
- Filtros de capacidad/ubicación unificados en una barra de búsqueda que filtra en cliente por cualquier valor de la fila.
- Dialog reordenado (nombre → ubicación → fila capacidad + switch activo/inactivo) con padding que evita labels cortados.
- Sin cambios de backend ni de contrato API.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `rooms`: la UI de salas cambia a DataGrid en español con Chip de estado, acciones admin con tooltip, búsqueda unificada en cliente y dialog reordenado. El contrato API no cambia.

## Impact

- Solo `/frontend`: `RoomsPage.tsx`, `RoomDialog.tsx`, más `package.json`/`package-lock.json` por `@mui/x-data-grid`. Sin migraciones ni endpoints.
- Bundle crece (~peso DataGrid); aceptable para el polish visual en v1 local.
