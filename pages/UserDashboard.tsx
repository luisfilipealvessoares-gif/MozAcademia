
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Course } from '../types';

interface EnrolledCourse extends Course {
    module_count: number;
    completed_modules_count: number;
}

const UserDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!user) return;
            setLoading(true);
            
            const { data: enrollments, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('user_id', user.id);

            if (enrollmentsError) {
                console.error("Error fetching enrollments:", enrollmentsError);
                setLoading(false);
                return;
            }

            if (!enrollments || enrollments.length === 0) {
                setEnrolledCourses([]);
                setLoading(false);
                return;
            }
            
            const courseIds = enrollments.map(e => e.course_id);

            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .in('id', courseIds);

            if (coursesError) {
                console.error("Error fetching courses:", coursesError);
                setLoading(false);
                return;
            }

            const coursePromises = coursesData.map(async (course) => {
                const { count: module_count } = await supabase
                    .from('modules')
                    .select('*', { count: 'exact', head: true })
                    .eq('course_id', course.id);

                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('module_id')
                    .eq('user_id', user.id)
                    .in('module_id', (await supabase.from('modules').select('id').eq('course_id', course.id)).data?.map(m => m.id) || []);
                
                return {
                    ...course,
                    module_count: module_count || 0,
                    completed_modules_count: progressData?.length || 0,
                };
            });
            
            const finalCourses = await Promise.all(coursePromises);
            setEnrolledCourses(finalCourses as EnrolledCourse[]);
            setLoading(false);
        };

        fetchEnrolledCourses();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900">Meu Painel</h1>
                <p className="text-xl text-gray-600 mt-2">Bem-vindo(a) de volta, <span className="font-semibold text-brand-moz">{profile?.full_name || user?.email}</span>!</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">Meus Cursos</h2>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrolledCourses.map(course => {
                            const progress = course.module_count > 0 ? (course.completed_modules_count / course.module_count) * 100 : 0;
                            return (
                            <div key={course.id} className="bg-white border rounded-xl p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800 mb-2">{course.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 h-16 overflow-hidden">{course.description}</p>
                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-brand-moz h-2 rounded-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{course.completed_modules_count} de {course.module_count} módulos completos</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/course/${course.id}`}
                                    className="mt-6 block w-full text-center bg-brand-moz text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-up transition-all shadow-md hover:shadow-lg"
                                >
                                    {progress > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                                </Link>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-brand-light/50">
                         <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum curso inscrito</h3>
                        <p className="mt-1 text-sm text-gray-500">Você ainda não se inscreveu em nenhum curso.</p>
                        <div className="mt-6">
                            <Link to="/#cursos" className="inline-flex items-center rounded-md bg-brand-moz px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-up">
                                Explorar Cursos
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;