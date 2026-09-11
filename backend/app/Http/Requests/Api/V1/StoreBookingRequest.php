<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Booking;
use App\Models\Room;
use App\Support\BookingLimits;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'start_at' => ['required', 'date', 'after:now'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'force' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $user = $this->user();
            $room = Room::find($this->input('room_id'));
            $start = Carbon::parse($this->input('start_at'))->utc();
            $end = Carbon::parse($this->input('end_at'))->utc();
            $force = (bool) $this->input('force', false);

            if ($force && ! $user->isAdmin()) {
                $validator->errors()->add('force', 'Only admins can force bookings.');

                return;
            }

            $skipOverlap = $force && $user->isAdmin();

            if (! $room || ! $room->is_active) {
                if (! $skipOverlap) {
                    $validator->errors()->add('room_id', 'The selected room is inactive.');
                }
            }

            $durationMinutes = $start->diffInMinutes($end);
            if ($durationMinutes > BookingLimits::MAX_DURATION_MINUTES) {
                $validator->errors()->add('end_at', 'The booking may not be greater than 2 hours.');
            }

            [$dayFrom, $dayTo] = BookingLimits::dayWindowForInstant($start);
            $dayCount = Booking::active()->where('user_id', $user->id)
                ->where('start_at', '>=', $dayFrom->toDateTimeString())
                ->where('start_at', '<', $dayTo->toDateTimeString())
                ->count();
            if ($dayCount >= BookingLimits::MAX_PER_DAY) {
                $validator->errors()->add('start_at', 'You may not have more than 5 bookings per day.');
            }

            if (! $skipOverlap) {
                $overlap = Booking::overlapsQuery(
                    $user->id,
                    (int) $this->input('room_id'),
                    $start->toDateTimeString(),
                    $end->toDateTimeString(),
                )->exists();

                if ($overlap) {
                    $validator->errors()->add('start_at', 'The selected time slot overlaps another booking.');
                }
            }
        });
    }
}
