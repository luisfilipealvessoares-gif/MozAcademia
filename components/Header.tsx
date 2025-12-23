
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

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium">
              Cursos
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-orange-500 font-medium">
                Admin Dashboard
              </Link>
            )}
          </nav>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Olá, {profile?.full_name || user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition"
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
