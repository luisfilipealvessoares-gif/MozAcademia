
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const inactivityTimer = useRef<number>();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Manually clear state for immediate UI update, ensuring responsiveness.
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const fetchProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Critical Error: User profile not found or RLS blocks access. Forcing sign out.", error);
      // FIX: Call the local signOut function to ensure state is cleared properly.
      await signOut();
      return null;
    }
    return data;
  }, [signOut]);

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
        return;
      }

      if (initialSession?.user) {
        const userProfile = await fetchProfile(initialSession.user);
        if (userProfile) {
          setSession(initialSession);
          setUser(initialSession.user);
          setProfile(userProfile);
          setIsAdmin(userProfile.is_admin);
        }
      }
      
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        
        if (newSession?.user) {
          const userProfile = await fetchProfile(newSession.user);
          if (userProfile) {
            setSession(newSession);
            setUser(newSession.user);
            setProfile(userProfile);
            setIsAdmin(userProfile.is_admin);
          } else {
            signOut();
          }
        } else {
          // Explicitly clear state on sign out event
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
        }
      });
      
      return subscription;
    };
    
    const subscriptionPromise = setupAuth();

    return () => {
      subscriptionPromise.then(subscription => subscription?.unsubscribe());
    };
  }, [fetchProfile, signOut]);
  
  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(signOut, INACTIVITY_TIMEOUT);
  }, [signOut]);

  useEffect(() => {
    if (!user) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      return; // Sai sem configurar o temporizador.
    }

    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    
    // Função de limpeza para remover os ouvintes de eventos e o temporizador.
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, resetTimer]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchProfile(user);
      if (userProfile) {
        setProfile(userProfile);
        setIsAdmin(userProfile.is_admin);
      }
    }
  }, [user, fetchProfile]);

  const value = useMemo(() => ({ user, session, profile, loading, isAdmin, refreshProfile, signOut }), 
    [user, session, profile, loading, isAdmin, refreshProfile, signOut]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-moz"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
