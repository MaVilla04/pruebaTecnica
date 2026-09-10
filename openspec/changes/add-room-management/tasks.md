## 1. Dialog de salas

- [x] 1.1 Crear `frontend/src/pages/RoomDialog.tsx` con Dialog MUI (campos name, capacity, location, switch is_active), precarga por `room` y mutación POST/PUT con error inline vía `apiErrors`, y verificar `npx tsc --noEmit` pasa
- [ ] 1.2 Cablear `RoomsPage.tsx` (botón "Nueva sala" + columna "Editar" solo admin con `user?.role`, estado dialogOpen/editingRoom, `invalidateQueries(['rooms'])` al guardar) y verificar `npm run build` pasa

## 2. Verificación

- [ ] 2.1 Revisar manual como admin en `/rooms`: crear sala → 201 y aparece sin recarga; editar → 200; nombre duplicado → 422 inline sin cerrar; como user: sin botones ni columna, y verificar filtros conservados tras guardar
