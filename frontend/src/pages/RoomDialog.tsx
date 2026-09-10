import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import { api, apiErrors } from '../lib/api';
import type { Room } from '../types/api';

interface Props {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function RoomDialog({ open, room, onClose, onSaved }: Props) {
  const editing = room !== null;
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(room?.name ?? '');
      setCapacity(room ? String(room.capacity) : '');
      setLocation(room?.location ?? '');
      setIsActive(room?.is_active ?? true);
      setError('');
    }
  }, [open, room]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        capacity: Number(capacity),
        location,
        is_active: isActive,
      };
      if (editing && room) {
        await api.put(`/rooms/${room.id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e) => setError(apiErrors(e)),
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Editar sala' : 'Nueva sala'}</DialogTitle>
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
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
        />
        <TextField
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Capacidad"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            }
            label="Activa"
            sx={{ whiteSpace: 'nowrap' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {editing ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
