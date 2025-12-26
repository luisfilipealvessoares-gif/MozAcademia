
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    // This hook is the single source of truth for redirection.
    // It redirects reactively when the auth state is confirmed.
    if (!authLoading && user) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        localStorage.removeItem('awaiting_confirmation');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (signInData.user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('id', signInData.user.id)
                .single();
            
            if (profile?.is_admin) {
                await supabase.auth.signOut();
                throw new Error("Credenciais de administrador. Por favor, use o portal de Acesso Admin.");
            }
        }
        // Navigation is removed from here. The useEffect above will handle it
        // once the user state is updated by onAuthStateChange.
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        if(data.user){
            localStorage.setItem('awaiting_confirmation', 'true');
            setSuccessMessage('Registro bem-sucedido! Verifique sua caixa de entrada para confirmar seu e-mail. Você já pode fechar esta aba.');
            setEmail('');
            setPassword('');
            setFullName('');
        }
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-moz"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 bg-gradient-to-br from-brand-light to-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
        {successMessage ? (
           <div className="text-center">
             <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-brand-moz" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             </div>
             <h2 className="text-2xl font-bold text-brand-up">Quase lá!</h2>
             <p className="mt-4 text-gray-700">{successMessage}</p>
             <button
               onClick={() => {
                 setSuccessMessage(null);
                 setIsLogin(true);
               }}
               className="mt-6 w-full px-4 py-3 text-white bg-brand-moz rounded-lg font-semibold hover:bg-brand-up shadow-sm hover:shadow-lg transition-all"
             >
               Voltar para Login
             </button>
           </div>
        ) : (
        <>
            <div className="flex flex-col items-center">
                <Logo className="h-16 w-auto" />
                <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                {isLogin ? 'Acesse sua conta' : 'Crie uma nova conta'}
                </h2>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                <div className="space-y-4">
                    {!isLogin && (
                    <div>
                        <label htmlFor="full-name" className="sr-only">Nome Completo</label>
                        <input
                        id="full-name"
                        name="full-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow"
                        placeholder="Nome Completo"
                        />
                    </div>
                    )}
                    <div>
                    <label htmlFor="email-address" className="sr-only">Email</label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow"
                        placeholder="Endereço de e-mail"
                    />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Senha</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow"
                                placeholder="Senha"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {isPasswordVisible ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                )}

                <div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-moz hover:bg-brand-up focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-moz disabled:bg-brand-moz disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                    {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
                    </button>
                </div>
            </form>
            <div className="text-sm text-center">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                    }}
                    className="font-medium text-brand-up hover:text-brand-moz"
                >
                    {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça login'}
                </button>
            </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;