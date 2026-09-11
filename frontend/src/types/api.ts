export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  is_active: boolean;
}

export interface BookingRoom {
  id: number;
  name: string;
  location: string;
}

export interface Booking {
  id: number;
  room_id: number;
  user_id: number;
  start_at: string;
  end_at: string;
  status: 'active' | 'cancelled';
  is_past: boolean;
  room: BookingRoom | null;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
