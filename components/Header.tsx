
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

// Icons for hamburger menu
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const Header: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false); // Close menu on sign out
    navigate('/', { replace: true }); // Ensure user is redirected to a public page
  };
  
  const dashboardLink = isAdmin ? '/admin' : '/dashboard';
  const dashboardText = isAdmin ? 'Painel Admin' : 'Meu Painel';

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Desktop Nav */}
          <div className="flex items-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <Logo className="h-12 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center space-x-10 ml-10">
              <Link to="/#cursos" className="text-gray-600 hover:text-brand-moz font-medium transition-colors duration-300">
                Cursos
              </Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-brand-moz font-medium transition-colors duration-300">
                Como Funciona
              </Link>
            </nav>
          </div>
          
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to={dashboardLink} className="bg-brand-moz text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-up transition-all duration-300 shadow-sm hover:shadow-md">
                  {dashboardText}
                </Link>
                 <Link to="/profile" className="text-gray-600 hover:text-brand-moz font-medium">
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
                className="bg-brand-moz text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-up transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Entrar / Registrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-brand-moz hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-moz"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMenuOpen ? (
                <CloseIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>
      
      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/#cursos" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
              Cursos
            </Link>
            <Link to="/how-it-works" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
              Como Funciona
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              {user ? (
                <>
                  <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    {dashboardText}
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    Meu Perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                  Entrar / Registrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;