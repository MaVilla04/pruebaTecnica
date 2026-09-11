## Context

Ver `proposal.md` (Why). Patrón de referencia en `BookingDialog.tsx:64-72`. 6 sitios por normalizar en 4 archivos; GET/DELETE sin payload solo ganan bloque multi-línea explícito.

## Goals / Non-Goals

Goals:
- Los 6 call sites con la misma forma: payload nombrado (cuando hay), `const res`, retorno desenvuelto.

Non-Goals:
- No se cambian URLs, payloads, tipos, lógica ni manejo de errores. No capa API nueva (eso sería otro change).

## Decisions

1. **Retornar `res.data` también en `RoomDialog`.** Hoy las ramas no retornan; devolver el recurso deja la mutación tipada igual que `BookingDialog` sin cambiar comportamiento.
2. **`logout` intacto.** Sin payload, nada que separar.

## Risks / Trade-offs

- Ninguno relevante; cambio solo de forma verificado por compilador.

## Migration Plan

1. Editar 4 archivos, `tsc` + `build` + `lint`.
2. Rollback: revert.

## Open Questions

Ninguna.
