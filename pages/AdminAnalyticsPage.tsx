import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnalyticsStats {
    totalUsers: number;
    totalEnrollments: number;
    completedCoursesUsers: number;
}

interface CoursePopularity {
    title: string;
    enrollments: number;
}

interface EnrollmentsOverTime {
    date: string;
    count: number;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border hover:-translate-y-1 transition-transform duration-300">
        <h3 className="text-gray-500 text-sm font-semibold uppercase">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        <p className="text-gray-500 text-xs mt-1">{description}</p>
    </div>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border hover:-translate-y-1 transition-transform duration-300">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="space-y-3">
                {data.length > 0 ? data.map(item => (
                    <div key={item.label} className="flex items-center text-sm">
                        <div className="w-1/3 truncate pr-2 text-gray-600">{item.label}</div>
                        <div className="w-2/3 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-5">
                                <div 
                                    className="bg-brand-moz h-5 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                >
                                  {item.value}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-500">Não há dados para exibir.</p>}
            </div>
        </div>
    )
}


const AdminAnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AnalyticsStats>({ totalUsers: 0, totalEnrollments: 0, completedCoursesUsers: 0 });
    const [coursePopularity, setCoursePopularity] = useState<CoursePopularity[]>([]);
    const [enrollmentsOverTime, setEnrollmentsOverTime] = useState<EnrollmentsOverTime[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch stats
            const { count: totalUsers } = await supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('is_admin', false);
            const { count: totalEnrollments } = await supabase.from('enrollments').select('id', { count: 'exact', head: true });
            const { data: passedAttempts } = await supabase.from('quiz_attempts').select('user_id').eq('passed', true);
            const completedCoursesUsers = new Set(passedAttempts?.map(a => a.user_id)).size;

            setStats({
                totalUsers: totalUsers ?? 0,
                totalEnrollments: totalEnrollments ?? 0,
                completedCoursesUsers: completedCoursesUsers
            });

            // Fetch course popularity
            const { data: enrollmentsWithCourses, error: enrollError } = await supabase.from('enrollments').select('courses(id, title)');
            if (enrollmentsWithCourses) {
                const popularity = enrollmentsWithCourses.reduce((acc, curr) => {
                    if (!curr.courses) return acc;
                    acc[curr.courses.title] = (acc[curr.courses.title] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                setCoursePopularity(Object.entries(popularity).map(([title, enrollments]) => ({ title, enrollments })).sort((a, b) => b.enrollments - a.enrollments));
            }

            // Fetch enrollments over time (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { data: recentEnrollments } = await supabase.from('enrollments').select('enrolled_at').gte('enrolled_at', thirtyDaysAgo.toISOString());
            if (recentEnrollments) {
                const countsByDate = recentEnrollments.reduce((acc, curr) => {
                    const date = new Date(curr.enrolled_at).toLocaleDateString('pt-BR');
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                // FIX: Used getTime() for explicit date comparison. Subtracting Date objects
                // directly can cause type errors in strict TypeScript configurations. Using
                // getTime() returns a number and ensures type-safe arithmetic.
                 setEnrollmentsOverTime(Object.entries(countsByDate).map(([date, count]) => ({ date, count })).sort((a,b) => {
                    const partsA = a.date.split('/');
                    const dateA = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0]));
                    const partsB = b.date.split('/');
                    const dateB = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0]));
                    // FIX: Used getTime() for explicit date comparison. Subtracting Date objects
                    // directly can cause type errors in strict TypeScript configurations. Using
                    // getTime() returns a number and ensures type-safe arithmetic.
                    return dateA.getTime() - dateB.getTime();
                 }));
            }

            setLoading(false);
        };
        fetchData();
    }, []);
    
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Relatório de Análise - MozupAcademy", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 29);
        
        autoTable(doc, {
            startY: 40,
            head: [['Métrica', 'Valor']],
            body: [
                ['Total de Alunos Ativos', stats.totalUsers],
                ['Total de Inscrições em Cursos', stats.totalEnrollments],
                ['Alunos com Pelo Menos 1 Curso Concluído', stats.completedCoursesUsers]
            ],
            theme: 'grid'
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Curso', 'Nº de Inscrições']],
            body: coursePopularity.map(c => [c.title, c.enrollments]),
            didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text("Popularidade dos Cursos", data.settings.margin.left, (doc as any).lastAutoTable.finalY + 10);
            }
        });
        
        autoTable(doc, {
             startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Data', 'Nº de Novas Inscrições']],
            body: enrollmentsOverTime.map(e => [e.date, e.count]),
             didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text("Inscrições nos Últimos 30 Dias", data.settings.margin.left, (doc as any).lastAutoTable.finalY + 10);
            }
        });

        doc.save('relatorio_analise_mozupacademy.pdf');
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total de Alunos" value={stats.totalUsers} description="Número de usuários não-administradores." />
                <StatCard title="Total de Inscrições" value={stats.totalEnrollments} description="Inscrições totais em todos os cursos." />
                <StatCard title="Conclusões" value={stats.completedCoursesUsers} description="Alunos que concluíram pelo menos um curso." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Popularidade dos Cursos" data={coursePopularity.map(c => ({ label: c.title, value: c.enrollments }))} />
                <BarChart title="Novas Inscrições (Últimos 30 Dias)" data={enrollmentsOverTime.map(e => ({ label: e.date, value: e.count }))} />
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;