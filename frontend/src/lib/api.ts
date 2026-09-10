import axios from 'axios';
import type { ApiError } from '../types/api';

const baseURL = `${import.meta.env.VITE_API_URL ?? 'http://localhost'}/api/v1`;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrors(e: unknown): string {
  if (axios.isAxiosError<ApiError>(e)) {
    const data = e.response?.data;
    if (data?.errors) {
      return Object.entries(data.errors)
        .map(([k, v]) => `${k}: ${v.join(', ')}`)
        .join(' | ');
    }
    return data?.message ?? e.message;
  }
  return e instanceof Error ? e.message : 'Unexpected error';
}

export function toUtcIso(local: string): string {
  return new Date(local).toISOString();
}

export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
