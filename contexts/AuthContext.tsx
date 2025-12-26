
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const inactivityTimer = useRef<number>();

  const fetchProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Critical Error: User profile not found or RLS blocks access. Forcing sign out.", error);
      await supabase.auth.signOut();
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    const setupAuth = async () => {
      // 1. Get the initial session from Supabase.
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
        return;
      }

      // 2. If a session exists, fetch the corresponding profile.
      if (initialSession?.user) {
        const userProfile = await fetchProfile(initialSession.user);
        // If fetchProfile fails, it signs the user out and returns null.
        // The onAuthStateChange listener below will then handle clearing the state.
        if (userProfile) {
          setSession(initialSession);
          setUser(initialSession.user);
          setProfile(userProfile);
          setIsAdmin(userProfile.is_admin);
        }
      }
      
      // 3. The initial check is complete. The app can now be displayed.
      setLoading(false);

      // 4. Set up a listener for any future auth state changes.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          // A user is logged in. Fetch their profile.
          const userProfile = await fetchProfile(newSession.user);
          if (userProfile) {
            setSession(newSession);
            setUser(newSession.user);
            setProfile(userProfile);
            setIsAdmin(userProfile.is_admin);
          } else {
            // This case occurs if fetchProfile failed and signed the user out.
            // Clear all local state to match.
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          // The user has signed out. Clear all state.
          setSession(null);
          setUser(null);
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
  }, [fetchProfile]);
  
  const handleSignOut = useCallback(() => {
    console.log("User has been inactive. Logging out.");
    supabase.auth.signOut();
  }, []);

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(handleSignOut, INACTIVITY_TIMEOUT);
  }, [handleSignOut]);

  useEffect(() => {
    if (!user) return;
    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
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

  const value = { user, session, profile, loading, isAdmin, refreshProfile };

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
