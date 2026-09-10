import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { api, apiErrors } from '../lib/api';
import type { Room } from '../types/api';

export default function RoomsPage() {
  const [capacityMin, setCapacityMin] = useState('');
  const [location, setLocation] = useState('');

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
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.capacity}</TableCell>
              <TableCell>{r.location}</TableCell>
              <TableCell>{r.is_active ? 'yes' : 'no'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
