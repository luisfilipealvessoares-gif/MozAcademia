
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  const dashboardLink = isAdmin ? '/admin' : '/dashboard';
  const dashboardText = isAdmin ? 'Painel Admin' : 'Meu Painel';

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/">
              <Logo className="h-12 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-10">
            <Link to="/#cursos" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">
              Cursos
            </Link>
            <Link to="/#noticias" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">
              Notícias
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={dashboardLink} className="hidden sm:inline-block bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all duration-300 shadow-sm hover:shadow-md">
                  {dashboardText}
                </Link>
                 <Link to="/profile" className="hidden sm:inline-block text-gray-600 hover:text-orange-500 font-medium">
                    Meu Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Entrar / Registrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
