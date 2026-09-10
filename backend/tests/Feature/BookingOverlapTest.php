<?php

namespace Tests\Feature;

use App\Actions\CreateBookingAction;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class BookingOverlapTest extends TestCase
{
    use RefreshDatabase;

    public function test_overlapping_same_room_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $action = app(CreateBookingAction::class);

        $action->execute($user, $room->id, Carbon::parse('2026-09-10 09:00:00', 'UTC'), Carbon::parse('2026-09-10 11:00:00', 'UTC'));

        $this->expectException(ValidationException::class);

        $action->execute($user, $room->id, Carbon::parse('2026-09-10 10:00:00', 'UTC'), Carbon::parse('2026-09-10 12:00:00', 'UTC'));
    }

    public function test_adjacent_slots_allowed(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $action = app(CreateBookingAction::class);

        $action->execute($user, $room->id, Carbon::parse('2026-09-10 09:00:00', 'UTC'), Carbon::parse('2026-09-10 11:00:00', 'UTC'));

        $booking = $action->execute($user, $room->id, Carbon::parse('2026-09-10 11:00:00', 'UTC'), Carbon::parse('2026-09-10 13:00:00', 'UTC'));

        $this->assertNotNull($booking->id);
    }

    public function test_same_user_different_room_overlap_rejected(): void
    {
        $user = User::factory()->create();
        $roomA = Room::factory()->create();
        $roomB = Room::factory()->create();
        $action = app(CreateBookingAction::class);

        $action->execute($user, $roomA->id, Carbon::parse('2026-09-10 09:00:00', 'UTC'), Carbon::parse('2026-09-10 11:00:00', 'UTC'));

        $this->expectException(ValidationException::class);

        $action->execute($user, $roomB->id, Carbon::parse('2026-09-10 10:00:00', 'UTC'), Carbon::parse('2026-09-10 12:00:00', 'UTC'));
    }
}
