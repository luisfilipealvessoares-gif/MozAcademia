import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

// Icons
// FIX: Explicitly type icon components as React.FC to provide better type inference for React.cloneElement.
const LayoutDashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
const LifeBuoyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>;


interface NavLinkProps {
    to: string;
    // FIX: The type for 'icon' was too generic. Specifying React.SVGProps<SVGSVGElement>
    // ensures TypeScript knows that props like 'className' are valid.
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

    return (
        <Link 
            to={to} 
            className={`flex items-center px-4 py-2.5 text-gray-700 rounded-lg transition-colors duration-200 text-sm ${
                isActive 
                ? 'bg-brand-moz text-white font-semibold shadow-md' 
                : 'hover:bg-brand-light hover:text-brand-up'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-5 h-5 mr-3' })}
            <span className="truncate">{children}</span>
        </Link>
    );
};

// Helper to get initials
const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};


const UserSidebar: React.FC = () => {
    const { profile } = useAuth();
    const { t } = useI18n();
    const userInitials = getInitials(profile?.full_name);
    return (
        <aside className="w-full md:w-64 bg-white flex flex-col flex-shrink-0 border rounded-xl p-4 self-start">
             <div className="flex flex-col items-center py-4 space-y-2 border-b">
                <div className={`w-16 h-16 rounded-full bg-brand-light text-brand-up flex items-center justify-center font-bold text-2xl`}>
                    {userInitials}
                </div>
                <h3 className="font-semibold text-base text-gray-800 text-center">{profile?.full_name}</h3>
                <p className="text-xs text-gray-500 text-center">{profile?.company_name}</p>
            </div>
            <nav className="flex-1 mt-4 space-y-1">
                <NavLink to="/dashboard" icon={<LayoutDashboardIcon />}>{t('header.myDashboard')}</NavLink>
                <NavLink to="/profile" icon={<UserCircleIcon />}>{t('header.myProfile')}</NavLink>
                <NavLink to="/support" icon={<LifeBuoyIcon />}>{t('footer.support')}</NavLink>
            </nav>
        </aside>
    );
};

export default UserSidebar;