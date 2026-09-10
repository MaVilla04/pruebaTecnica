import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import AppDataGrid from '../components/AppDataGrid';
import { api, apiErrors, toLocalInput, toUtcIso } from '../lib/api';
import type { Booking, Room } from '../types/api';

export default function BookingsPage() {
  const qc = useQueryClient();
  const [roomId, setRoomId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const rooms = useQuery({
    queryKey: ['rooms-all'],
    queryFn: async () => (await api.get<{ data: Room[] }>('/rooms')).data.data,
  });

  const bookings = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get<{ data: Booking[] }>('/bookings')).data.data,
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: Booking }>('/bookings', {
        room_id: Number(roomId),
        start_at: toUtcIso(start),
        end_at: toUtcIso(end),
      });
      return res.data.data;
    },
    onSuccess: () => {
      setError('');
      setOk('Booking created (201)');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (e) => {
      setOk('');
      setError(apiErrors(e));
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: number) => api.delete(`/bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

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
      <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField select label="Sala" value={roomId} onChange={(e) => setRoomId(e.target.value)} required sx={{ minWidth: 200 }}>
          {(rooms.data ?? []).map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name} ({r.capacity})
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Inicio" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Fin" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required slotProps={{ inputLabel: { shrink: true } }} />
        <Button type="submit" variant="contained" disabled={create.isPending}>
          Reservar
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}
      {bookings.error && <Alert severity="error">{apiErrors(bookings.error)}</Alert>}
      <AppDataGrid<Booking> rows={bookings.data ?? []} columns={columns} />
    </Box>
  );
}
