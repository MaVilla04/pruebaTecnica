import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import { api, apiErrors, toUtcIso } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import type { Booking, Room } from '../types/api';

interface BookingDialogProps {
  open: boolean;
  initialRoomId?: number;
  lockRoom?: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function BookingDialog({
  open,
  initialRoomId,
  lockRoom,
  onClose,
  onCreated,
}: BookingDialogProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [roomId, setRoomId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [force, setForce] = useState(false);
  const [error, setError] = useState('');

  const rooms = useQuery({
    queryKey: ['rooms-all'],
    queryFn: async () => (await api.get<{ data: Room[] }>('/rooms')).data.data,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setRoomId(initialRoomId ? String(initialRoomId) : '');
      setStart('');
      setEnd('');
      setForce(false);
      setError('');
    }
  }, [open, initialRoomId]);

  const lockedRoom = lockRoom
    ? (rooms.data ?? []).find((r) => r.id === initialRoomId)
    : undefined;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: Booking }>('/bookings', {
        room_id: Number(roomId),
        start_at: toUtcIso(start),
        end_at: toUtcIso(end),
        ...(force && isAdmin ? { force: true } : {}),
      });
      return res.data.data;
    },
    onSuccess: () => {
      onCreated();
      onClose();
    },
    onError: (e) => setError(apiErrors(e)),
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: 'primary.dark' }}>
        {lockedRoom ? `Reservar ${lockedRoom.name}` : 'Nueva reserva'}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 3,
          pb: 1,
          px: 3,
          overflow: 'visible',
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        {lockRoom ? (
          <TextField
            label="Sala"
            value={lockedRoom?.name ?? ''}
            disabled
            fullWidth
          />
        ) : (
          <TextField
            select
            label="Sala"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            fullWidth
            autoFocus
          >
            {(rooms.data ?? []).map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name} ({r.capacity})
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          label="Inicio"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Fin"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        {isAdmin && (
          <FormControlLabel
            control={
              <Checkbox checked={force} onChange={(e) => setForce(e.target.checked)} />
            }
            label="Forzar (puede solapar o usar sala inactiva)"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={mutation.isPending || rooms.isPending}
          onClick={() => mutation.mutate()}
        >
          Reservar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
