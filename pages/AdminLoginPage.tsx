
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    // This hook is the single source of truth for redirection.
    // It redirects reactively after the auth state is confirmed.
    if (!authLoading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true }); 
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      if (signInData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', signInData.user.id)
          .single();
        
        if (profileError || !profile) {
            throw new Error("Não foi possível verificar o perfil do usuário.");
        }

        if (!profile.is_admin) {
          await supabase.auth.signOut();
          throw new Error("Acesso negado. Esta área é apenas para administradores.");
        }
        
        // Navigation is removed from here. The useEffect above will handle it
        // once the user state is updated by onAuthStateChange.
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-moz"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <Logo className="h-16 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-sm text-gray-600">Painel de Administração</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email de Administrador"
            required
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
          />
          <div className="relative">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz/50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </form>
        <div className="text-center">
            <Link to="/" className="text-sm text-brand-up hover:text-brand-moz hover:underline">
                Voltar ao site principal
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;