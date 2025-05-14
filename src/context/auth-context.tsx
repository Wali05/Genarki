'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, createBrowserClient } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabaseBrowser = createBrowserClient();
    
    const getSession = async () => {
      const { data, error } = await supabaseBrowser.auth.getSession();
      
      if (!error) {
        setSession(data.session);
        setUser(data.session?.user || null);
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const supabaseBrowser = createBrowserClient();
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const supabaseBrowser = createBrowserClient();
    const { error } = await supabaseBrowser.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`
      }
    });
    return { error };
  };

  const signOut = async () => {
    const supabaseBrowser = createBrowserClient();
    await supabaseBrowser.auth.signOut();
    router.push('/');
  };

  const resetPassword = async (email: string) => {
    const supabaseBrowser = createBrowserClient();
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?redirect=/reset-password`,
    });
    return { error };
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 