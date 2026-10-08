'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';

interface Profile { id: string; name: string; email: string; role?: string; }
interface AuthContextType { profile: Profile | null; loading: boolean; refreshAuth: () => Promise<void>; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType>({ profile: null, loading: true, refreshAuth: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/auth/me');
      setProfile(res?.profile || null);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetchApi('/auth/logout', { method: 'POST' });
      setProfile(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAuth(); }, []);

  return <AuthContext.Provider value={{ profile, loading, refreshAuth: checkAuth, logout }}>{children}</AuthContext.Provider>;
}
