import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, IconButton, TextField, Tooltip } from '@mui/material';
import PageTitle from '../components/PageTitle';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import type { GridColDef } from '@mui/x-data-grid';
import AppDataGrid from '../components/AppDataGrid';
import BookingDialog from '../components/BookingDialog';
import { api, apiErrors } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import type { Room } from '../types/api';
import RoomDialog from '../components/RoomDialog';

export default function RoomsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

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
    {
      field: 'reservar',
      headerName: 'Reservar',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const inactive = !params.row.is_active;
        const disabled = inactive && !isAdmin;
        const title = disabled
          ? 'Sala inactiva'
          : inactive
            ? 'Reservar (forzar disponible)'
            : 'Reservar sala';
        return (
          <Tooltip title={title}>
              <IconButton
                sx={{ color: 'primary.main' }}
                size="small"
                disabled={disabled}
                onClick={() => {
                  setBookingRoom(params.row);
                  setBookingOpen(true);
                }}
              >
                <EventAvailableIcon />
              </IconButton>
          </Tooltip>
        );
      },
    } as GridColDef<Room>,
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
                  sx={{ color: 'primary.main' }}
                  size="small"
                  onClick={() => {
                    setEditingRoom(params.row);
                    setDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ),
          } as GridColDef<Room>,
        ]
      : []),
  ];

  return (
    <Box>
      <PageTitle>Salas</PageTitle>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        <TextField
          label="Buscar"
          placeholder="Nombre, ubicación, capacidad o estado…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '30%', mb: 2 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiErrors(error)}
        </Alert>
      )}

      <AppDataGrid<Room>
        rows={rows}
        columns={columns}
      />

      <RoomDialog
        open={dialogOpen}
        room={editingRoom}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }}
      />

      <BookingDialog
        open={bookingOpen}
        initialRoomId={bookingRoom?.id}
        lockRoom
        onClose={() => setBookingOpen(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }}
      />
    </Box>
  );
}
