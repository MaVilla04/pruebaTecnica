import { useMemo, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { toLocalInput } from '../lib/api';
import type { Booking } from '../types/api';
import BookingStatusChip from './BookingStatusChip';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const MAX_VISIBLE_PER_DAY = 3;

// ---------------------------------------------------------------------------
// Helpers puros (sin estado, testeables)
// ---------------------------------------------------------------------------

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function localDayKey(iso: string): string {
  return toLocalInput(iso).slice(0, 10);
}

function localTime(iso: string): string {
  return toLocalInput(iso).slice(11, 16);
}

function getMonthOffset(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function groupByDay(bookings: Booking[]): Map<string, Booking[]> {
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
}

// ---------------------------------------------------------------------------
// Subcomponentes locales (solo usados por este calendario)
// ---------------------------------------------------------------------------

function CalendarHeader({
  title,
  onPrev,
  onNext,
}: {
  title: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <IconButton aria-label="Mes anterior" size="small" onClick={onPrev}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" component="div" sx={{ minWidth: 160, textAlign: 'center' }}>
        {title}
      </Typography>
      <IconButton aria-label="Mes siguiente" size="small" onClick={onNext}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}

function WeekdayHeader() {
  return (
    <>
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
    </>
  );
}

function BookingItem({ booking }: { booking: Booking }) {
  const label = `${localTime(booking.start_at)} · ${booking.room ? booking.room.name : `Sala #${booking.room_id}`}`;
  return (
    <Box
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
      <Typography variant="caption" noWrap title={label}>
        {label}
      </Typography>
      <BookingStatusChip booking={booking} />
    </Box>
  );
}

function DayCell({
  dayNum,
  isToday,
  events,
  isLastColumn,
}: {
  dayNum: number | null;
  isToday: boolean;
  events: Booking[];
  isLastColumn: boolean;
}) {
  if (dayNum === null) {
    return (
      <Box
        sx={{
          minHeight: 110,
          p: 1,
          borderBottom: 1,
          borderRight: isLastColumn ? 0 : 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      />
    );
  }

  const visible = events.slice(0, MAX_VISIBLE_PER_DAY);
  const extra = events.length - visible.length;

  return (
    <Box
      sx={{
        minHeight: 110,
        p: 1,
        borderBottom: 1,
        borderRight: isLastColumn ? 0 : 1,
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
          <BookingItem key={b.id} booking={b} />
        ))}
        {extra > 0 && (
          <Typography variant="caption" color="text.secondary">
            +{extra} más
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

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

  const byDay = useMemo(() => groupByDay(bookings), [bookings]);

  const offset = getMonthOffset(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const todayKey = getTodayKey();

  const go = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <Box sx={{ border: 'solid 0.5px', borderRadius: 1 }}>
      <CalendarHeader title={title} onPrev={() => go(-1)} onNext={() => go(1)} />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        <WeekdayHeader />

        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - offset + 1;
          const isLastColumn = (i + 1) % 7 === 0;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <DayCell key={i} dayNum={null} isToday={false} events={[]} isLastColumn={isLastColumn} />;
          }
          const key = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
          return (
            <DayCell
              key={i}
              dayNum={dayNum}
              isToday={key === todayKey}
              events={byDay.get(key) ?? []}
              isLastColumn={isLastColumn}
            />
          );
        })}
      </Box>
    </Box>
  );
}
