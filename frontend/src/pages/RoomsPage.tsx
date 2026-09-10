import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { api, apiErrors } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import type { Room } from '../types/api';
import RoomDialog from './RoomDialog';

export default function RoomsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { data, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await api.get<{ data: Room[] }>('/rooms');
      return res.data.data;
    },
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((r) =>
      [r.name, r.location, String(r.capacity), r.is_active ? 'activa' : 'inactiva'].some(
        (v) => v.toLowerCase().includes(q),
      ),
    );
  }, [data, search]);

  const columns: GridColDef<Room>[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 160 },
    { field: 'capacity', headerName: 'Capacidad', width: 120, type: 'number' },
    { field: 'location', headerName: 'Ubicación', flex: 1, minWidth: 160 },
    {
      field: 'is_active',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Activa" color="success" size="small" />
        ) : (
          <Chip label="Inactiva" size="small" />
        ),
    },
    ...(isAdmin
      ? [
          {
            field: 'acciones',
            headerName: 'Acciones',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
              <Tooltip title="Editar sala">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingRoom(params.row);
                    setDialogOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          } as GridColDef<Room>,
        ]
      : []),
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Salas</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={() => {
              setEditingRoom(null);
              setDialogOpen(true);
            }}
          >
            Nueva sala
          </Button>
        )}
      </Box>
      <TextField
        label="Buscar"
        placeholder="Nombre, ubicación, capacidad o estado…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiErrors(error)}
        </Alert>
      )}
      <div style={{ height: 480, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
        />
      </div>
      <RoomDialog
        open={dialogOpen}
        room={editingRoom}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }}
      />
    </Box>
  );
}
