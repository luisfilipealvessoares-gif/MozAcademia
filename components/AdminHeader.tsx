
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Logo from './Logo';

const AdminHeader: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Logo className="h-10 w-auto" />
            </Link>
            <span className="font-semibold text-lg">Admin</span>
          </div>
          
          <nav className="flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white font-medium">
              Ver Site Público
            </Link>
            {user && (
                 <button
                 onClick={handleSignOut}
                 className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
               >
                 Sair
               </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
