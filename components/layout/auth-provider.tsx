'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  business_name?: string | null;
  phone?: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, business_name, phone')
        .eq('id', userId)
        .maybeSingle();
      setProfile((data as Profile) ?? null);
    } catch {
      setProfile(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
      if (u) await loadProfile(u.id);
      else setProfile(null);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, [loadProfile]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        if (!active) return;
        setUser(u);
        if (u) await loadProfile(u.id);
      } catch {
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }

      const supabase = getSupabaseClient();
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
        if (!active) return;
        setUser(session?.user ?? null);
        if (session?.user) await loadProfile(session.user.id);
        else setProfile(null);
      });

      return () => sub.subscription.unsubscribe();
    };

    const cleanup = init();
    return () => {
      active = false;
      cleanup.then((fn) => fn && fn());
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
