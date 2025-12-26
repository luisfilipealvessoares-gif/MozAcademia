
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Logo from './Logo';

const AdminHeader: React.FC = () => {
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The redirect is now handled reactively by the AdminRoute component
    // when the user state becomes null. This prevents race conditions.
  };

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link to="/admin">
              <Logo className="h-14 w-auto" variant="dark" />
            </Link>
             <nav className="hidden md:flex items-center space-x-6">
                <Link to="/admin" className="text-gray-300 hover:text-white font-medium">
                  Painel Principal
                </Link>
                 <Link to="/admin/support" className="text-gray-300 hover:text-white font-medium">
                  Gestão de Suporte
                </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white font-medium">
              Ver Site Público
            </Link>
            {user && (
                 <button
                 onClick={handleSignOut}
                 className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition"
               >
                 Sair
               </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;