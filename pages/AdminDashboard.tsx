import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

// --- Data Interfaces ---
interface ChartDataPoint { label: string; value: number; }
interface StudentStatusData { inProgress: number; completed: number; requestedCertificate: number; }
interface KpiStatsData { totalUsers: number; totalEnrollments: number; totalCompletions: number; pendingCertificates: number; }

// --- Icons ---
// FIX: Explicitly type icon components as React.FC for better type inference with cloneElement.
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 3.375c-3.418 0-6.162 2.744-6.162 6.162s2.744 6.162 6.162 6.162 6.162-2.744 6.162-6.162S15.418 3.375 12 3.375z" /></svg>;
const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5H18a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25-2.25H6.75a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25z" /></svg>;
const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422A12.083 12.083 0 0122 12V6" /><path d="M12 21.76V14l-9-5v6.76c0 .54.2 1.05.57 1.43L12 21.76z" /></svg>;
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Interactive/Animated Components ---
const CountUp: React.FC<{ end: number; duration?: number }> = ({ end, duration = 1500 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(end * percentage));
            if (progress < duration) requestAnimationFrame(animate); else setCount(end);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);
    return <>{count}</>;
};

// FIX: Update the `icon` prop type to be more specific. This allows TypeScript to
// correctly infer that props like `className` are valid for the cloned element.
const StatCard: React.FC<{ title: string; value: number; icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-4xl font-extrabold text-gray-800 mt-2"><CountUp end={value} /></p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                {React.cloneElement(icon, { className: "w-7 h-7 text-white" })}
            </div>
        </div>
    </div>
);


const ChartCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-transparent hover:border-gray-200 hover:shadow-xl h-full flex flex-col transition-all duration-300 ${className}`}>
        <h3 className="font-bold text-lg mb-4 text-gray-800 flex-shrink-0">{title}</h3>
        <div className="flex-grow flex flex-col justify-center">
            {children}
        </div>
    </div>
);

const BarChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const AnimatedBar: React.FC<{ item: ChartDataPoint }> = ({ item }) => {
        const [width, setWidth] = useState('0%');
        useEffect(() => {
            const timer = setTimeout(() => setWidth(`${(item.value / maxValue) * 100}%`), 100);
            return () => clearTimeout(timer);
        }, [item.value]);
        return (
            <div className="flex items-center text-sm group transition-colors duration-200 hover:bg-brand-light/50 p-1 -m-1 rounded-lg">
                <div className="w-1/3 truncate pr-2 text-gray-600 font-medium">{item.label}</div>
                <div className="w-2/3 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                        <div className="bg-gradient-to-r from-brand-up to-brand-moz h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-1000 ease-out" style={{ width }}>
                            <span className="transition-opacity duration-500" style={{ opacity: width === '0%' ? 0 : 1 }}>{item.value}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="space-y-3">
            {data.length > 0 ? data.map(item => <AnimatedBar key={item.label} item={item} />) : <p className="text-gray-500 text-center py-8">Não há dados para exibir.</p>}
        </div>
    );
};

interface PieChartProps { data: StudentStatusData; highlightedStatus: string | null; onHighlight: (status: string | null) => void; }
const PieChart: React.FC<PieChartProps> = ({ data, highlightedStatus, onHighlight }) => {
    const chartData = [
        { label: 'Em progresso', value: data.inProgress, color: '#f7941d' },
        { label: 'Concluíram', value: data.completed, color: '#d95829' },
        { label: 'Cert. Solicitado', value: data.requestedCertificate, color: '#6b7280' }
    ];
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-center py-8">Não há dados de alunos.</p></div>;
    const selectedItem = highlightedStatus ? chartData.find(item => item.label === highlightedStatus) : null;
    let conicGradient: string;
    if (selectedItem) {
        conicGradient = selectedItem.color;
    } else {
        let cumulativePercentage = 0;
        const gradientParts = chartData.map(item => {
            const percentage = (item.value / total) * 100;
            const start = cumulativePercentage;
            cumulativePercentage += percentage;
            return `${item.color} ${start}% ${cumulativePercentage}%`;
        });
        conicGradient = `conic-gradient(${gradientParts.join(', ')})`;
    }
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full">
            <div className="relative flex items-center justify-center">
                 <div className="w-40 h-40 rounded-full transition-all duration-500 ease-in-out" style={{ background: conicGradient }}></div>
                 <div className={`absolute w-24 h-24 bg-white rounded-full transition-opacity duration-300 ${selectedItem ? 'opacity-0' : 'opacity-100'}`}></div>
                 {selectedItem && (
                    <div className="absolute text-center animate-fadeInUp" style={{ animationDuration: '0.3s' }}>
                        <p className="text-4xl font-bold" style={{ color: selectedItem.color }}>{selectedItem.value}</p>
                        <p className="text-sm text-gray-600 font-semibold max-w-[100px] leading-tight">{selectedItem.label}</p>
                    </div>
                )}
            </div>
            <ul className="space-y-2 text-sm">
                {chartData.map(item => (
                    <li key={item.label} onClick={() => onHighlight(highlightedStatus === item.label ? null : item.label)} className={`flex items-center p-1 rounded-md transition-all duration-300 cursor-pointer ${highlightedStatus && highlightedStatus !== item.label ? 'opacity-50 hover:opacity-100' : 'opacity-100'} ${highlightedStatus === item.label ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="font-semibold text-gray-700">{item.label}:</span>
                        <span className="ml-2 text-gray-600">{item.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [kpiStats, setKpiStats] = useState<KpiStatsData>({ totalUsers: 0, totalEnrollments: 0, totalCompletions: 0, pendingCertificates: 0 });
    const [coursePopularity, setCoursePopularity] = useState<ChartDataPoint[]>([]);
    const [studentStatus, setStudentStatus] = useState<StudentStatusData>({ inProgress: 0, completed: 0, requestedCertificate: 0 });
    const [highlightedStatus, setHighlightedStatus] = useState<string | null>(null);

    const fetchAllData = useCallback(async () => {
        // Não mostrar o spinner para atualizações em tempo real, apenas para o carregamento inicial.
        // setLoading(true) foi removido daqui para uma melhor experiência do utilizador.
        try {
            const [ popularityRes, enrollmentsRes, completionsRes, requestsRes, pendingCertsRes, totalUsersRes ] = await Promise.all([
                supabase.from('enrollments').select('courses(title)'),
                supabase.from('enrollments').select('user_id', { count: 'exact' }),
                supabase.from('quiz_attempts').select('user_id').eq('passed', true),
                supabase.from('certificate_requests').select('user_id'),
                supabase.from('certificate_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('is_admin', false),
            ]);

            // KPI Stats
            const completedUsers = new Set(completionsRes.data?.map(c => c.user_id));
            setKpiStats({
                totalUsers: totalUsersRes.count ?? 0,
                totalEnrollments: enrollmentsRes.count ?? 0,
                totalCompletions: completedUsers.size,
                pendingCertificates: pendingCertsRes.count ?? 0,
            });

            // Course Popularity Chart
            if (popularityRes.data) {
                const popularity = popularityRes.data.reduce<Record<string, number>>((acc, curr) => {
                    // FIX: Address potential type ambiguity from Supabase joins where a to-one
                    // relationship can be returned as an object or an array.
                    const course = Array.isArray(curr.courses) ? curr.courses[0] : curr.courses;
                    if (course?.title) {
                        acc[course.title] = (acc[course.title] || 0) + 1;
                    }
                    return acc;
                }, {});
                // FIX: The `value` from `Object.entries` can be inferred as `unknown`, so we explicitly cast it to `number`.
                setCoursePopularity(Object.entries(popularity).map(([label, value]) => ({ label, value: value as number })).sort((a, b) => b.value - a.value));
            }

            // Student Status Pie Chart
            const enrolledUsers = new Set(enrollmentsRes.data?.map(e => e.user_id));
            const requestedUsers = new Set(requestsRes.data?.map(r => r.user_id));
            let inProgress = 0, completed = 0;
            enrolledUsers.forEach(userId => {
                if (completedUsers.has(userId)) {
                    if (!requestedUsers.has(userId)) completed++;
                } else { inProgress++; }
            });
            setStudentStatus({ inProgress, completed, requestedCertificate: requestedUsers.size });

        } catch (error) { console.error("Error fetching dashboard data:", error);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchAllData(); // Carregamento inicial

        // Subscrição em tempo real para atualizações automáticas
        const channel = supabase.channel('admin-dashboard-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, fetchAllData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_attempts' }, fetchAllData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'certificate_requests' }, fetchAllData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, fetchAllData)
          .subscribe();
    
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAllData]);
    
    if (loading) return (
        <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div></div>
    );

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-4xl font-extrabold text-gray-900">Dashboard de Análise</h1>
                <p className="text-xl text-gray-600 mt-2">Visão geral da performance da plataforma.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total de Alunos" value={kpiStats.totalUsers} icon={<UsersIcon />} color="bg-blue-500" />
                <StatCard title="Total de Inscrições" value={kpiStats.totalEnrollments} icon={<ClipboardListIcon />} color="bg-brand-moz" />
                <StatCard title="Conclusões de Cursos" value={kpiStats.totalCompletions} icon={<AcademicCapIcon />} color="bg-brand-up" />
                <StatCard title="Certificados Pendentes" value={kpiStats.pendingCertificates} icon={<ClockIcon />} color="bg-gray-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3"><ChartCard title="Total de Inscrições por Curso"><BarChart data={coursePopularity} /></ChartCard></div>
                <div className="lg:col-span-2"><ChartCard title="Estado dos Alunos"><PieChart data={studentStatus} highlightedStatus={highlightedStatus} onHighlight={setHighlightedStatus} /></ChartCard></div>
            </div>
        </div>
    );
};

export default AdminDashboard;
