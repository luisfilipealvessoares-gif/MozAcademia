import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Course } from '../types';

interface EnrolledCourse extends Course {}

const UserDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!user) return;
            setLoading(true);
            
            // OPTIMIZATION: Fetch enrollments and the related course data in a single query.
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    courses (
                        id,
                        title,
                        description,
                        created_at
                    )
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error("Error fetching enrolled courses:", error);
                setEnrolledCourses([]);
            } else if (data) {
                // The result is an array of objects like { courses: { id: '...', title: '...' } }
                // We filter out any potential nulls and map to get the course object directly.
                const courses = data
                    .map(item => item.courses)
                    .filter((course): course is EnrolledCourse => course !== null);
                setEnrolledCourses(courses);
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
                        <Link to="/#cursos" className="mt-4 inline-block bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition">
                            Explorar Cursos
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
