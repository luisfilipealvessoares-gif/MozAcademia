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
  controlUserUpdateSignOut: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // FIX: Provide an initial value to `useRef`. The hook expects an argument.
  const inactivityTimer = useRef<number | null>(null);
  const isSigningOut = useRef(false);
  const userUpdateSignOutEnabled = useRef(true);

  const signOut = useCallback(async () => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;
    
    // Limpa a flag de "Lembrar-me" ao fazer logout manual.
    localStorage.removeItem('rememberMe');

    try {
      await supabase.auth.signOut();
      // Manually clear state for immediate UI update
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    } finally {
      isSigningOut.current = false;
    }
  }, []);

  const controlUserUpdateSignOut = (enabled: boolean) => {
    userUpdateSignOutEnabled.current = enabled;
  };

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Critical Error: User profile not found or RLS blocks access.", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  }, []);

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
          // FIX: Cast userProfile to UserProfile to match the state's stricter type,
          // specifically for the 'sexo' property.
          setProfile(userProfile as UserProfile);
          setIsAdmin(userProfile.is_admin);
        }
      }
      
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (isSigningOut.current) {
          return;
        }

        if (event === 'PASSWORD_RECOVERY') {
          return;
        }

        if (event === 'USER_UPDATED') {
          if (userUpdateSignOutEnabled.current) {
            await signOut();
          } else {
            // The handler was temporarily disabled by the ProfilePage to show a success message.
            // We re-enable it now so it works for other cases (e.g., password recovery flow).
            userUpdateSignOutEnabled.current = true;
          }
          return;
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
          return;
        }

        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          const userProfile = await fetchProfile(newSession.user);
          if (userProfile) {
            setSession(newSession);
            setUser(newSession.user);
            // FIX: Cast userProfile to UserProfile to match the state's stricter type,
            // specifically for the 'sexo' property.
            setProfile(userProfile as UserProfile);
            setIsAdmin(userProfile.is_admin);
          } else {
            await signOut();
          }
        } else if (!newSession) {
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
  
    // Adiciona um mecanismo robusto de ressincronização da sessão no foco do separador.
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                const { data, error } = await supabase.auth.getSession();

                // `getSession` pode retornar um erro 'Auth session missing!' se o token de acesso
                // expirou e não há token de atualização. Isso é tratado como um estado de logout.
                if (error) {
                    if (error.message === 'Auth session missing!') {
                        // Se o estado local ainda acha que há uma sessão, limpa-o.
                        if (session) {
                             setUser(null);
                             setSession(null);
                             setProfile(null);
                             setIsAdmin(false);
                        }
                        return; // Sessão não encontrada, o que é um estado válido.
                    } else {
                        // Um erro inesperado (ex: rede) ocorreu.
                        console.error("Erro ao revalidar a sessão no foco, a terminar sessão:", error);
                        await signOut();
                        return;
                    }
                }
                
                const newSession = data.session;
                
                // Compara o ID do utilizador da nova sessão com o da sessão atual no estado do React.
                // Se forem diferentes (ex: login/logout noutro separador), sincroniza o estado.
                if (newSession?.user?.id !== session?.user?.id) {
                    if (newSession?.user) {
                        // Um utilizador foi encontrado, mas não corresponde ao estado atual. Atualizar.
                        const userProfile = await fetchProfile(newSession.user);
                        if (userProfile) {
                            setSession(newSession);
                            setUser(newSession.user);
                            setProfile(userProfile as UserProfile);
                            setIsAdmin(userProfile.is_admin);
                        } else {
                            // Sessão válida mas sem perfil, estado inconsistente. Fazer logout.
                            await signOut();
                        }
                    } else {
                        // Nenhuma sessão foi encontrada, mas o estado React ainda tem um utilizador. Limpar o estado.
                        setUser(null);
                        setSession(null);
                        setProfile(null);
                        setIsAdmin(false);
                    }
                }
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [session, fetchProfile, signOut]); // As dependências garantem que temos o estado mais recente para comparação.

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(signOut, INACTIVITY_TIMEOUT);
  }, [signOut]);

  useEffect(() => {
    // Se "Lembrar-me" NÃO estiver ativo, configuramos um temporizador de inatividade.
    const shouldHaveInactivityTimer = localStorage.getItem('rememberMe') !== 'true';

    if (!user || !shouldHaveInactivityTimer) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      return;
    }

    // Este bloco só é executado se o usuário estiver logado e NÃO tiver optado por "Lembrar-me".
    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    
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
        // FIX: Cast userProfile to UserProfile to match the state's stricter type,
        // specifically for the 'sexo' property.
        setProfile(userProfile as UserProfile);
        setIsAdmin(userProfile.is_admin);
      }
    }
  }, [user, fetchProfile]);

  const value = useMemo(() => ({ user, session, profile, loading, isAdmin, refreshProfile, signOut, controlUserUpdateSignOut }), 
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