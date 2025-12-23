
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { CertificateRequest, Course } from '../types';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-orange-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ enrollments: 0, inProgress: 0, certRequests: 0 });
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);

      const { data: coursesData } = await supabase.from('courses').select('id, title');
      if (coursesData) setCourses(coursesData);

      const { count: enrollmentsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
      
      const { data: progressData } = await supabase.from('user_progress').select('user_id, module_id');
      const usersInProgress = new Set(progressData?.map(p => p.user_id)).size;
      
      const { count: certRequestsCount } = await supabase.from('certificate_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      setStats({
        enrollments: enrollmentsCount || 0,
        inProgress: usersInProgress || 0,
        certRequests: certRequestsCount || 0,
      });

      const { data: requestsData, error } = await supabase
        .from('certificate_requests')
        .select(`
            *,
            user_profiles ( full_name ),
            courses ( title )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (requestsData) {
        setRequests(requestsData as any);
      }
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  const handleIssueCertificate = async (requestId: string) => {
    const { error } = await supabase.from('certificate_requests').update({ status: 'issued' }).eq('id', requestId);
    if (error) {
        alert('Erro ao emitir certificado.');
    } else {
        alert('Certificado emitido com sucesso!');
        setRequests(requests.filter(req => req.id !== requestId));
        setStats(prev => ({...prev, certRequests: prev.certRequests-1}));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Painel de Administração</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total de Inscrições" value={stats.enrollments} icon={<UserGroupIcon />} />
        <StatCard title="Alunos em Progresso" value={stats.inProgress} icon={<ChartBarIcon />} />
        <StatCard title="Pedidos de Certificado" value={stats.certRequests} icon={<AcademicCapIcon />} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Pedidos de Certificado Pendentes</h2>
        {loading ? (
            <p>Carregando...</p>
        ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data do Pedido</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? requests.map(req => (
                    <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{req.user_profiles?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{(req as any).courses.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.requested_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                         onClick={() => handleIssueCertificate(req.id)}
                         className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-600"
                        >
                            Emitir
                        </button>
                    </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">Nenhum pedido pendente.</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>
    </div>
  );
};

// Icons
const UserGroupIcon = () => <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.4-1.857m-3.4 1.857a3 3 0 00-3.4-1.857M12 6V3m0 3h-3m3 0h3m-3 0v3m0-3V3m0 3H9m3 0h3m0-3h-3m3 0h3m0 0v3"></path></svg>;
const ChartBarIcon = () => <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const AcademicCapIcon = () => <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;

export default AdminDashboard;
