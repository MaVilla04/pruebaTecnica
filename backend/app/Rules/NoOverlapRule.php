<?php

namespace App\Rules;

use App\Models\Booking;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoOverlapRule implements ValidationRule
{
    public function __construct(
        private readonly int $userId,
        private readonly int $roomId,
        private readonly string $startAt,
        private readonly string $endAt,
        private readonly ?int $ignoreId = null,
    ) {}

    /**
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $exists = Booking::overlapsQuery(
            $this->userId,
            $this->roomId,
            $this->startAt,
            $this->endAt,
            $this->ignoreId,
        )->exists();

        if ($exists) {
            $fail('The selected time slot overlaps another booking.');
        }
    }
}
