import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabase';
// FIX: Added UserProfile and Module to imports for strong typing of fetched data.
import { CertificateRequest, Course, ActivityLog, UserProfile, Module } from '../types';
import { Link } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-brand-light p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ enrollments: 0, certRequests: 0, courses: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial data fetch
  useEffect(() => {
    const fetchAdminData = async () => {
        setLoading(true);

        const [coursesRes, enrollmentsRes, certRequestsRes, logsRes, profilesRes, modulesRes] = await Promise.all([
            supabase.from('courses').select('*', { count: 'exact' }),
            supabase.from('enrollments').select('*', { count: 'exact', head: true }),
            supabase.from('certificate_requests').select('*').eq('status', 'pending').order('requested_at', { ascending: false }),
            supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('user_profiles').select('id, full_name, company_name'),
            supabase.from('modules').select('id, title')
        ]);

        // FIX: Strongly typed the data arrays to ensure type safety in subsequent operations.
        const coursesData: Course[] = coursesRes.data || [];
        const profilesData: Pick<UserProfile, 'id' | 'full_name' | 'company_name'>[] = profilesRes.data || [];
        const modulesData: Pick<Module, 'id' | 'title'>[] = modulesRes.data || [];
        
        setCourses(coursesData);

        // Manually join Certificate Requests
        const certRequestsData = certRequestsRes.data || [];
        const coursesMap = new Map(coursesData.map(c => [c.id, c]));
        const profilesMap = new Map(profilesData.map(p => [p.id, p]));

        const joinedRequests = certRequestsData.map(req => {
            const profile = profilesMap.get(req.user_id);
            const course = coursesMap.get(req.course_id);
            return {
                ...req,
                // FIX: Removed `as any` cast by using strongly typed maps, allowing direct property access.
                user_profiles: profile ? { full_name: profile.full_name } : { full_name: '(Usuário Desconhecido)' },
                courses: course ? { title: course.title } : { title: '(Curso Desconhecido)' },
            };
        });
        setCertificateRequests(joinedRequests);

        // Manually join Activity Logs
        const logsData = logsRes.data || [];
        const modulesMap = new Map(modulesData.map(m => [m.id, m]));

        const joinedLogs = logsData.map(log => {
            const profile = profilesMap.get(log.user_id);
            const course = coursesMap.get(log.course_id);
            const module = modulesMap.get(log.module_id);
            return {
                ...log,
                user_profiles: profile || null,
                courses: course ? { title: course.title } : null,
                modules: module ? { title: module.title } : null,
            };
        });
        setActivityLogs(joinedLogs);
        setFilteredLogs(joinedLogs);

        setStats({
            courses: coursesRes.count ?? 0,
            enrollments: enrollmentsRes.count ?? 0,
            certRequests: certRequestsData.length
        });
        setLoading(false);
    };

    fetchAdminData();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase.channel('admin-dashboard-realtime');

    const handleNewCertRequest = async (payload: any) => {
        const newRequest = payload.new;
        const [profileRes, courseRes] = await Promise.all([
            supabase.from('user_profiles').select('full_name').eq('id', newRequest.user_id).single(),
            supabase.from('courses').select('title').eq('id', newRequest.course_id).single()
        ]);
        const joinedRequest = {
            ...newRequest,
            // FIX: Removed `as any` cast. Supabase response is typed, allowing direct property access.
            user_profiles: profileRes.data ? { full_name: profileRes.data.full_name } : { full_name: '(Usuário Desconhecido)' },
            courses: courseRes.data ? { title: courseRes.data.title } : { title: '(Curso Desconhecido)' },
        };
        setCertificateRequests(prev => [joinedRequest as CertificateRequest, ...prev]);
        setStats(prev => ({ ...prev, certRequests: prev.certRequests + 1 }));
    };

    const handleNewActivityLog = async (payload: any) => {
        const newLog = payload.new;
        const [profileRes, courseRes, moduleRes] = await Promise.all([
            supabase.from('user_profiles').select('full_name, company_name').eq('id', newLog.user_id).single(),
            supabase.from('courses').select('title').eq('id', newLog.course_id).single(),
            supabase.from('modules').select('title').eq('id', newLog.module_id).single()
        ]);
        const joinedLog = {
            ...newLog,
            user_profiles: profileRes.data,
            // FIX: Removed `as any` cast. Supabase response is typed, allowing direct property access.
            courses: courseRes.data ? { title: courseRes.data.title } : null,
            modules: moduleRes.data ? { title: moduleRes.data.title } : null
        };
        setActivityLogs(prev => [joinedLog as ActivityLog, ...prev.slice(0, 99)]);
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          supabase.from('courses').select('*', { count: 'exact' }).then(({ data, count }) => {
            if(data) setCourses(data);
            setStats(prev => ({ ...prev, courses: count ?? 0 }));
          });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => {
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).then(({ count }) => {
            setStats(prev => ({ ...prev, enrollments: count ?? 0 }));
          });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'certificate_requests' }, handleNewCertRequest)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'certificate_requests' }, (payload) => {
          if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
              setCertificateRequests(prev => prev.filter(req => req.id !== payload.new.id));
              setStats(prev => ({...prev, certRequests: prev.certRequests - 1}));
          }
      })
       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, handleNewActivityLog)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  useEffect(() => {
    let result = activityLogs;
    if (filterCourse) {
      result = result.filter(log => log.course_id === filterCourse);
    }
    if (searchTerm) {
      result = result.filter(log =>
        log.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredLogs(result);
  }, [filterCourse, searchTerm, activityLogs]);

  const handleApproveCertificate = async (requestId: string) => {
    // Optimistic UI update
    setCertificateRequests(prev => prev.filter(req => req.id !== requestId));
    setStats(prev => ({...prev, certRequests: prev.certRequests - 1}));
    
    const { error } = await supabase
      .from('certificate_requests')
      .update({ status: 'issued' })
      .eq('id', requestId);

    if (error) {
      alert("Erro ao aprovar certificado: " + error.message);
      // Revert UI on error if needed, for simplicity we just alert
    }
  };

  const mostAccessedCourses = useMemo(() => {
    const counts: Record<string, number> = {};
    activityLogs.forEach((log) => {
      if (log.courses?.title) {
        counts[log.courses.title] = (counts[log.courses.title] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [activityLogs]);

  return (
    <div className="bg-brand-light -mx-8 -my-8 p-8 rounded-xl">
        <div className="space-y-12">
        <h1 className="text-3xl font-extrabold">Painel de Administração</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total de Cursos" value={stats.courses} icon={<BookOpenIcon />} />
            <StatCard title="Total de Inscrições" value={stats.enrollments} icon={<UserGroupIcon />} />
            <StatCard title="Pedidos de Certificado" value={stats.certRequests} icon={<AcademicCapIcon />} />
        </div>

        <div id="certificate-requests">
            <h2 className="text-2xl font-bold mb-4">Pedidos de Certificado Pendentes</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {certificateRequests.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data do Pedido</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {certificateRequests.map(req => (
                    <tr key={req.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{req.user_profiles?.full_name || '(Usuário Excluído)'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{req.courses?.title || '(Curso Excluído)'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requested_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                            onClick={() => handleApproveCertificate(req.id)}
                            className="bg-brand-moz text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-up"
                        >
                            Aprovar
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <p className="p-6 text-center text-gray-500">Nenhum pedido de certificado pendente.</p>
            )}
            </div>
        </div>

        <div id="course-management">
            <h2 className="text-2xl font-bold mb-4">Gerenciamento de Cursos</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map(course => (
                            <tr key={course.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{course.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link to={`/admin/courses/${course.id}`} className="bg-brand-moz text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-up">
                                        Gerenciar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="analytics">
            <h2 className="text-2xl font-bold mb-4">Análise de Atividade Recente</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <select onChange={(e) => setFilterCourse(e.target.value)} value={filterCourse} className="w-full md:w-1/3 p-2 border rounded-md">
                    <option value="">Todos os Cursos</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Buscar por nome do aluno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-2/3 p-2 border rounded-md" />
                </div>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo Acessado</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map(log => (
                        <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user_profiles?.full_name || '(Usuário Excluído)'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user_profiles?.company_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            {log.courses?.title || '(Curso Excluído)'} - {log.modules?.title || '(Módulo Excluído)'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Cursos Mais Acessados</h3>
                <ul className="space-y-3">
                {mostAccessedCourses.map(([title, count], index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{title}</span>
                    <span className="font-bold text-brand-moz bg-brand-light px-2 py-1 rounded-full">{count} acessos</span>
                    </li>
                ))}
                </ul>
            </div>
            </div>
        </div>
        </div>
    </div>
  );
};

// Icons
const UserGroupIcon = () => <svg className="w-6 h-6 text-brand-moz" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.4-1.857m-3.4 1.857a3 3 0 00-3.4-1.857M12 6V3m0 3h-3m3 0h3m-3 0v3m0-3V3m0 3H9m3 0h3m0-3h-3m3 0h3m0 0v3"></path></svg>;
const BookOpenIcon = () => <svg className="w-6 h-6 text-brand-moz" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const AcademicCapIcon = () => <svg className="w-6 h-6 text-brand-moz" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;

export default AdminDashboard;
