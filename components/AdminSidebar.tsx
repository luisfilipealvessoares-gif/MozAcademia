
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

// --- Icon Components ---
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const AcademicCapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422A12.083 12.083 0 0122 12V6"></path><path d="M12 21.76V14l-9-5v6.76c0 .54.2 1.05.57 1.43L12 21.76z"></path></svg>;
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.4-1.857m-3.4 1.857a3 3 0 00-3.4-1.857M12 6V3m0 3h-3m3 0h3m-3 0v3m0-3V3m0 3H9m3 0h3m0-3h-3m3 0h3m0 0v3"></path></svg>;
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m6 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;


interface NavLinkProps {
    to: string;
    icon: React.ReactElement;
    children: React.ReactNode;
}
const NavLink: React.FC<NavLinkProps> = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

    return (
        <Link 
            to={to} 
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive 
                ? 'bg-brand-moz text-white shadow-inner' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3' })}
            {children}
        </Link>
    );
};

const AdminSidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
            <div className="h-20 flex items-center justify-center px-4 bg-gray-900 border-b border-gray-700">
                <Logo className="h-14 w-auto" variant="dark" />
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                <NavLink to="/admin" icon={<HomeIcon />}>Dashboard</NavLink>
                <NavLink to="/admin/analytics" icon={<ChartBarIcon />}>Análise</NavLink>
                <NavLink to="/admin/courses" icon={<BookOpenIcon />}>Cursos</NavLink>
                <NavLink to="/admin/certificates" icon={<AcademicCapIcon />}>Certificados</NavLink>
                <NavLink to="/admin/progress" icon={<UserGroupIcon />}>Progresso</NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;