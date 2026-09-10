import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { api, apiErrors } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import type { Room } from '../types/api';
import RoomDialog from './RoomDialog';

export default function RoomsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const [capacityMin, setCapacityMin] = useState('');
  const [location, setLocation] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { data, error } = useQuery({
    queryKey: ['rooms', capacityMin, location],
    queryFn: async () => {
      const res = await api.get<{ data: Room[] }>('/rooms', {
        params: {
          ...(capacityMin ? { capacity_min: Number(capacityMin) } : {}),
          ...(location ? { location } : {}),
        },
      });
      return res.data.data;
    },
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Salas
      </Typography>
      {isAdmin && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingRoom(null);
              setDialogOpen(true);
            }}
          >
            Nueva sala
          </Button>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Capacidad mínima"
          type="number"
          value={capacityMin}
          onChange={(e) => setCapacityMin(e.target.value)}
        />
        <TextField label="Ubicación" value={location} onChange={(e) => setLocation(e.target.value)} />
      </Box>
      {error && <Alert severity="error">{apiErrors(error)}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Active</TableCell>
            {isAdmin && <TableCell>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.capacity}</TableCell>
              <TableCell>{r.location}</TableCell>
              <TableCell>{r.is_active ? 'yes' : 'no'}</TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingRoom(r);
                      setDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
