import { useMemo, useState } from 'react';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { toLocalInput } from '../lib/api';
import type { Booking } from '../types/api';

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const MAX_VISIBLE_PER_DAY = 3;

function statusChip(booking: Booking) {
  if (booking.status === 'cancelled') {
    return <Chip label="Cancelada" color="error" size="small" />;
  }
  if (booking.is_past) {
    return <Chip label="Finalizada" size="small" />;
  }
  return <Chip label="Activa" color="success" size="small" />;
}

function localDayKey(iso: string): string {
  return toLocalInput(iso).slice(0, 10);
}

function localTime(iso: string): string {
  return toLocalInput(iso).slice(11, 16);
}

export default function BookingsCalendar({ bookings }: { bookings: Booking[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const title = useMemo(() => {
    const raw = new Intl.DateTimeFormat('es', {
      month: 'long',
      year: 'numeric',
    }).format(cursor);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const key = localDayKey(b.start_at);
      const list = map.get(key);
      if (list) list.push(b);
      else map.set(key, [b]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start_at.localeCompare(b.start_at));
    }
    return map;
  }, [bookings]);

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayKey = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

  const go = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <Box sx={{ border: 'solid 0.5px', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton aria-label="Mes anterior" size="small" onClick={() => go(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ minWidth: 160, textAlign: 'center' }}>
          {title}
        </Typography>
        <IconButton aria-label="Mes siguiente" size="small" onClick={() => go(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {WEEKDAYS.map((d) => (
          <Box
            key={d}
            sx={{
              p: 1,
              textAlign: 'center',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              {d}
            </Typography>
          </Box>
        ))}

        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - offset + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return (
              <Box
                key={i}
                sx={{
                  minHeight: 110,
                  p: 1,
                  borderBottom: 1,
                  borderRight: (i + 1) % 7 === 0 ? 0 : 1,
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              />
            );
          }
          const key = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
          const events = byDay.get(key) ?? [];
          const visible = events.slice(0, MAX_VISIBLE_PER_DAY);
          const extra = events.length - visible.length;
          const isToday = key === todayKey;

          return (
            <Box
              key={i}
              sx={{
                minHeight: 110,
                p: 1,
                borderBottom: 1,
                borderRight: (i + 1) % 7 === 0 ? 0 : 1,
                borderColor: 'divider',
                ...(isToday ? { bgcolor: 'action.selected' } : {}),
              }}
            >
              <Typography
                variant="caption"
                color={isToday ? 'primary' : 'text.secondary'}
                sx={{ fontWeight: isToday ? 700 : 400 }}
              >
                {dayNum}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                {visible.map((b) => (
                  <Box
                    key={b.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.25,
                      p: 0.5,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" noWrap title={`${localTime(b.start_at)} · ${b.room ? b.room.name : `Sala #${b.room_id}`}`}>
                      {localTime(b.start_at)} · {b.room ? b.room.name : `Sala #${b.room_id}`}
                    </Typography>
                    {statusChip(b)}
                  </Box>
                ))}
                {extra > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    +{extra} más
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
