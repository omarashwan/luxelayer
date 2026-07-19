import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../models/supabase';
import type { Profile } from '../types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string, redirectTo: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PROFILE_KEY = 'luxelayer.profile.cache';
const DEMO_ADMIN_EMAIL = 'mennarashwan@gmail.com';
const DEMO_ADMIN_PASSWORD = '1010abab';
const DEMO_ADMIN_SESSION_KEY = 'luxelayer.demo-admin.session';

function buildDemoAdminProfile(): Profile {
  return {
    id: 'demo-admin-user',
    email: DEMO_ADMIN_EMAIL,
    first_name: 'Mennar',
    last_name: 'Rashwan',
    avatar_url: null,
    phone: null,
    is_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildDemoAdminSession(profile: Profile): Session {
  return {
    access_token: 'demo-admin-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'demo-admin-refresh-token',
    user: {
      id: profile.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: profile.email,
      phone: null,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      last_sign_in_at: profile.updated_at,
      app_metadata: { provider: 'demo', providers: ['demo'] },
      user_metadata: {
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
      identities: [],
      factors: [],
    },
  } as Session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) {
      setProfile(null);
      return;
    }
    setProfile(data as Profile | null);
    try {
      if (data) sessionStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    let mounted = true;

    try {
      const storedDemoSession = sessionStorage.getItem(DEMO_ADMIN_SESSION_KEY);
      if (storedDemoSession) {
        const parsed = JSON.parse(storedDemoSession) as { profile: Profile; session: Session };
        if (mounted) {
          setSession(parsed.session);
          setProfile(parsed.profile);
          setLoading(false);
        }
        return () => {
          mounted = false;
        };
      }
    } catch {
      // ignore
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
          try {
            sessionStorage.removeItem(PROFILE_KEY);
          } catch {
            // ignore
          }
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (email.trim().toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      const profile = buildDemoAdminProfile();
      const session = buildDemoAdminSession(profile);
      setSession(session);
      setProfile(profile);
      setLoading(false);
      try {
        sessionStorage.setItem(DEMO_ADMIN_SESSION_KEY, JSON.stringify({ profile, session }));
        sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // ignore storage errors
      }
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthContextValue['signUp'] = async (email, password, firstName, lastName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      // The DB trigger creates the profile row; prime it.
      await loadProfile(data.user.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
      sessionStorage.removeItem(PROFILE_KEY);
    } catch {
      // ignore
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  const resetPassword = useCallback(async (email: string, redirectTo: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAdmin: profile?.is_admin ?? false,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      resetPassword,
      updatePassword,
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
