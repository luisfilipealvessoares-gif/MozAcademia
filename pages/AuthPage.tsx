
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
                <Logo className="h-12 w-auto" />
                <h2 className="mt-6 text-3xl font-bold text-center text-gray-900">
                {isLogin ? 'Acesse sua conta de aluno' : 'Crie uma nova conta'}
                </h2>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
                <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome Completo"
                required
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-md focus:border-orange-400 focus:ring-orange-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                />
            )}
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-md focus:border-orange-400 focus:ring-orange-300 focus:ring-opacity-40 focus:outline-none focus:ring"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-md focus:border-orange-400 focus:ring-orange-300 focus:ring-opacity-40 focus:outline-none focus:ring"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600 disabled:bg-orange-300"
            >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </form>
            
            <p className="text-sm text-center text-gray-600">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-orange-600 hover:underline">
                {isLogin ? 'Registre-se' : 'Entrar'}
            </button>
            </p>
        </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
