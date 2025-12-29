
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { Link } from 'react-router-dom';

type EditableCourse = Pick<Course, 'id' | 'title' | 'description'>;

// --- Icon Components for better UI ---
const BookOpenSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625" />
    </svg>
);
const ListBulletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-1.755zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);


const AdminCoursesListPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<EditableCourse | null>(null);
    const [showCourseEditModal, setShowCourseEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
        
        setIsSaving(true);
        const { error } = await supabase.from('courses').update({ title: editingCourse.title, description: editingCourse.description }).eq('id', editingCourse.id);
        setIsSaving(false);

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
            </div>
            
            <div className="space-y-4">
                {loading ? (
                     <div className="text-center p-6 text-gray-500">Carregando...</div>
                ) : courses.length > 0 ? courses.map(course => (
                     <div key={course.id} className="bg-white shadow-md rounded-xl border overflow-hidden flex transition-all duration-300 hover:shadow-xl hover:border-brand-moz">
                        <div className="flex-shrink-0 w-20 bg-brand-light flex items-center justify-center">
                            <BookOpenSquareIcon className="w-10 h-10 text-brand-up" />
                        </div>
                        <div className="flex-grow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-gray-800">{course.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                                <button onClick={() => handleOpenCourseEditModal(course)} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-200 font-semibold transition-transform duration-200 hover:scale-105">
                                    <PencilIcon className="w-4 h-4"/>
                                    <span>Editar</span>
                                </button>
                                <Link to={`/admin/courses/${course.id}`} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-brand-moz text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-up transition-transform duration-200 hover:scale-105">
                                    <ListBulletIcon className="w-4 h-4"/>
                                    <span>Módulos</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center p-10 border-2 border-dashed rounded-lg bg-white">
                        <h3 className="text-lg font-semibold text-gray-800">Nenhum curso encontrado</h3>
                        <p className="text-gray-500 mt-1">Adicione o primeiro curso para começar a gerenciar.</p>
                    </div>
                )}
            </div>

            {showCourseEditModal && editingCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-bold mb-6">Editar Curso</h2>
                        <form onSubmit={handleUpdateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <input type="text" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" required disabled={isSaving}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} rows={4} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" required disabled={isSaving}></textarea>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowCourseEditModal(false)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200" disabled={isSaving}>Cancelar</button>
                                <button type="submit" className="bg-brand-moz text-white px-4 py-2 rounded-md hover:bg-brand-up disabled:opacity-50 transition-colors duration-200" disabled={isSaving}>
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoursesListPage;
