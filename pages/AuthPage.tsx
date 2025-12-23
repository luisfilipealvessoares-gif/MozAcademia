import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if user is already logged in
    if (!authLoading && user) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (signInData.user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('id', signInData.user.id)
                .single();
            
            if (profile?.is_admin) {
                await supabase.auth.signOut(); // Log out the admin immediately
                throw new Error("Credenciais de administrador. Por favor, use o portal de Acesso Admin.");
            }
        }
        navigate('/dashboard');
      } else {
        // Sign up logic
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

  // Show a loader while checking auth state or if a user is found (before redirect)
  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {successMessage ? (
           <div className="text-center">
             <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             </div>
             <h2 className="text-2xl font-bold text-green-600">Quase lá!</h2>
             <p className="mt-4 text-gray-700">{successMessage}</p>
             <button
               onClick={() => {
                 setSuccessMessage(null);
                 setIsLogin(true);
               }}
               className="mt-6 w-full px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600"
             >
               Voltar para Login
             </button>
           </div>
        ) : (
        <>
            <div className="flex flex-col items-center">
                <Logo className="h-16 w-auto" />
                <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                {isLogin ? 'Acesse sua conta de aluno' : 'Crie uma nova conta'}
                </h2>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                <div className="rounded-md shadow-sm -space-y-px">
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
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
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
                        className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${!isLogin ? '' : 'rounded-t-md'} focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                        placeholder="Endereço de e-mail"
                    />
                    </div>
                    <div>
                    <label htmlFor="password" className="sr-only">Senha</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                        placeholder="Senha"
                    />
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                )}

                <div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
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
                    className="font-medium text-orange-600 hover:text-orange-500"
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