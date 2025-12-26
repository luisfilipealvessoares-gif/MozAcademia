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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Increased inactivity timeout to 30 minutes. 1 minute was too short for an e-learning platform
// where users might be watching videos without interacting with the page. This prevents unexpected logouts.
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set loading to true initially. The onAuthStateChange listener will handle the rest.
    setLoading(true);

    // The onAuthStateChange listener is the single source of truth for the auth state.
    // It handles the initial session check, logins, logouts, and token refreshes.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const { data: userProfile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(userProfile.is_admin);
          } else {
            setProfile(null);
            setIsAdmin(false);
            if (error) {
              console.error("Error fetching profile on auth state change:", error.message);
            }
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
          console.error("Critical error in onAuthStateChange listener:", error);
          // Reset to a safe, logged-out state on failure
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
      } finally {
          // Set loading to false after the initial auth state has been determined.
          // This will only show the main loader on the first page load.
          setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Inactivity logout effect
  const inactivityTimer = useRef<number>();

  const handleSignOut = useCallback(() => {
    console.log("User has been inactive. Logging out.");
    supabase.auth.signOut();
  }, []);

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(handleSignOut, INACTIVITY_TIMEOUT);
  }, [handleSignOut]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    resetTimer();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, resetTimer]);

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
  };

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