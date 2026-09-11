<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CreateBookingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Booking::class);

        $query = Booking::query()->with('room')->orderBy('start_at');

        if (! $request->boolean('include_past')) {
            $query->upcoming();
        }

        if ($request->user()->isAdmin()) {
            if ($request->filled('room_id')) {
                $query->where('room_id', $request->query('room_id'));
            }
            if ($request->filled('date')) {
                $query->whereDate('start_at', $request->query('date'));
            }
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->query('user_id'));
            }
        } else {
            $query->where('user_id', $request->user()->id);
            if ($request->filled('room_id')) {
                $query->where('room_id', $request->query('room_id'));
            }
            if ($request->filled('date')) {
                $query->whereDate('start_at', $request->query('date'));
            }
        }

        return response()->json(['data' => BookingResource::collection($query->get())]);
    }

    public function store(StoreBookingRequest $request, CreateBookingAction $action): JsonResponse
    {
        $this->authorize('create', Booking::class);

        $booking = $action->execute(
            $request->user(),
            (int) $request->validated('room_id'),
            Carbon::parse($request->validated('start_at'))->utc(),
            Carbon::parse($request->validated('end_at'))->utc(),
            (bool) $request->validated('force', false),
        );

        return response()->json(['data' => new BookingResource($booking->load('room'))], 201);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $this->authorize('delete', $booking);

        if ($booking->end_at !== null && Carbon::parse($booking->end_at)->utc()->isPast()) {
            throw ValidationException::withMessages([
                'booking' => ['Past bookings cannot be cancelled.'],
            ]);
        }

        $booking->update(['status' => Booking::STATUS_CANCELLED]);

        return response()->json(['data' => new BookingResource($booking->load('room'))]);
    }
}
