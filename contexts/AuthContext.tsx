
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

  const fetchAndSetProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Propagate the error to be caught by the listener
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
    
    if (userProfile) {
      setProfile(userProfile);
      setIsAdmin(userProfile.is_admin);
    } else {
      // This is a critical state inconsistency. The user exists in auth but has no profile.
      throw new Error("User profile not found for an authenticated user.");
    }
  }, []);


  useEffect(() => {
    // This is the single point of truth for determining auth state.
    // It runs once on initial load and then listens for changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
          // If a user session exists, we MUST successfully fetch their profile.
          // This is now an atomic operation.
          await fetchAndSetProfile(currentUser.id);
          setUser(currentUser);
          setSession(session);
        } else {
          // If no session, clear everything.
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
        }

      } catch (error) {
        console.error("Critical auth error, forcing sign out:", error);
        // If anything fails (e.g., profile fetch), force a clean, signed-out state.
        // This prevents loops from inconsistent states (e.g., user logged in but profile is null).
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        // This guarantees the app will always proceed past the loading screen,
        // after the session has been definitively resolved.
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAndSetProfile]);

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
    // This function is now only for explicit refreshes (e.g., after profile update),
    // not for initial auth.
    if (user) {
      await fetchAndSetProfile(user.id);
    }
  }, [user, fetchAndSetProfile]);

  const value = { user, session, profile, loading, isAdmin, refreshProfile };

  // This loading screen is crucial. It acts as a gatekeeper, preventing any part
  // of the app from rendering until the auth state has been definitively determined.
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
