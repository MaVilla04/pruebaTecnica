import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import PageTitle from '../components/PageTitle';
import type { GridColDef } from '@mui/x-data-grid';
import AppDataGrid from '../components/AppDataGrid';
import BookingDialog from '../components/BookingDialog';
import BookingsCalendar from '../components/BookingsCalendar';
import { api, apiErrors, toLocalInput } from '../lib/api';
import type { Booking } from '../types/api';

export default function BookingsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [cancelError, setCancelError] = useState('');

  const bookings = useQuery({
    queryKey: ['bookings', showPast],
    queryFn: async () => {
      const res = await api.get<{ data: Booking[] }>(
        `/bookings${showPast ? '?include_past=1' : ''}`,
      );
      return res.data.data;
    },
  });

  const calendarBookings = useQuery({
    queryKey: ['bookings', 'calendar'],
    queryFn: async () => {
      const res = await api.get<{ data: Booking[] }>('/bookings?include_past=1');
      return res.data.data;
    },
    enabled: view === 'calendar',
  });

  const cancel = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/bookings/${id}`);
      return res.data;
    },
    onMutate: () => setCancelError(''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    onError: (e) => setCancelError(apiErrors(e)),
  });

  const columns: GridColDef<Booking>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'sala',
      headerName: 'Sala',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params) => {
        const room = params.row.room;
        return room ? room.name : `Sala #${params.row.room_id}`;
      },
    } as GridColDef<Booking>,
    {
      field: 'ubicacion',
      headerName: 'Ubicación',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params) => params.row.room?.location ?? '—',
    } as GridColDef<Booking>,
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
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const booking = params.row;
        if (booking.status === 'cancelled') {
          return <Chip label="Cancelada" color="error" size="small" />;
        }
        if (booking.is_past) {
          return <Chip label="Finalizada" size="small" />;
        }
        return <Chip label="Activa" color="success" size="small" />;
      },
    } as GridColDef<Booking>,
    {
      field: 'acciones',
      headerName: '',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const booking = params.row;
        const disabled =
          booking.status === 'cancelled' || booking.is_past || cancel.isPending;
        return (
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={disabled}
            onClick={() => cancel.mutate(booking.id)}
          >
            Cancelar
          </Button>
        );
      },
    } as GridColDef<Booking>,
  ];

  return (
    <Box>
      <PageTitle>
        Mis reservas
      </PageTitle>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Nueva reserva
        </Button>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_, value: 'calendar' | 'list' | null) => {
            if (value) setView(value);
          }}
        >
          <ToggleButton value="calendar">Calendario</ToggleButton>
          <ToggleButton value="list">Lista</ToggleButton>
        </ToggleButtonGroup>
        {view === 'list' && (
          <ToggleButtonGroup
            value={showPast ? 'history' : 'upcoming'}
            exclusive
            size="small"
            onChange={(_, value: string | null) => {
              if (value) setShowPast(value === 'history');
            }}
          >
            <ToggleButton value="upcoming">Próximas</ToggleButton>
            <ToggleButton value="history">Historial</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
      {view === 'calendar' ? (
        <>
          {calendarBookings.error && (
            <Alert severity="error">{apiErrors(calendarBookings.error)}</Alert>
          )}
          <BookingsCalendar bookings={calendarBookings.data ?? []} />
        </>
      ) : (
        <>
          {bookings.error && <Alert severity="error">{apiErrors(bookings.error)}</Alert>}
          <AppDataGrid<Booking> rows={bookings.data ?? []} columns={columns} />
        </>
      )}
      {cancelError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCancelError('')}>
          {cancelError}
        </Alert>
      )}

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
