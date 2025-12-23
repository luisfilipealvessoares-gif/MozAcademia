
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

  // This header should not be rendered for admins who are in the admin section.
  // The AdminLayout will render a different header.
  // However, an admin might visit the public site, so we handle that case.
  const dashboardLink = isAdmin ? '/admin' : '/dashboard';
  const dashboardText = isAdmin ? 'Painel Admin' : 'Meu Painel';

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#cursos" className="text-gray-600 hover:text-orange-500 font-medium">
              Cursos
            </Link>
            <Link to="/#noticias" className="text-gray-600 hover:text-orange-500 font-medium">
              Notícias
            </Link>
          </nav>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={dashboardLink} className="text-white font-bold py-2 px-5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                  {dashboardText}
                </Link>
                 <Link to="/profile" className="text-gray-600 hover:text-orange-500 font-medium hidden sm:block">
                    Meu Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white font-bold py-2 px-5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
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