import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import AppDataGrid from '../components/AppDataGrid';
import BookingDialog from '../components/BookingDialog';
import { api, apiErrors, toLocalInput } from '../lib/api';
import type { Booking } from '../types/api';

export default function BookingsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const bookings = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get<{ data: Booking[] }>('/bookings')).data.data,
  });

  const cancel = useMutation({
    mutationFn: async (id: number) => api.delete(`/bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const columns: GridColDef<Booking>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'room_id', headerName: 'Sala', width: 100 },
    {
      field: 'start_at',
      headerName: 'Inicio (local)',
      flex: 1,
      minWidth: 170,
      valueFormatter: (value) =>
        typeof value === 'string' ? toLocalInput(value).replace('T', ' ') : '',
    },
    {
      field: 'end_at',
      headerName: 'Fin (local)',
      flex: 1,
      minWidth: 170,
      valueFormatter: (value) =>
        typeof value === 'string' ? toLocalInput(value).replace('T', ' ') : '',
    },
    {
      field: 'acciones',
      headerName: '',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          onClick={() => cancel.mutate(params.row.id)}
        >
          Cancelar
        </Button>
      ),
    } as GridColDef<Booking>,
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Mis reservas
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Nueva reserva
        </Button>
      </Box>
      {bookings.error && <Alert severity="error">{apiErrors(bookings.error)}</Alert>}
      <AppDataGrid<Booking> rows={bookings.data ?? []} columns={columns} />

      <BookingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          void qc.invalidateQueries({ queryKey: ['bookings'] });
        }}
      />
    </Box>
  );
}
