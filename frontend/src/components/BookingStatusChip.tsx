import { Chip } from '@mui/material';
import type { Booking } from '../types/api';

export default function BookingStatusChip({ booking }: { booking: Booking }) {
  if (booking.status === 'cancelled') {
    return <Chip label="Cancelada" color="error" size="small" />;
  }
  if (booking.is_past) {
    return <Chip label="Finalizada" size="small" />;
  }
  return <Chip label="Activa" color="success" size="small" />;
}
