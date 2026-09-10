<?php

namespace App\Actions;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateBookingAction
{
    public function execute(User $user, int $roomId, CarbonInterface $startAt, CarbonInterface $endAt, bool $force = false): Booking
    {
        return DB::transaction(function () use ($user, $roomId, $startAt, $endAt, $force) {
            $room = Room::whereKey($roomId)->lockForUpdate()->firstOrFail();

            if (! $force || ! $user->isAdmin()) {
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
