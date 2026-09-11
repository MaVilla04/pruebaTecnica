<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $room = $this->relationLoaded('room') ? $this->getRelation('room') : $this->room;

        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'user_id' => $this->user_id,
            'start_at' => $this->start_at?->utc()->toIso8601String(),
            'end_at' => $this->end_at?->utc()->toIso8601String(),
            'status' => $this->status,
            'is_past' => $this->end_at !== null && $this->end_at->isPast(),
            'room' => $room ? [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
            ] : null,
        ];
    }
}
