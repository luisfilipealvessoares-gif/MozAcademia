
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Course, Enrollment } from '../types';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else if (coursesData) {
        setCourses(coursesData);
      }

      // Fetch user enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      
      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      } else if (enrollmentsData) {
        setEnrolledCourses(enrollmentsData.map(e => e.course_id));
      }
      
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
    });

    if (error) {
      alert('Erro ao se inscrever no curso.');
      console.error(error);
    } else {
      alert('Inscrição realizada com sucesso!');
      setEnrolledCourses([...enrolledCourses, courseId]);
    }
  };

  const userEnrolledCourses = courses.filter(c => enrolledCourses.includes(c.id));
  const availableCourses = courses.filter(c => !enrolledCourses.includes(c.id));


  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  return (
    <div className="space-y-12">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Meus Cursos</h2>
            {userEnrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userEnrolledCourses.map((course) => (
                        <Link key={course.id} to={`/course/${course.id}`}>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                                    <p className="text-gray-600 mb-4 h-24 overflow-hidden">{course.description}</p>
                                    <div className="text-center py-2 px-4 bg-orange-500 text-white rounded-md font-semibold">
                                        Continuar Curso
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Você ainda não se inscreveu em nenhum curso.</p>
            )}
        </div>
      
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Cursos Disponíveis</h2>
            {availableCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableCourses.map((course) => (
                    <CourseCard 
                        key={course.id} 
                        course={course}
                        onEnroll={handleEnroll}
                        isEnrolled={false}
                    />
                ))}
                </div>
            ) : (
                <p className="text-gray-500">Parabéns! Você se inscreveu em todos os cursos disponíveis.</p>
            )}
        </div>
    </div>
  );
};

export default HomePage;
