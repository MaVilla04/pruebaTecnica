<?php

namespace App\Models;

use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = ['user_id', 'room_id', 'start_at', 'end_at', 'status'];

    protected $attributes = ['status' => self::STATUS_ACTIVE];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class)->withTrashed();
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('end_at', '>=', now());
    }

    public static function overlapsQuery(int $userId, int $roomId, string $startAt, string $endAt, ?int $ignoreId = null)
    {
        return self::query()
            ->active()
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->where(function ($q) use ($userId, $roomId) {
                $q->where('room_id', $roomId)->orWhere('user_id', $userId);
            })
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt);
    }
}
