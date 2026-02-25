import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnalyticsStats {
    totalUsers: number;
    totalEnrollments: number;
    completedCoursesUsers: number;
    averageAge: number;
}

interface CoursePopularity {
    title: string;
    enrollments: number;
}

interface EnrollmentsOverTime {
    date: string;
    count: number;
}

interface GenderDistribution {
    masculino: number;
    feminino: number;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; onClick?: () => void }> = ({ title, value, description, onClick }) => (
    <div onClick={onClick} className={`bg-white p-6 rounded-lg shadow-md border hover:-translate-y-1 transition-transform duration-300 ${onClick ? 'cursor-pointer' : ''}`}>
        <h3 className="text-gray-500 text-sm font-semibold uppercase">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        <p className="text-gray-500 text-xs mt-1">{description}</p>
    </div>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[]; onBarClick?: (label: string) => void }> = ({ title, data, onBarClick }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    const AnimatedBar: React.FC<{ item: {label: string, value: number} }> = ({ item }) => {
        const [width, setWidth] = useState('0%');

        useEffect(() => {
            const timer = setTimeout(() => {
                setWidth(`${(item.value / maxValue) * 100}%`);
            }, 100);
            return () => clearTimeout(timer);
        }, [item.value]);

        return (
            <div
                key={item.label}
                onClick={() => onBarClick && item.value > 0 && onBarClick(item.label)}
                className={`flex items-center text-sm group transition-all duration-200 p-1 -m-1 rounded-lg ${onBarClick && item.value > 0 ? 'cursor-pointer hover:bg-brand-light' : ''}`}
            >
                <div className="w-1/3 truncate pr-2 text-gray-600 font-medium group-hover:text-brand-up">{item.label}</div>
                <div className="w-2/3 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                            className="bg-gradient-to-r from-brand-up to-brand-moz h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-1000 ease-out"
                            style={{ width }}
                        >
                            <span className="transition-opacity duration-500" style={{ opacity: width === '0%' ? 0 : 1 }}>
                                {item.value}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border hover:-translate-y-1 transition-transform duration-300">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="space-y-3">
                {data.length > 0 ? data.map(item => (
                   <AnimatedBar key={item.label} item={item} />
                )) : <p className="text-gray-500 text-center py-8">Não há dados para exibir.</p>}
            </div>
        </div>
    )
}


const AdminAnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AnalyticsStats>({ totalUsers: 0, totalEnrollments: 0, completedCoursesUsers: 0, averageAge: 0 });
    const [coursePopularity, setCoursePopularity] = useState<CoursePopularity[]>([]);
    const [enrollmentsOverTime, setEnrollmentsOverTime] = useState<EnrollmentsOverTime[]>([]);
    const [genderDistribution, setGenderDistribution] = useState<GenderDistribution>({ masculino: 0, feminino: 0 });
    const [ageDistribution, setAgeDistribution] = useState<{ label: string; value: number }[]>([]);
    const [countryDistribution, setCountryDistribution] = useState<{ label: string; value: number }[]>([]);
    const [nonAdminUserIds, setNonAdminUserIds] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [modalData, setModalData] = useState<{
        title: string;
        items: string[];
        loading: boolean;
    }>({ title: '', items: [], loading: false });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        try {
            const { data: usersData, error: usersError } = await supabase
                .from('user_profiles')
                .select('id, sexo, idade, pais')
                .eq('is_admin', false)
                .abortSignal(signal);

            if (usersError) throw usersError;
            if (signal.aborted) return;
            
            const localNonAdminUserIds = usersData ? usersData.map(u => u.id) : [];
            setNonAdminUserIds(localNonAdminUserIds);

            if (usersData) {
                const genderCounts = usersData.reduce((acc, user) => {
                    if (user.sexo === 'masculino') acc.masculino++;
                    else if (user.sexo === 'feminino') acc.feminino++;
                    return acc;
                }, { masculino: 0, feminino: 0 });
                setGenderDistribution(genderCounts);

                const ages = usersData.map(u => u.idade).filter(Boolean) as number[];
                const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
                setStats(prev => ({...prev, totalUsers: usersData.length, averageAge }));

                const ageBins: { [key: string]: number } = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
                ages.forEach(age => {
                    if (age >= 18 && age <= 25) ageBins['18-25']++;
                    else if (age >= 26 && age <= 35) ageBins['26-35']++;
                    else if (age >= 36 && age <= 45) ageBins['36-45']++;
                    else if (age >= 46 && age <= 55) ageBins['46-55']++;
                    else if (age >= 56) ageBins['56+']++;
                });
                setAgeDistribution(Object.entries(ageBins).map(([label, value]) => ({ label, value })));

                const countryCounts = usersData.reduce<Record<string, number>>((acc, user) => {
                    if (user.pais) acc[user.pais] = (acc[user.pais] || 0) + 1;
                    return acc;
                }, {});
                const countryEntries: [string, number][] = Object.entries(countryCounts);
                const sortedCountries = countryEntries.sort((a, b) => b[1] - a[1]);
                const top5 = sortedCountries.slice(0, 5);
                const others = sortedCountries.slice(5).reduce((sum, curr) => sum + curr[1], 0);
                const countryChartData = top5.map(([label, value]) => ({ label, value }));
                if (others > 0) countryChartData.push({ label: 'Outros', value: others });
                setCountryDistribution(countryChartData);
            }

            if (localNonAdminUserIds.length === 0) {
                 setStats(prev => ({ ...prev, totalEnrollments: 0, completedCoursesUsers: 0 }));
                 setCoursePopularity([]);
                 setEnrollmentsOverTime([]);
                 if (!signal.aborted) setLoading(false);
                 return;
            }

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const [enrollmentsRes, passedAttemptsRes, enrollmentsWithCoursesRes, recentEnrollmentsRes] = await Promise.all([
                supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('user_id', localNonAdminUserIds).abortSignal(signal),
                supabase.from('quiz_attempts').select('user_id').eq('passed', true).in('user_id', localNonAdminUserIds).abortSignal(signal),
                supabase.from('enrollments').select('courses(id, title)').in('user_id', localNonAdminUserIds).abortSignal(signal),
                supabase.from('enrollments').select('enrolled_at').in('user_id', localNonAdminUserIds).gte('enrolled_at', thirtyDaysAgo.toISOString()).abortSignal(signal)
            ]);

            if (signal.aborted) return;

            const { count: totalEnrollments, error: enrollmentsError } = enrollmentsRes;
            if (enrollmentsError) throw enrollmentsError;
            setStats(prev => ({ ...prev, totalEnrollments: totalEnrollments ?? 0 }));
            
            const { data: passedAttempts, error: passedAttemptsError } = passedAttemptsRes;
            if (passedAttemptsError) throw passedAttemptsError;
            const completedCoursesUsers = new Set(passedAttempts?.map(a => a.user_id)).size;
            setStats(prev => ({...prev, completedCoursesUsers}));

            const { data: enrollmentsWithCourses, error: enrollmentsCoursesError } = enrollmentsWithCoursesRes;
            if(enrollmentsCoursesError) throw enrollmentsCoursesError;
            if (enrollmentsWithCourses) {
                const popularity = enrollmentsWithCourses.reduce<Record<string, number>>((acc, curr) => {
                    const course = Array.isArray(curr.courses) ? curr.courses[0] : curr.courses;
                    if (course?.title) {
                        acc[course.title] = (acc[course.title] || 0) + 1;
                    }
                    return acc;
                }, {});
                setCoursePopularity(Object.entries(popularity).map(([title, enrollments]) => ({ title, enrollments: enrollments as number })).sort((a, b) => b.enrollments - a.enrollments));
            }
            
            const { data: recentEnrollments, error: recentEnrollmentsError } = recentEnrollmentsRes;
            if(recentEnrollmentsError) throw recentEnrollmentsError;
            if (recentEnrollments) {
                const countsByDate = recentEnrollments.reduce<Record<string, number>>((acc, curr) => {
                    const date = new Date(curr.enrolled_at).toLocaleDateString('pt-BR');
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});
                setEnrollmentsOverTime(Object.entries(countsByDate).map(([date, count]) => ({ date, count: count as number })).sort((a,b) => {
                    const partsA = a.date.split('/');
                    const dateA = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0]));
                    const partsB = b.date.split('/');
                    const dateB = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0]));
                    return dateA.getTime() - dateB.getTime();
                }));
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error fetching analytics data:", error);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchData();

        const channel = supabase.channel('admin-analytics-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, fetchData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, fetchData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_attempts' }, fetchData)
          .subscribe();

        return () => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const showStudentList = async (title: string, query: any) => {
        setIsModalOpen(true);
        setModalData({ title, items: [], loading: true });

        const { data: profiles, error } = await query;
        
        if (error) {
             setModalData({ title, items: ['Erro ao buscar alunos.'], loading: false });
        } else {
            const studentNames = profiles.map((p: {full_name: string}) => p.full_name).filter(Boolean) as string[];
            setModalData({ title, items: studentNames, loading: false });
        }
    };

    const handleStatCardClick = async (type: 'total' | 'enrolled' | 'completed') => {
        let title = '';
        let query;

        const { data: currentNonAdminUsers, error: userError } = await supabase.from('user_profiles').select('id').eq('is_admin', false);
        if (userError || !currentNonAdminUsers) {
             showStudentList('Erro', Promise.resolve({ error: { message: 'Não foi possível buscar usuários.' }}));
             return;
        }
        const currentNonAdminUserIds = currentNonAdminUsers.map(u => u.id);

        switch (type) {
            case 'total':
                title = 'Total de Alunos';
                query = supabase.from('user_profiles').select('full_name').in('id', currentNonAdminUserIds);
                break;
            case 'enrolled':
                title = 'Alunos com Inscrições';
                const { data: enrollData, error: enrollError } = await supabase.from('enrollments').select('user_id').in('user_id', currentNonAdminUserIds);
                if (enrollError) { showStudentList(title, Promise.resolve({ error: enrollError })); return; }
                const enrolledUserIds = [...new Set(enrollData.map(e => e.user_id))];
                query = supabase.from('user_profiles').select('full_name').in('id', enrolledUserIds);
                break;
            case 'completed':
                title = 'Alunos com Cursos Concluídos';
                const { data: attemptData, error: attemptError } = await supabase.from('quiz_attempts').select('user_id').eq('passed', true).in('user_id', currentNonAdminUserIds);
                if (attemptError) { showStudentList(title, Promise.resolve({ error: attemptError })); return; }
                const completedUserIds = [...new Set(attemptData.map(a => a.user_id))];
                query = supabase.from('user_profiles').select('full_name').in('id', completedUserIds);
                break;
            default: return;
        }
        showStudentList(title, query);
    };
    
    const handleCourseBarClick = async (courseTitle: string) => {
        const { data: courseData, error: courseError } = await supabase.from('courses').select('id').eq('title', courseTitle).single();
        if (courseError || !courseData) {
            showStudentList(`Alunos em "${courseTitle}"`, Promise.resolve({ error: { message: 'Curso não encontrado' }}));
            return;
        }
        const { data: enrollments, error: enrollError } = await supabase.from('enrollments').select('user_id').eq('course_id', courseData.id);
        if (enrollError) { showStudentList(`Alunos em "${courseTitle}"`, Promise.resolve({ error: enrollError })); return; }
        
        const userIds = enrollments.map(e => e.user_id).filter(id => nonAdminUserIds.includes(id));
        
        if (userIds.length === 0) {
            setModalData({ title: `Alunos em "${courseTitle}"`, items: [], loading: false });
            setIsModalOpen(true);
            return;
        }
        const query = supabase.from('user_profiles').select('full_name').in('id', userIds);
        showStudentList(`Alunos em "${courseTitle}"`, query);
    };

    const handleEnrollmentDateClick = async (dateStr: string) => {
        const parts = dateStr.split('/');
        const startDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const { data, error } = await supabase.from('enrollments').select('user_id').gte('enrolled_at', startDate.toISOString()).lt('enrolled_at', endDate.toISOString());
        if (error) { showStudentList(`Novas Inscrições em ${dateStr}`, Promise.resolve({ error })); return; }
        
        const userIds = data.map(e => e.user_id).filter(id => nonAdminUserIds.includes(id));
        
         if (userIds.length === 0) {
            setModalData({ title: `Novas Inscrições em ${dateStr}`, items: [], loading: false });
            setIsModalOpen(true);
            return;
        }
        const query = supabase.from('user_profiles').select('full_name').in('id', userIds);
        showStudentList(`Novas Inscrições em ${dateStr}`, query);
    };

    const handleAgeBarClick = async (ageRange: string) => {
        const [min, max] = ageRange.replace('+', '-999').split('-').map(Number);
        const query = supabase.from('user_profiles').select('full_name').eq('is_admin', false).gte('idade', min).lte('idade', max);
        showStudentList(`Alunos na Faixa Etária: ${ageRange}`, query);
    };

    const handleCountryBarClick = async (country: string) => {
        let query;
        let title = `Alunos de ${country}`;
        if (country === 'Outros') {
            title = `Alunos de Outros Países`;
            const topCountries = countryDistribution.filter(c => c.label !== 'Outros').map(c => c.label);
            query = supabase.from('user_profiles').select('full_name').eq('is_admin', false).not('pais', 'in', `(${topCountries.map(c => `'${c}'`).join(',')})`);
        } else {
            query = supabase.from('user_profiles').select('full_name').eq('is_admin', false).eq('pais', country);
        }
        showStudentList(title, query);
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Relatório de Análise - MozUp Academy", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 29);
        
        autoTable(doc, {
            startY: 40,
            head: [['Métrica', 'Valor']],
            body: [
                ['Total de Alunos Ativos', stats.totalUsers],
                ['Total de Inscrições em Cursos', stats.totalEnrollments],
                ['Alunos com Pelo Menos 1 Curso Concluído', stats.completedCoursesUsers],
                ['Idade Média dos Alunos', stats.averageAge > 0 ? stats.averageAge : 'N/A'],
                ['Total de Alunos (Homens)', genderDistribution.masculino],
                ['Total de Alunos (Mulheres)', genderDistribution.feminino],
            ],
            theme: 'grid'
        });

        let lastY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            startY: lastY + 15,
            head: [['Curso', 'Nº de Inscrições']],
            body: coursePopularity.map(c => [c.title, c.enrollments]),
            didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text("Popularidade dos Cursos", data.settings.margin.left, lastY + 10);
            }
        });
        
        lastY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            startY: lastY + 15,
            head: [['Faixa Etária', 'Nº de Alunos']],
            body: ageDistribution.map(item => [item.label, item.value]),
            didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text("Distribuição por Idade", data.settings.margin.left, lastY + 10);
            }
        });

        lastY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            startY: lastY + 15,
            head: [['País', 'Nº de Alunos']],
            body: countryDistribution.map(item => [item.label, item.value]),
            didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text("Distribuição Geográfica", data.settings.margin.left, lastY + 10);
            }
        });

        doc.save('relatorio_analise_mozup_academy.pdf');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div></div>;
    }
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Análise de Dados</h1>
                    <p className="text-gray-600 mt-1">Insights sobre o desempenho da plataforma.</p>
                </div>
                 <button onClick={exportToPDF} className="bg-brand-moz text-white font-semibold py-2 px-5 rounded-lg hover:bg-brand-up transition-all shadow-sm transform hover:-translate-y-0.5">
                    Exportar Relatório PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard onClick={() => handleStatCardClick('total')} title="Total de Alunos" value={stats.totalUsers} description="Número de usuários não-administradores." />
                <StatCard onClick={() => handleStatCardClick('enrolled')} title="Total de Inscrições" value={stats.totalEnrollments} description="Inscrições totais em todos os cursos." />
                <StatCard onClick={() => handleStatCardClick('completed')} title="Conclusões" value={stats.completedCoursesUsers} description="Alunos que concluíram pelo menos um curso." />
                <StatCard title="Idade Média" value={stats.averageAge > 0 ? stats.averageAge : 'N/A'} description="Média de idade dos alunos." />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Popularidade dos Cursos" data={coursePopularity.map(c => ({ label: c.title, value: c.enrollments }))} onBarClick={handleCourseBarClick} />
                <BarChart title="Novas Inscrições (Últimos 30 Dias)" data={enrollmentsOverTime.map(e => ({ label: e.date, value: e.count }))} onBarClick={handleEnrollmentDateClick} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Distribuição por Idade" data={ageDistribution} onBarClick={handleAgeBarClick} />
                 <BarChart title="Distribuição Geográfica" data={countryDistribution} onBarClick={handleCountryBarClick} />
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">{modalData.title}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
                        </div>
                        <div className="my-6 overflow-y-auto">
                            {modalData.loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-moz"></div>
                                </div>
                            ) : modalData.items.length > 0 ? (
                                <ul className="space-y-2">
                                    {modalData.items.map((item, index) => (
                                        <li key={index} className="bg-gray-50 p-3 rounded-md text-gray-700">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Nenhum item para exibir.</p>
                            )}
                        </div>
                        <div className="flex justify-end pt-4 border-t mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 px-5 py-2 rounded-md text-gray-800 font-semibold hover:bg-gray-300">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;