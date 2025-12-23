
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
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        // Sign up logic remains the same
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
            alert('Registro bem-sucedido! Verifique seu e-mail para confirmação.');
            setIsLogin(true);
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
      </div>
    </div>
  );
};

export default AuthPage;
