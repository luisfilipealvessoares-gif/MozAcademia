
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, Course } from '../types';

interface StudentProgressInfo {
  enrollmentId: string;
  user: UserProfile;
  course: Course;
  progress: number;
}

const AdminStudentProgress: React.FC = () => {
    const [studentProgress, setStudentProgress] = useState<StudentProgressInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
    const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            const { data: enrollments, error } = await supabase
                .from('enrollments')
                .select('id, course_id, user_id, user_profiles(*), courses(*)')
                .order('created_at', { ascending: false })
                .limit(50); // Fetch more for a comprehensive view

            if (error || !enrollments) {
                setLoading(false);
                return;
            }
            
            const progressPromises = enrollments.map(async (enr) => {
                if (!enr.user_profiles || !enr.courses) return null;
                const { count: total } = await supabase.from('modules').select('id', { count: 'exact', head: true }).eq('course_id', enr.course_id);
                
                // Fetch completed modules for this enrollment
                const { data: moduleIds } = await supabase.from('modules').select('id').eq('course_id', enr.course_id);
                if (!moduleIds || moduleIds.length === 0) {
                     return {
                        enrollmentId: enr.id,
                        user: enr.user_profiles as UserProfile,
                        course: enr.courses as Course,
                        progress: 0
                    };
                }

                const { count: completedCount } = await supabase.from('user_progress')
                    .select('module_id', { count: 'exact', head: true })
                    .eq('user_id', enr.user_id)
                    .in('module_id', moduleIds.map(m => m.id));

                const progress = (total && completedCount) ? (completedCount / total) * 100 : 0;

                return {
                    enrollmentId: enr.id,
                    user: enr.user_profiles as UserProfile,
                    course: enr.courses as Course,
                    progress: Math.round(progress)
                };
            });
            
            const results = (await Promise.all(progressPromises)).filter(Boolean);
            setStudentProgress(results as StudentProgressInfo[]);
            setLoading(false);
        };
        fetchProgress();
    }, []);
    
    const handleShowStudentDetails = (student: UserProfile) => {
        setSelectedStudent(student);
        setShowStudentDetailModal(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Progresso dos Alunos</h1>
                <p className="text-gray-600 mt-1">Acompanhe o andamento dos alunos nos cursos.</p>
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
                        ) : studentProgress.length > 0 ? (
                            studentProgress.map(item => (
                                <tr key={item.enrollmentId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleShowStudentDetails(item.user)} className="font-medium text-brand-up hover:underline">{item.user.full_name}</button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.user.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.course.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                                <div className="bg-brand-moz h-2.5 rounded-full" style={{width: `${item.progress}%`}}></div>
                                            </div>
                                            <span className="text-sm text-gray-600 font-semibold">{item.progress}%</span>
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
                           <p><strong>Nome:</strong> {selectedStudent.full_name}</p>
                           <p><strong>Empresa:</strong> {selectedStudent.company_name}</p>
                           <p><strong>Telefone:</strong> {selectedStudent.phone_number}</p>
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
