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

const INACTIVITY_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // This function handles the initial load and checks for an existing session.
    const fetchSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
  
        if (currentUser) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(userProfile ?? null);
          setIsAdmin(userProfile?.is_admin ?? false);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndProfile();

    // This listener handles all subsequent authentication changes (login, logout, token refresh).
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // CRITICAL FIX: Wrap the entire logic in a try/catch/finally block.
      // This prevents the app from getting stuck in a loading state if an error
      // occurs during a background token refresh (e.g., network error fetching profile).
      try {
        setLoading(true);
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
    console.log("User has been inactive for 1 minute. Logging out.");
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
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
