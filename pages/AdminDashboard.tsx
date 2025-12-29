
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

// --- Icon Components ---
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.4-1.857m-3.4 1.857a3 3 0 00-3.4-1.857M12 6V3m0 3h-3m3 0h3m-3 0v3m0-3V3m0 3H9m3 0h3m0-3h-3m3 0h3m0 0v3"></path></svg>;
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const AcademicCapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422A12.083 12.083 0 0122 12V6"></path><path d="M12 21.76V14l-9-5v6.76c0 .54.2 1.05.57 1.43L12 21.76z"></path></svg>;
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5M6 12h12"></path></svg>;

// --- Helper Components ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 border border-gray-200">
        <div className="bg-brand-light p-4 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

interface NavCardProps {
    to: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}
const NavCard: React.FC<NavCardProps> = ({ to, title, description, icon }) => (
    <Link to={to} className="bg-white p-6 rounded-lg shadow border border-gray-200 group hover:border-brand-moz hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        <div>
            <div className="flex items-center space-x-4 mb-4">
                <div className="bg-brand-light p-3 rounded-full group-hover:bg-brand-moz transition-colors duration-300">
                    {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-brand-moz group-hover:text-white transition-colors duration-300"})}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            <p className="text-gray-600">{description}</p>
        </div>
        <div className="mt-6 flex justify-end items-center text-brand-moz font-semibold">
            Acessar <ArrowRightIcon className="w-5 h-5 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
        </div>
    </Link>
);


const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ enrollments: 0, certRequests: 0, courses: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const [coursesRes, enrollmentsRes, certRequestsRes] = await Promise.all([
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('enrollments').select('*', { count: 'exact', head: true }),
                supabase.from('certificate_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);
            setStats({
                courses: coursesRes.count ?? 0,
                enrollments: enrollmentsRes.count ?? 0,
                certRequests: certRequestsRes.count ?? 0
            });
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900">Painel de Controle</h1>
                <p className="text-xl text-gray-600 mt-2">Visão geral do sistema MozupAcademy.</p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total de Cursos" value={stats.courses} icon={<BookOpenIcon className="w-8 h-8 text-brand-moz" />} />
                <StatCard title="Total de Inscrições" value={stats.enrollments} icon={<UserGroupIcon className="w-8 h-8 text-brand-moz" />} />
                <StatCard title="Certificados Pendentes" value={stats.certRequests} icon={<AcademicCapIcon className="w-8 h-8 text-brand-moz" />} />
            </div>

            {/* Navigation Cards */}
             <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Áreas de Gerenciamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <NavCard
                        to="/admin/courses"
                        title="Gerenciar Cursos"
                        description="Adicionar, editar e organizar cursos e seus módulos de conteúdo."
                        icon={<BookOpenIcon />}
                    />
                    <NavCard
                        to="/admin/certificates"
                        title="Pedidos de Certificado"
                        description="Aprovar pedidos de certificados dos alunos e exportar relatórios."
                        icon={<AcademicCapIcon />}
                    />
                    <NavCard
                        to="/admin/progress"
                        title="Progresso dos Alunos"
                        description="Acompanhar o avanço e o desempenho dos alunos nos cursos."
                        icon={<UserGroupIcon />}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
