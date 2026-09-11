<?php

namespace App\Support;

use Carbon\Carbon;

class BookingLimits
{
    public const MAX_DURATION_MINUTES = 120;

    public const MAX_PER_DAY = 5;

    public const DAY_TIMEZONE = 'America/Bogota';

    /**
     * @return array{0: Carbon, 1: Carbon} UTC bounds [from, to) for the Bogota day containing $instant.
     */
    public static function dayWindowForInstant(Carbon $instant): array
    {
        $startBogota = $instant->copy()->tz(self::DAY_TIMEZONE)->startOfDay();
        $endBogota = $startBogota->copy()->addDay();

        return [$startBogota->copy()->utc(), $endBogota->copy()->utc()];
    }

    /**
     * @return array{0: Carbon, 1: Carbon} UTC bounds [from, to) for the Bogota calendar day $date (Y-m-d).
     */
    public static function dayWindowForDate(string $date): array
    {
        $startBogota = Carbon::parse($date, self::DAY_TIMEZONE)->startOfDay();
        $endBogota = $startBogota->copy()->addDay();

        return [$startBogota->copy()->utc(), $endBogota->copy()->utc()];
    }
}
