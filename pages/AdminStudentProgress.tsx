

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, Course } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface StudentProgressInfo {
  enrollmentId: string;
  user: Partial<UserProfile> & { email?: string | null };
  course: Partial<Course>;
  progress: number;
  enrolled_at: string;
}

const AdminStudentProgress: React.FC = () => {
    const [studentProgress, setStudentProgress] = useState<StudentProgressInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<(Partial<UserProfile> & { email?: string | null }) | null>(null);
    const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);

    // --- Filter State ---
    const [nameFilter, setNameFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState('all');
    const [sexoFilter, setSexoFilter] = useState('all');
    const [progressFilter, setProgressFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // --- State for filter dropdown options ---
    const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
    const [uniqueCompanies, setUniqueCompanies] = useState<string[]>([]);


    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch all enrollments
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('id, course_id, user_id, enrolled_at')
                    .order('enrolled_at', { ascending: false });

                if (enrollError) throw enrollError;
                if (!enrollments || enrollments.length === 0) {
                    setStudentProgress([]);
                    setLoading(false);
                    return;
                }
                
                const userIds = [...new Set(enrollments.map(e => e.user_id))];
                const courseIds = [...new Set(enrollments.map(e => e.course_id))];
                
                // 2. Batch fetch all related data in parallel to be efficient
                const [usersRes, coursesRes, modulesRes, progressRes] = await Promise.all([
                    supabase.from('user_profiles').select('*').in('id', userIds),
                    supabase.from('courses').select('*').in('id', courseIds),
                    supabase.from('modules').select('id, course_id').in('course_id', courseIds),
                    supabase.from('user_progress').select('user_id, module_id').in('user_id', userIds)
                ]);

                if (usersRes.error) throw usersRes.error;
                if (coursesRes.error) throw coursesRes.error;
                if (modulesRes.error) throw modulesRes.error;
                if (progressRes.error) throw progressRes.error;
                
                // 3. Process data into maps for fast, efficient lookups in memory
                const usersMap = new Map(usersRes.data.map(u => [u.id, u]));
                const coursesMap = new Map(coursesRes.data.map(c => [c.id, c]));
                
                const modulesByCourse = modulesRes.data.reduce<Record<string, string[]>>((acc, module) => {
                    if (!acc[module.course_id]) acc[module.course_id] = [];
                    acc[module.course_id].push(module.id);
                    return acc;
                }, {});

                const completedModulesByUser = progressRes.data.reduce<Record<string, Set<string>>>((acc, progress) => {
                    if (!acc[progress.user_id]) acc[progress.user_id] = new Set();
                    acc[progress.user_id].add(progress.module_id);
                    return acc;
                }, {});

                // 4. Calculate progress for each enrollment using the prepared maps
                const results = enrollments.map(enr => {
                    // FIX: Expanded the fallback user object to include all properties accessed later.
                    // This ensures that even if a user profile is missing (e.g., deleted), the app
                    // doesn't crash and has default values to display.
                    const user = usersMap.get(enr.user_id) || { 
                        id: enr.user_id, 
                        full_name: '[Usuário Removido]',
                        company_name: null,
                        email: null,
                        phone_number: null,
                        sexo: null,
                        is_admin: false,
                    };
                    const course = coursesMap.get(enr.course_id) || { id: enr.course_id, title: '[Curso Removido]' };

                    const courseModuleIds = modulesByCourse[enr.course_id] || [];
                    const totalModules = courseModuleIds.length;
                    
                    if (totalModules === 0) {
                        return { enrollmentId: enr.id, user, course, progress: 0, enrolled_at: enr.enrolled_at };
                    }

                    const userCompletedModules = completedModulesByUser[enr.user_id] || new Set();
                    const completedInThisCourse = courseModuleIds.filter(moduleId => userCompletedModules.has(moduleId)).length;
                    
                    const progress = (completedInThisCourse / totalModules) * 100;

                    return { 
                        enrollmentId: enr.id, 
                        user, 
                        course, 
                        progress: Math.round(progress),
                        enrolled_at: enr.enrolled_at
                    };
                });
                
                if (results) {
                    setStudentProgress(results as StudentProgressInfo[]);
                    const courses = [...new Set(results.map(p => p.course.title).filter(Boolean) as string[])];
                    const companies = [...new Set(results.map(p => p.user.company_name).filter(Boolean) as string[])];
                    setUniqueCourses(courses.sort());
                    setUniqueCompanies(companies.sort());
                }

            } catch (err: any) {
                console.error("Error fetching student progress:", err.message || err);
                setError("Não foi possível carregar o progresso dos alunos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);
    
    const filteredProgress = useMemo(() => {
        return studentProgress.filter(item => {
            if (!item.user || !item.course) return false;
            
            if (nameFilter && !item.user.full_name?.toLowerCase().includes(nameFilter.toLowerCase())) return false;
            if (courseFilter !== 'all' && item.course.title !== courseFilter) return false;
            if (companyFilter !== 'all' && item.user.company_name !== companyFilter) return false;
            if (sexoFilter !== 'all' && item.user.sexo !== sexoFilter) return false;

            const progress = item.progress;
            if (progressFilter !== 'all') {
                switch (progressFilter) {
                    case '0': if (progress !== 0) return false; break;
                    case '1-50': if (progress < 1 || progress > 50) return false; break;
                    case '51-99': if (progress < 51 || progress > 99) return false; break;
                    case '100': if (progress !== 100) return false; break;
                }
            }

            if (statusFilter !== 'all') {
                 switch (statusFilter) {
                    case 'parado': if (progress !== 0) return false; break;
                    case 'ativo': if (progress <= 0 || progress >= 100) return false; break;
                    case 'concluido': if (progress !== 100) return false; break;
                }
            }
            return true;
        });
    }, [studentProgress, nameFilter, courseFilter, companyFilter, sexoFilter, progressFilter, statusFilter]);

    const resetFilters = () => {
        setNameFilter('');
        setCourseFilter('all');
        setCompanyFilter('all');
        setSexoFilter('all');
        setProgressFilter('all');
        setStatusFilter('all');
    };

    const handleShowStudentDetails = (student: Partial<UserProfile> & { email?: string | null }) => {
        setSelectedStudent(student);
        setShowStudentDetailModal(true);
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableData = filteredProgress.map(item => [
            item.user.full_name || 'N/A',
            item.user.email || 'N/A',
            item.user.company_name || 'N/A',
            item.course.title || 'N/A',
            new Date(item.enrolled_at).toLocaleDateString(),
            `${item.progress}%`,
        ]);
        autoTable(doc, {
            head: [['Aluno', 'Email', 'Empresa', 'Curso', 'Data de Inscrição', 'Progresso']],
            body: tableData,
        });
        doc.save('progresso_alunos.pdf');
    };

    const exportToExcel = () => {
        const dataToExport = filteredProgress.map(item => ({
            'Aluno': item.user.full_name || 'N/A',
            'Email': item.user.email || 'N/A',
            'Empresa': item.user.company_name || 'N/A',
            'Sexo': item.user.sexo || 'N/A',
            'Curso': item.course.title || 'N/A',
            'Data de Inscrição': new Date(item.enrolled_at).toLocaleDateString(),
            'Progresso (%)': item.progress,
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Progresso');
        XLSX.writeFile(wb, 'progresso_alunos.xlsx');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Progresso dos Alunos</h1>
                    <p className="text-gray-600 mt-1">Acompanhe o andamento dos alunos nos cursos.</p>
                </div>
                 <div className="space-x-2">
                    <button onClick={exportToPDF} className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border shadow-sm transition-all duration-200">Exportar PDF</button>
                    <button onClick={exportToExcel} className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border shadow-sm transition-all duration-200">Exportar Excel</button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                        <label htmlFor="name-filter" className="block text-xs font-medium text-gray-500 mb-1">Pesquisar por Aluno</label>
                        <input
                            id="name-filter" type="text" placeholder="Digite o nome..." value={nameFilter} onChange={e => setNameFilter(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz"
                        />
                    </div>
                    <div>
                        <label htmlFor="course-filter" className="block text-xs font-medium text-gray-500 mb-1">Curso</label>
                        <select id="course-filter" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todos</option>
                            {uniqueCourses.map(course => <option key={course} value={course}>{course}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="company-filter" className="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
                        <select id="company-filter" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todas</option>
                            {uniqueCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sexo-filter" className="block text-xs font-medium text-gray-500 mb-1">Sexo</label>
                        <select id="sexo-filter" value={sexoFilter} onChange={e => setSexoFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todos</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="progress-filter" className="block text-xs font-medium text-gray-500 mb-1">Progresso</label>
                        <select id="progress-filter" value={progressFilter} onChange={e => setProgressFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todos</option>
                            <option value="0">0%</option>
                            <option value="1-50">1 - 50%</option>
                            <option value="51-99">51 - 99%</option>
                            <option value="100">100%</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todos</option>
                            <option value="parado">Parado</option>
                            <option value="ativo">Ativo</option>
                            <option value="concluido">Concluído</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button onClick={resetFilters} className="text-sm font-semibold text-gray-600 hover:text-brand-up transition-colors duration-200">
                        Limpar Filtros
                    </button>
                </div>
            </div>


            <div className="bg-white shadow-md rounded-lg overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data de Inscrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-6 text-gray-500">Carregando...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="text-center p-6 text-red-500">{error}</td></tr>
                        ) : filteredProgress.length > 0 ? (
                            filteredProgress.map(item => (
                                <tr key={item.enrollmentId} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleShowStudentDetails(item.user)} className="font-medium text-brand-up hover:underline" disabled={item.user.full_name === '[Usuário Removido]'}>
                                            {item.user.full_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.user.company_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.course.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(item.enrolled_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                                <div className="bg-brand-moz h-2.5 rounded-full" style={{width: `${item.progress}%`}}></div>
                                            </div>
                                            <span className="text-sm text-gray-600 font-semibold w-10 text-right">{item.progress}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={5} className="text-center p-10 text-gray-500">
                                {studentProgress.length > 0 ? 'Nenhum resultado encontrado para os filtros aplicados.' : 'Nenhum aluno inscrito ainda.'}
                             </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showStudentDetailModal && selectedStudent && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Aluno</h2>
                            <button onClick={() => setShowStudentDetailModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
                        </div>
                        <div className="my-6 space-y-3 text-gray-700">
                            <div><strong className="font-semibold text-gray-500">Nome:</strong> {selectedStudent.full_name}</div>
                            <div><strong className="font-semibold text-gray-500">Email:</strong> {selectedStudent.email || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500">Empresa:</strong> {selectedStudent.company_name || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500">Telefone:</strong> {selectedStudent.phone_number || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500">Sexo:</strong> {selectedStudent.sexo ? (selectedStudent.sexo.charAt(0).toUpperCase() + selectedStudent.sexo.slice(1)) : 'Não informado'}</div>
                        </div>
                        <div className="flex justify-end pt-4 border-t mt-auto">
                            <button onClick={() => setShowStudentDetailModal(false)} className="bg-gray-200 px-5 py-2 rounded-md text-gray-800 font-semibold hover:bg-gray-300">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudentProgress;