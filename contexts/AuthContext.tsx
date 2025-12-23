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
      // FIX: Wrap state updates in a loading state to prevent race conditions and redirect loops.
      // When auth state changes, we are "loading" until the user's profile and admin status are also fetched.
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
          // This case handles a user who is authenticated but doesn't have a profile record yet (e.g., right after signup).
          setProfile(null);
          setIsAdmin(false);
          if (error) {
            console.error("Error fetching profile on auth state change:", error.message);
          }
        }
      } else {
        // User is logged out.
        setProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
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
    // If there's no user, we don't need any timers.
    // The cleanup function of the previous run will have cleared everything.
    if (!user) {
      return;
    }

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'
    ];

    // Set up event listeners to reset the timer on any user activity.
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize the timer when the effect runs.
    resetTimer();

    // Cleanup function: this is crucial. It runs when the user logs out.
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, resetTimer]); // Effect depends on the user's login state and the stable resetTimer function.

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
  };

  // Display a full-page loader during the initial authentication check
  // This prevents the app from rendering in an intermediate state or showing a blank page.
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
