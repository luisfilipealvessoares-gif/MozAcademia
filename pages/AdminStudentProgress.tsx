import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, Course } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const countries = ["Afeganistão", "África do Sul", "Albânia", "Alemanha", "Andorra", "Angola", "Antiga e Barbuda", "Arábia Saudita", "Argélia", "Argentina", "Arménia", "Austrália", "Áustria", "Azerbaijão", "Bahamas", "Bangladexe", "Barbados", "Barém", "Bélgica", "Belize", "Benim", "Bielorrússia", "Bolívia", "Bósnia e Herzegovina", "Botsuana", "Brasil", "Brunei", "Bulgária", "Burquina Faso", "Burúndi", "Butão", "Cabo Verde", "Camarões", "Camboja", "Canadá", "Catar", "Cazaquistão", "Chade", "Chile", "China", "Chipre", "Colômbia", "Comores", "Congo-Brazzaville", "Congo-Kinshasa", "Coreia do Norte", "Coreia do Sul", "Cosovo", "Costa do Marfim", "Costa Rica", "Croácia", "Cuaite", "Cuba", "Dinamarca", "Jibuti", "Dominica", "Egito", "Emirados Árabes Unidos", "Equador", "Eritreia", "Eslováquia", "Eslovénia", "Espanha", "Estado da Palestina", "Estados Unidos", "Estónia", "Etiópia", "Fiji", "Filipinas", "Finlândia", "França", "Gabão", "Gâmbia", "Gana", "Geórgia", "Granada", "Grécia", "Guatemala", "Guiana", "Guiné", "Guiné Equatorial", "Guiné-Bissau", "Haiti", "Honduras", "Hungria", "Iémen", "Ilhas Marechal", "Ilhas Salomão", "Índia", "Indonésia", "Irão", "Iraque", "Irlanda", "Islândia", "Israel", "Itália", "Jamaica", "Japão", "Jordânia", "Kiribati", "Laus", "Lesoto", "Letónia", "Líbano", "Libéria", "Líbia", "Listenstaine", "Lituânia", "Luxemburgo", "Macedónia do Norte", "Madagáscar", "Malásia", "Maláui", "Maldivas", "Mali", "Malta", "Marrocos", "Maurícia", "Mauritânia", "México", "Mianmar", "Micronésia", "Moçambique", "Moldávia", "Mónaco", "Mongólia", "Montenegro", "Namíbia", "Nauru", "Nepal", "Nicarágua", "Níger", "Nigéria", "Noruega", "Nova Zelândia", "Omã", "Países Baixos", "Palau", "Panamá", "Papua Nova Guiné", "Paquistão", "Paraguai", "Peru", "Polónia", "Portugal", "Quénia", "Quirguistão", "Reino Unido", "República Centro-Africana", "República Checa", "República Dominicana", "Roménia", "Ruanda", "Rússia", "Salvador", "Samoa", "Santa Lúcia", "São Cristóvão e Neves", "São Marinho", "São Tomé e Príncipe", "São Vicente e Granadinas", "Senegal", "Serra Leoa", "Sérvia", "Seicheles", "Singapura", "Síria", "Somália", "Sri Lanca", "Essuatíni", "Sudão", "Sudão do Sul", "Suécia", "Suíça", "Suriname", "Tailândia", "Taiuã", "Tajiquistão", "Tanzânia", "Timor-Leste", "Togo", "Tonga", "Trindade e Tobago", "Tunísia", "Turcomenistão", "Turquia", "Tuvalu", "Ucrânia", "Uganda", "Uruguai", "Usbequistão", "Vanuatu", "Vaticano", "Venezuela", "Vietname", "Zâmbia", "Zimbábue"];

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
    const abortControllerRef = useRef<AbortController | null>(null);

    // --- Filter State ---
    const [nameFilter, setNameFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState('all');
    const [sexoFilter, setSexoFilter] = useState('all');
    const [progressFilter, setProgressFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [provinciaFilter, setProvinciaFilter] = useState('');
    const [paisFilter, setPaisFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    
    // --- State for filter dropdown options ---
    const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
    const [uniqueCompanies, setUniqueCompanies] = useState<string[]>([]);


    const fetchProgress = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        
        setError(null);
        try {
            const { data: nonAdminUsers, error: nonAdminUsersError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('is_admin', false)
                .abortSignal(signal);

            if (nonAdminUsersError) throw nonAdminUsersError;
            if (signal.aborted) return;
            
            const nonAdminUserIds = nonAdminUsers.map(u => u.id);
            
            if (nonAdminUserIds.length === 0) {
                setStudentProgress([]);
                if (!signal.aborted) setLoading(false);
                return;
            }

            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('id, course_id, user_id, enrolled_at')
                .in('user_id', nonAdminUserIds)
                .order('enrolled_at', { ascending: false })
                .abortSignal(signal);

            if (enrollError) throw enrollError;
            if (signal.aborted || !enrollments || enrollments.length === 0) {
                if (!signal.aborted) setStudentProgress([]);
                return;
            }
            
            const userIds = [...new Set(enrollments.map(e => e.user_id))];
            const courseIds = [...new Set(enrollments.map(e => e.course_id))];
            
            const [usersRes, coursesRes, modulesRes, progressRes] = await Promise.all([
                supabase.from('user_profiles').select('*').in('id', userIds).abortSignal(signal),
                supabase.from('courses').select('*').in('id', courseIds).abortSignal(signal),
                supabase.from('modules').select('id, course_id').in('course_id', courseIds).abortSignal(signal),
                supabase.from('user_progress').select('user_id, module_id').in('user_id', userIds).abortSignal(signal)
            ]);

            if (signal.aborted) return;

            if (usersRes.error) throw usersRes.error;
            if (coursesRes.error) throw coursesRes.error;
            if (modulesRes.error) throw modulesRes.error;
            if (progressRes.error) throw progressRes.error;
            
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

            const results = enrollments.map(enr => {
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
            
            if (results && !signal.aborted) {
                setStudentProgress(results as StudentProgressInfo[]);
                const courses = [...new Set(results.map(p => p.course.title).filter(Boolean) as string[])];
                const companies = [...new Set(results.map(p => p.user.company_name).filter(Boolean) as string[])];
                setUniqueCourses(courses.sort());
                setUniqueCompanies(companies.sort());
            }

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Error fetching student progress:", err.message || err);
                setError("Não foi possível carregar o progresso dos alunos.");
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchProgress();

        const channel = supabase.channel('student-progress-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' }, fetchProgress)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, fetchProgress)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, fetchProgress)
          .subscribe();
    
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            supabase.removeChannel(channel);
        };
    }, [fetchProgress]);
    
    const filteredProgress = useMemo(() => {
        return studentProgress.filter(item => {
            if (!item.user || !item.course) return false;
            
            if (nameFilter && !item.user.full_name?.toLowerCase().includes(nameFilter.toLowerCase())) return false;
            if (courseFilter !== 'all' && item.course.title !== courseFilter) return false;
            if (companyFilter !== 'all' && item.user.company_name !== companyFilter) return false;
            if (sexoFilter !== 'all' && item.user.sexo !== sexoFilter) return false;
            if (provinciaFilter && !item.user.provincia?.toLowerCase().includes(provinciaFilter.toLowerCase())) return false;
            if (paisFilter !== 'all' && item.user.pais !== paisFilter) return false;

            const age = item.user.idade;
            if (ageFilter !== 'all') {
                if (!age) return false;
                switch (ageFilter) {
                    case '18-25': if (age < 18 || age > 25) return false; break;
                    case '26-35': if (age < 26 || age > 35) return false; break;
                    case '36-45': if (age < 36 || age > 45) return false; break;
                    case '46+': if (age < 46) return false; break;
                }
            }

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
    }, [studentProgress, nameFilter, courseFilter, companyFilter, sexoFilter, progressFilter, statusFilter, provinciaFilter, paisFilter, ageFilter]);

    const resetFilters = () => {
        setNameFilter('');
        setCourseFilter('all');
        setCompanyFilter('all');
        setSexoFilter('all');
        setProgressFilter('all');
        setStatusFilter('all');
        setProvinciaFilter('');
        setPaisFilter('all');
        setAgeFilter('all');
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
            item.user.provincia || 'N/A',
            item.user.pais || 'N/A',
            item.user.idade || 'N/A',
            `${item.progress}%`,
        ]);
        autoTable(doc, {
            head: [['Aluno', 'Email', 'Empresa', 'Curso', 'Província', 'País', 'Idade', 'Progresso']],
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
            'Idade': item.user.idade || 'N/A',
            'Telefone': item.user.phone_number || 'N/A',
            'Endereço': item.user.endereco || 'N/A',
            'Província': item.user.provincia || 'N/A',
            'País': item.user.pais || 'N/A',
            'Atividade Comercial': item.user.atividade_comercial || 'N/A',
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                        <label htmlFor="name-filter" className="block text-xs font-medium text-gray-500 mb-1">Aluno</label>
                        <input id="name-filter" type="text" placeholder="Pesquisar nome..." value={nameFilter} onChange={e => setNameFilter(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz"/>
                    </div>
                    <div>
                        <label htmlFor="company-filter" className="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
                        <select id="company-filter" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todas</option>
                            {uniqueCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="course-filter" className="block text-xs font-medium text-gray-500 mb-1">Curso</label>
                        <select id="course-filter" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todos</option>
                            {uniqueCourses.map(course => <option key={course} value={course}>{course}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="provincia-filter" className="block text-xs font-medium text-gray-500 mb-1">Província</label>
                        <input id="provincia-filter" type="text" placeholder="Pesquisar província..." value={provinciaFilter} onChange={e => setProvinciaFilter(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz"/>
                    </div>
                     <div>
                        <label htmlFor="pais-filter" className="block text-xs font-medium text-gray-500 mb-1">País</label>
                        <select id="pais-filter" value={paisFilter} onChange={e => setPaisFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todos</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
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
                        <label htmlFor="age-filter" className="block text-xs font-medium text-gray-500 mb-1">Faixa Etária</label>
                        <select id="age-filter" value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moz">
                            <option value="all">Todas</option>
                            <option value="18-25">18-25 anos</option>
                            <option value="26-35">26-35 anos</option>
                            <option value="36-45">36-45 anos</option>
                            <option value="46+">46+ anos</option>
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
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full text-sm font-semibold text-gray-600 hover:text-brand-up transition-colors duration-200 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md">
                            Limpar Filtros
                        </button>
                    </div>
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
                        <div className="my-6 space-y-3 text-gray-700 text-sm">
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Nome:</strong> {selectedStudent.full_name}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Email:</strong> {selectedStudent.email || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Empresa:</strong> {selectedStudent.company_name || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Telefone:</strong> {selectedStudent.phone_number || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Sexo:</strong> {selectedStudent.sexo ? (selectedStudent.sexo.charAt(0).toUpperCase() + selectedStudent.sexo.slice(1)) : 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Idade:</strong> {selectedStudent.idade || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Endereço:</strong> {selectedStudent.endereco || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">Província:</strong> {selectedStudent.provincia || 'Não informado'}</div>
                            <div><strong className="font-semibold text-gray-500 w-32 inline-block">País:</strong> {selectedStudent.pais || 'Não informado'}</div>
                             <div><strong className="font-semibold text-gray-500 w-32 inline-block">Ativ. Comercial:</strong> {selectedStudent.atividade_comercial || 'Não informado'}</div>
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