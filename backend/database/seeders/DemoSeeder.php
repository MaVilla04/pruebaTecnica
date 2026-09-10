<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'password123', 'role' => 'admin']
        );

        $rooms = [
            ['name' => 'Lab A-101', 'capacity' => 20, 'location' => 'Building A - Floor 1'],
            ['name' => 'Lab B-201', 'capacity' => 30, 'location' => 'Building B - Floor 2'],
            ['name' => 'Lab C-301', 'capacity' => 10, 'location' => 'Building C - Floor 3'],
        ];

        foreach ($rooms as $attrs) {
            Room::firstOrCreate(['name' => $attrs['name']], $attrs + ['is_active' => true]);
        }

        $room = Room::where('name', 'Lab A-101')->first();
        if ($room && ! Booking::where('user_id', $admin->id)->exists()) {
            $start = now('UTC')->addDay()->setTime(9, 0);
            Booking::create([
                'user_id' => $admin->id,
                'room_id' => $room->id,
                'start_at' => $start,
                'end_at' => (clone $start)->addHours(2),
            ]);
        }
    }
}
