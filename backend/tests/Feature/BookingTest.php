<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private function futureDay(int $daysAhead = 2): Carbon
    {
        return Carbon::now('UTC')->addDays($daysAhead)->startOfDay();
    }

    private function slot(Carbon $day, int $startHour, int $endHour): array
    {
        return [
            'start_at' => $day->copy()->setTime($startHour, 0)->toIso8601String(),
            'end_at' => $day->copy()->setTime($endHour, 0)->toIso8601String(),
        ];
    }

    private function dbSlot(Carbon $day, int $startHour, int $endHour): array
    {
        return [
            'start_at' => $day->copy()->setTime($startHour, 0)->format('Y-m-d H:i:s'),
            'end_at' => $day->copy()->setTime($endHour, 0)->format('Y-m-d H:i:s'),
        ];
    }

    public function test_overlapping_same_room_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 9, 11));

        $slot = $this->slot($day, 10, 12);

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id,
            ...$slot,
        ])->assertUnprocessable()->assertJsonStructure(['message', 'errors' => ['start_at']]);
    }

    public function test_same_user_different_room_overlap_rejected(): void
    {
        $user = User::factory()->create();
        $roomA = Room::factory()->create();
        $roomB = Room::factory()->create();
        $day = $this->futureDay();
        Booking::factory()->for($user)->for($roomA)->create($this->dbSlot($day, 9, 11));

        $slot = $this->slot($day, 10, 12);

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $roomB->id,
            ...$slot,
        ])->assertUnprocessable();
    }

    public function test_non_overlapping_allowed_and_adjacent_allowed(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 9, 11));

        $slot = $this->slot($day, 12, 14);
        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertCreated()->assertJsonStructure(['data' => ['id', 'room_id', 'user_id', 'start_at', 'end_at', 'status', 'is_past', 'room']]);

        $nextDay = $this->futureDay(3);
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($nextDay, 9, 11));
        $adj = $this->slot($nextDay, 11, 13);
        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$adj,
        ])->assertCreated();
    }

    public function test_duration_over_2h_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $slot = $this->slot($this->futureDay(), 9, 12);

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertUnprocessable()->assertJsonStructure(['message', 'errors' => ['end_at']]);
    }

    public function test_third_booking_same_day_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 8, 9));
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 12, 13));

        $slot = $this->slot($day, 14, 15);

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertUnprocessable();
    }

    public function test_inactive_room_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->inactive()->create();
        $slot = $this->slot($this->futureDay(), 9, 10);

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertUnprocessable()->assertJsonStructure(['message', 'errors' => ['room_id']]);
    }

    public function test_admin_override_allowed(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 9, 11));

        $slot = $this->slot($day, 10, 12);

        $this->actingAs($admin)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot, 'force' => true,
        ])->assertCreated();
    }

    public function test_user_sees_only_own_and_cannot_delete_others(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        $room = Room::factory()->create();
        $own = Booking::factory()->for($a)->for($room)->create();
        $other = Booking::factory()->for($b)->for($room)->create();

        $response = $this->actingAs($a)->getJson('/api/v1/bookings');
        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($own->id));
        $this->assertFalse($ids->contains($other->id));

        $this->actingAs($a)->deleteJson("/api/v1/bookings/{$other->id}")->assertForbidden();
        $this->actingAs($a)->deleteJson("/api/v1/bookings/{$own->id}")->assertOk();
    }

    public function test_cancel_keeps_row_and_returns_cancelled_resource(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $booking = Booking::factory()->for($user)->for($room)->create();

        $response = $this->actingAs($user)->deleteJson("/api/v1/bookings/{$booking->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $booking->id)
            ->assertJsonPath('data.status', Booking::STATUS_CANCELLED)
            ->assertJsonStructure(['data' => ['id', 'room_id', 'user_id', 'start_at', 'end_at', 'status', 'is_past', 'room']]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_CANCELLED,
        ]);
    }

    public function test_cancel_past_booking_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $past = Booking::factory()->for($user)->for($room)->create([
            'start_at' => Carbon::now('UTC')->subDays(3)->setTime(9, 0)->format('Y-m-d H:i:s'),
            'end_at' => Carbon::now('UTC')->subDays(3)->setTime(11, 0)->format('Y-m-d H:i:s'),
        ]);

        $this->actingAs($user)->deleteJson("/api/v1/bookings/{$past->id}")->assertUnprocessable();

        $this->assertDatabaseHas('bookings', [
            'id' => $past->id,
            'status' => Booking::STATUS_ACTIVE,
        ]);
    }

    public function test_index_excludes_past_by_default_and_include_past_shows_history(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $upcoming = Booking::factory()->for($user)->for($room)->create();
        $past = Booking::factory()->for($user)->for($room)->create([
            'start_at' => Carbon::now('UTC')->subDays(3)->setTime(9, 0)->format('Y-m-d H:i:s'),
            'end_at' => Carbon::now('UTC')->subDays(3)->setTime(11, 0)->format('Y-m-d H:i:s'),
        ]);

        $default = $this->actingAs($user)->getJson('/api/v1/bookings')->assertOk();
        $defaultIds = collect($default->json('data'))->pluck('id');
        $this->assertTrue($defaultIds->contains($upcoming->id));
        $this->assertFalse($defaultIds->contains($past->id));

        $history = $this->actingAs($user)->getJson('/api/v1/bookings?include_past=1')->assertOk();
        $historyById = collect($history->json('data'))->keyBy('id');
        $this->assertTrue($historyById->has($upcoming->id));
        $this->assertTrue($historyById->has($past->id));
        $this->assertTrue($historyById->get($past->id)['is_past']);
        $this->assertFalse($historyById->get($upcoming->id)['is_past']);
    }

    public function test_cancelled_slot_can_be_rebooked(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();
        $booking = Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 9, 11));

        $this->actingAs($user)->deleteJson("/api/v1/bookings/{$booking->id}")->assertOk();

        $slot = $this->slot($day, 10, 12);
        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertCreated();
    }

    public function test_cancelled_bookings_do_not_count_toward_daily_limit(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();
        $first = Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 8, 9));
        Booking::factory()->for($user)->for($room)->create($this->dbSlot($day, 12, 13));

        $this->actingAs($user)->deleteJson("/api/v1/bookings/{$first->id}")->assertOk();

        $slot = $this->slot($day, 14, 15);
        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertCreated();
    }

    public function test_contract_shape(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $day = $this->futureDay();

        $response = $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id,
            ...$this->slot($day, 9, 11),
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'room_id', 'user_id', 'start_at', 'end_at', 'status', 'is_past', 'room' => ['id', 'name', 'location']]])
            ->assertJsonPath('data.status', Booking::STATUS_ACTIVE)
            ->assertJsonPath('data.is_past', false)
            ->assertJsonPath('data.room.id', $room->id)
            ->assertJsonPath('data.room.name', $room->name);
    }

    public function test_unauthenticated_denied(): void
    {
        $this->getJson('/api/v1/bookings')->assertUnauthorized();
    }
}
