
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, Course } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface StudentProgressInfo {
  enrollmentId: string;
  user: Partial<UserProfile>;
  course: Partial<Course>;
  progress: number;
}

const AdminStudentProgress: React.FC = () => {
    const [studentProgress, setStudentProgress] = useState<StudentProgressInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Partial<UserProfile> | null>(null);
    const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            setError(null);
            try {
                // Step 1: Fetch all enrollments
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('id, course_id, user_id')
                    .order('enrolled_at', { ascending: false });

                if (enrollError) throw enrollError;
                if (!enrollments || enrollments.length === 0) {
                    setStudentProgress([]);
                    setLoading(false);
                    return;
                }
                
                // Step 2: Get unique IDs for batch fetching
                const userIds = [...new Set(enrollments.map(e => e.user_id))];
                const courseIds = [...new Set(enrollments.map(e => e.course_id))];
                
                // Step 3: Batch fetch related data
                const [usersRes, coursesRes] = await Promise.all([
                    supabase.from('user_profiles').select('*').in('id', userIds),
                    supabase.from('courses').select('*').in('id', courseIds)
                ]);

                if (usersRes.error) throw usersRes.error;
                if (coursesRes.error) throw coursesRes.error;

                const usersMap = new Map(usersRes.data.map(u => [u.id, u]));
                const coursesMap = new Map(coursesRes.data.map(c => [c.id, c]));

                // Step 4: Calculate progress for each enrollment
                const progressPromises = enrollments.map(async (enr) => {
                    const user = usersMap.get(enr.user_id) || { id: enr.user_id, full_name: '[Usuário Removido]' };
                    const course = coursesMap.get(enr.course_id) || { id: enr.course_id, title: '[Curso Removido]' };

                    const { count: total } = await supabase.from('modules').select('id', { count: 'exact', head: true }).eq('course_id', enr.course_id);
                    if (total === 0) return { enrollmentId: enr.id, user, course, progress: 0 };

                    const { data: moduleIdsData } = await supabase.from('modules').select('id').eq('course_id', enr.course_id);
                    const moduleIds = moduleIdsData?.map(m => m.id) || [];
                    
                    const { count: completedCount } = moduleIds.length > 0 
                        ? await supabase.from('user_progress').select('module_id', { count: 'exact', head: true }).eq('user_id', enr.user_id).in('module_id', moduleIds)
                        : { count: 0 };

                    const progress = (total && completedCount) ? (completedCount / total) * 100 : 0;
                    return { enrollmentId: enr.id, user, course, progress: Math.round(progress) };
                });
                
                const results = await Promise.all(progressPromises);
                setStudentProgress(results as StudentProgressInfo[]);
            } catch (err: any) {
                console.error("Error fetching student progress:", err);
                setError("Não foi possível carregar o progresso dos alunos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);
    
    const handleShowStudentDetails = (student: Partial<UserProfile>) => {
        setSelectedStudent(student);
        setShowStudentDetailModal(true);
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableData = studentProgress.map(item => [
            item.user.full_name || 'N/A',
            item.user.company_name || 'N/A',
            item.course.title || 'N/A',
            `${item.progress}%`,
        ]);
        autoTable(doc, {
            head: [['Aluno', 'Empresa', 'Curso', 'Progresso']],
            body: tableData,
        });
        doc.save('progresso_alunos.pdf');
    };

    const exportToExcel = () => {
        const dataToExport = studentProgress.map(item => ({
            'Aluno': item.user.full_name || 'N/A',
            'Empresa': item.user.company_name || 'N/A',
            'Curso': item.course.title || 'N/A',
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
                    <button onClick={exportToPDF} className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border shadow-sm">Exportar PDF</button>
                    <button onClick={exportToExcel} className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border shadow-sm">Exportar Excel</button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-6 text-gray-500">Carregando...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="text-center p-6 text-red-500">{error}</td></tr>
                        ) : studentProgress.length > 0 ? (
                            studentProgress.map(item => (
                                <tr key={item.enrollmentId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleShowStudentDetails(item.user)} className="font-medium text-brand-up hover:underline" disabled={item.user.full_name === '[Usuário Removido]'}>
                                            {item.user.full_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.user.company_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.course.title}</td>
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
                             <tr><td colSpan={4} className="text-center p-10 text-gray-500">Nenhum aluno inscrito ainda.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showStudentDetailModal && selectedStudent && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
                        <h2 className="text-2xl font-bold mb-6">Detalhes do Aluno</h2>
                        <div className="space-y-3 text-gray-700">
                           <p><strong>Nome:</strong> {selectedStudent.full_name || 'N/A'}</p>
                           <p><strong>Empresa:</strong> {selectedStudent.company_name || 'N/A'}</p>
                           <p><strong>Telefone:</strong> {selectedStudent.phone_number || 'N/A'}</p>
                        </div>
                        <div className="text-right mt-8">
                            <button onClick={() => setShowStudentDetailModal(false)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Fechar</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default AdminStudentProgress;