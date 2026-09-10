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

    private function futureSlot(string $date, string $start, string $end): array
    {
        return [
            'start_at' => Carbon::parse("$date $start", 'UTC')->toIso8601String(),
            'end_at' => Carbon::parse("$date $end", 'UTC')->toIso8601String(),
        ];
    }

    public function test_overlapping_same_room_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        Booking::factory()->for($user)->for($room)->create([
            'start_at' => '2026-09-10 09:00:00',
            'end_at' => '2026-09-10 11:00:00',
        ]);

        $slot = $this->futureSlot('2026-09-10', '10:00', '12:00');

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
        Booking::factory()->for($user)->for($roomA)->create([
            'start_at' => '2026-09-10 09:00:00',
            'end_at' => '2026-09-10 11:00:00',
        ]);

        $slot = $this->futureSlot('2026-09-10', '10:00', '12:00');

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $roomB->id,
            ...$slot,
        ])->assertUnprocessable();
    }

    public function test_non_overlapping_allowed_and_adjacent_allowed(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        Booking::factory()->for($user)->for($room)->create([
            'start_at' => '2026-09-10 09:00:00',
            'end_at' => '2026-09-10 11:00:00',
        ]);

        $slot = $this->futureSlot('2026-09-10', '12:00', '14:00');
        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertCreated()->assertJsonStructure(['data' => ['id', 'room_id', 'user_id', 'start_at', 'end_at']]);

        $adjacent = $this->futureSlot('2026-09-11', '09:00', '11:00');
        Booking::factory()->for($user)->for($room)->create([
            'start_at' => '2026-09-11 09:00:00',
            'end_at' => '2026-09-11 11:00:00',
        ]);
        $adj = $this->futureSlot('2026-09-11', '11:00', '13:00');
        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$adj,
        ])->assertCreated();
    }

    public function test_duration_over_2h_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        $slot = $this->futureSlot('2026-09-10', '09:00', '12:00');

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertUnprocessable()->assertJsonStructure(['message', 'errors' => ['end_at']]);
    }

    public function test_third_booking_same_day_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();
        Booking::factory()->for($user)->for($room)->create(['start_at' => '2026-09-10 08:00:00', 'end_at' => '2026-09-10 09:00:00']);
        Booking::factory()->for($user)->for($room)->create(['start_at' => '2026-09-10 12:00:00', 'end_at' => '2026-09-10 13:00:00']);

        $slot = $this->futureSlot('2026-09-10', '14:00', '15:00');

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertUnprocessable();
    }

    public function test_inactive_room_rejected(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->inactive()->create();
        $slot = $this->futureSlot('2026-09-10', '09:00', '10:00');

        $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id, ...$slot,
        ])->assertUnprocessable()->assertJsonStructure(['message', 'errors' => ['room_id']]);
    }

    public function test_admin_override_allowed(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $room = Room::factory()->create();
        Booking::factory()->for($user)->for($room)->create([
            'start_at' => '2026-09-10 09:00:00',
            'end_at' => '2026-09-10 11:00:00',
        ]);

        $slot = $this->futureSlot('2026-09-10', '10:00', '12:00');

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
        $this->actingAs($a)->deleteJson("/api/v1/bookings/{$own->id}")->assertNoContent();
    }

    public function test_contract_shape(): void
    {
        $user = User::factory()->create();
        $room = Room::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/bookings', [
            'room_id' => $room->id,
            'start_at' => '2026-09-10T09:00:00Z',
            'end_at' => '2026-09-10T11:00:00Z',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'room_id', 'user_id', 'start_at', 'end_at']]);
    }

    public function test_unauthenticated_denied(): void
    {
        $this->getJson('/api/v1/bookings')->assertUnauthorized();
    }
}
