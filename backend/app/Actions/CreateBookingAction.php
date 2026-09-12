<?php

namespace App\Actions;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use App\Support\BookingLimits;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateBookingAction
{
    public function execute(User $user, int $roomId, CarbonInterface $startAt, CarbonInterface $endAt, bool $force = false): Booking
    {
        return DB::transaction(function () use ($user, $roomId, $startAt, $endAt, $force) {
            $room = Room::whereKey($roomId)->lockForUpdate()->firstOrFail();

            if ($force && ! $user->isAdmin()) {
                throw ValidationException::withMessages([
                    'force' => ['Only admins can force bookings.'],
                ]);
            }

            $skipGuards = $force && $user->isAdmin();

            if (! $room->is_active && ! $skipGuards) {
                throw ValidationException::withMessages([
                    'room_id' => ['The selected room is inactive.'],
                ]);
            }

            if ($startAt->diffInMinutes($endAt) > BookingLimits::MAX_DURATION_MINUTES) {
                throw ValidationException::withMessages([
                    'end_at' => ['The booking may not be greater than 2 hours.'],
                ]);
            }

            [$dayFrom, $dayTo] = BookingLimits::dayWindowForInstant($startAt);
            $dayCount = Booking::active()->where('user_id', $user->id)
                ->where('start_at', '>=', $dayFrom->toDateTimeString())
                ->where('start_at', '<', $dayTo->toDateTimeString())
                ->count();

            if ($dayCount >= BookingLimits::MAX_PER_DAY) {
                throw ValidationException::withMessages([
                    'start_at' => ['You may not have more than '.BookingLimits::MAX_PER_DAY.' bookings per day.'],
                ]);
            }

            if (! $skipGuards) {
                $overlap = Booking::overlapsQuery(
                    $user->id,
                    $room->id,
                    $startAt->toDateTimeString(),
                    $endAt->toDateTimeString(),
                )->exists();

                if ($overlap) {
                    throw ValidationException::withMessages([
                        'start_at' => ['The selected time slot overlaps another booking.'],
                    ]);
                }
            }

            return Booking::create([
                'user_id' => $user->id,
                'room_id' => $room->id,
                'start_at' => $startAt,
                'end_at' => $endAt,
            ]);
        });
    }
}
