<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreRoomRequest;
use App\Http\Requests\Api\V1\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Room::class);

        $query = Room::query();

        if (! $request->user()->isAdmin()) {
            $query->where('is_active', true);
        }

        if ($request->filled('capacity_min')) {
            $query->where('capacity', '>=', (int) $request->query('capacity_min'));
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->query('location').'%');
        }

        return response()->json(['data' => RoomResource::collection($query->orderBy('id')->get())]);
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $this->authorize('create', Room::class);

        $room = Room::create($request->validated());

        return response()->json(['data' => new RoomResource($room)], 201);
    }

    public function show(Request $request, Room $room): JsonResponse
    {
        $this->authorize('view', $room);

        return response()->json(['data' => new RoomResource($room)]);
    }

    public function update(UpdateRoomRequest $request, Room $room): JsonResponse
    {
        $this->authorize('update', $room);

        $room->update($request->validated());

        return response()->json(['data' => new RoomResource($room)]);
    }

    public function destroy(Room $room): JsonResponse
    {
        $this->authorize('delete', $room);

        $room->delete();

        return response()->json(null, 204);
    }
}
