import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, FormControlLabel, Switch, TextField } from '@mui/material';
import { api, apiErrors } from '../lib/api';
import type { Room } from '../types/api';
import AppDialog from '../components/AppDialog';

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
    <AppDialog
      title={editing ? 'Editar sala' : 'Nueva sala'}
      open={open}
      onClose={onClose}
      onSubmit={() => mutation.mutate()}
      submitLabel={editing ? 'Guardar' : 'Crear'}
      loading={mutation.isPending}
      error={error}
    >
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
    </AppDialog>
  );
}
