<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_room(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/rooms', [
            'name' => 'Lab B-201',
            'capacity' => 20,
            'location' => 'Building B - Floor 2',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Lab B-201')
            ->assertJsonPath('data.is_active', true);
    }

    public function test_user_cannot_create_room(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/rooms', [
            'name' => 'Lab B-202',
            'capacity' => 10,
            'location' => 'Building B',
        ]);

        $response->assertForbidden();
    }

    public function test_duplicate_room_name_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        Room::factory()->create(['name' => 'Lab B-201']);

        $response = $this->actingAs($admin)->postJson('/api/v1/rooms', [
            'name' => 'Lab B-201',
            'capacity' => 20,
            'location' => 'Building B',
        ]);

        $response->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['name']]);
    }

    public function test_user_filters_by_capacity_and_inactive_hidden(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        Room::factory()->create(['name' => 'Small', 'capacity' => 5]);
        Room::factory()->create(['name' => 'Big', 'capacity' => 30]);
        Room::factory()->inactive()->create(['name' => 'Hidden', 'capacity' => 50]);

        $response = $this->actingAs($user)->getJson('/api/v1/rooms?capacity_min=20');
        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Big'));
        $this->assertFalse($names->contains('Small'));
        $this->assertFalse($names->contains('Hidden'));

        $adminResponse = $this->actingAs($admin)->getJson('/api/v1/rooms');
        $adminNames = collect($adminResponse->json('data'))->pluck('name');
        $this->assertTrue($adminNames->contains('Hidden'));
    }

    public function test_unauthenticated_cannot_list_rooms(): void
    {
        $response = $this->getJson('/api/v1/rooms');

        $response->assertUnauthorized();
    }
}
