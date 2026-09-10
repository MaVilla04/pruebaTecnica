import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthData, User } from '../types/api';

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const save = (data: AuthData) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ data: AuthData }>('/login', { email, password });
    save(res.data.data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<{ data: AuthData }>('/register', { name, email, password });
    save(res.data.data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
