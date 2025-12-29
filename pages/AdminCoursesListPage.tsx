
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { Link } from 'react-router-dom';

type EditableCourse = Pick<Course, 'id' | 'title' | 'description'>;

const AdminCoursesListPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<EditableCourse | null>(null);
    const [showCourseEditModal, setShowCourseEditModal] = useState(false);

    const fetchCourses = async () => {
        setLoading(true);
        const { data } = await supabase.from('courses').select('*').order('created_at');
        setCourses(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleOpenCourseEditModal = (course: Course) => {
        setEditingCourse({ id: course.id, title: course.title, description: course.description });
        setShowCourseEditModal(true);
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourse) return;
        const { error } = await supabase.from('courses').update({ title: editingCourse.title, description: editingCourse.description }).eq('id', editingCourse.id);
        if (!error) {
            setShowCourseEditModal(false);
            setEditingCourse(null);
            fetchCourses();
        } else {
            alert("Erro ao atualizar o curso.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciamento de Cursos</h1>
                    <p className="text-gray-600 mt-1">Edite os detalhes dos cursos e gerencie seus módulos.</p>
                </div>
                {/* Future "Add Course" button can go here */}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                             <tr><td colSpan={3} className="text-center p-6 text-gray-500">Carregando...</td></tr>
                        ) : courses.map(course => (
                            <tr key={course.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{course.title}</td>
                                <td className="px-6 py-4 max-w-md">
                                    <p className="text-sm text-gray-600 truncate">{course.description}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <button onClick={() => handleOpenCourseEditModal(course)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm hover:bg-blue-200 font-semibold">Editar</button>
                                    <Link to={`/admin/courses/${course.id}`} className="bg-brand-moz text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-up">Módulos</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCourseEditModal && editingCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-bold mb-6">Editar Curso</h2>
                        <form onSubmit={handleUpdateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <input type="text" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} rows={4} className="mt-1 w-full p-2 border rounded-md" required></textarea>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowCourseEditModal(false)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                                <button type="submit" className="bg-brand-moz text-white px-4 py-2 rounded-md hover:bg-brand-up">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoursesListPage;
