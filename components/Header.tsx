import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

// --- Icons ---
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
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;

// Helper to get initials
const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

// --- Helper Components ---
const NavLink: React.FC<{ to: string, children: React.ReactNode, onClick?: () => void }> = ({ to, children, onClick }) => (
    <Link to={to} onClick={onClick} className="text-gray-600 hover:text-brand-moz font-medium transition-colors duration-300 relative group py-2">
      <span>{children}</span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-moz transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
    </Link>
);

const Header: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    await signOut();
    navigate('/', { replace: true });
  };
  
  const dashboardLink = isAdmin ? '/admin' : '/dashboard';
  const dashboardText = isAdmin ? t('header.adminDashboard') : t('header.myDashboard');
  const userInitials = getInitials(profile?.full_name);

  return (
    <header className="bg-white/90 backdrop-blur-lg shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <Logo className="h-12 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center space-x-8 ml-10">
              <NavLink to="/#cursos">{t('header.courses')}</NavLink>
              <NavLink to="/about">{t('header.about')}</NavLink>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <div className={`w-9 h-9 rounded-full bg-brand-light text-brand-up flex items-center justify-center font-bold text-sm`}>
                    {userInitials}
                  </div>
                  <span className="font-semibold hidden lg:inline text-sm">{profile?.full_name}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b">
                        <p className="font-bold text-gray-800 truncate text-sm">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <Link to={dashboardLink} onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-moz">
                          <DashboardIcon className="w-5 h-5 mr-3" /> {dashboardText}
                        </Link>
                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-moz">
                          <ProfileIcon className="w-5 h-5 mr-3" /> {t('header.myProfile')}
                        </Link>
                    </div>
                    <div className="border-t"></div>
                    <button onClick={handleSignOut} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogoutIcon className="w-5 h-5 mr-3" /> {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-brand-up font-semibold px-4 py-2 rounded-lg hover:bg-brand-light transition-all duration-300 text-sm">
                  {t('header.login')}
                </Link>
                <Link to="/login?view=register" className="bg-brand-moz text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-up transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  {t('header.register')}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-brand-moz hover:bg-gray-100" aria-controls="mobile-menu" aria-expanded={isMenuOpen}>
              <span className="sr-only">{t('header.openMenu')}</span>
              {isMenuOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/#cursos" onClick={() => setIsMenuOpen(false)}>{t('header.courses')}</NavLink>
            <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>{t('header.about')}</NavLink>
            <div className="pl-3 pt-2">
                <LanguageSwitcher />
            </div>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              {user ? (
                <>
                  <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    {dashboardText}
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    {t('header.myProfile')}
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    {t('header.login')}
                  </Link>
                  <Link to="/login?view=register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-moz hover:bg-gray-100">
                    {t('header.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;