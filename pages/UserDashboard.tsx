
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Course } from '../types';

const UserDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
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

            if (enrollments && enrollments.length > 0) {
                const courseIds = enrollments.map(e => e.course_id);
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .in('id', courseIds);

                if (coursesError) {
                    console.error("Error fetching courses:", coursesError);
                } else {
                    setEnrolledCourses(coursesData || []);
                }
            } else {
                setEnrolledCourses([]);
            }

            setLoading(false);
        };

        fetchEnrolledCourses();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Meu Painel</h1>
                <p className="text-gray-600 mt-1">Bem-vindo de volta, {profile?.full_name || user?.email}!</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Meus Cursos</h2>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map(course => (
                            <div key={course.id} className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
                                <div>
                                    <h3 className="font-bold text-lg">{course.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1 h-20 overflow-hidden">{course.description}</p>
                                </div>
                                <Link
                                    to={`/course/${course.id}`}
                                    className="mt-4 block w-full text-center bg-orange-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition"
                                >
                                    Continuar Curso
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">Você ainda não se inscreveu em nenhum curso.</p>
                        <Link to="/#cursos" className="mt-4 inline-block bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition">
                            Explorar Cursos
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
