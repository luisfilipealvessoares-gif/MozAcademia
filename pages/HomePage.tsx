
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);


const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else if (coursesData) {
        setCourses(coursesData);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setEnrolledCourses([]);
        return;
      }
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      
      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      } else if (enrollmentsData) {
        setEnrolledCourses(enrollmentsData.map(e => e.course_id));
      }
    };
    
    fetchEnrollments();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
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

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  return (
    <div className="space-y-24">
        {/* Hero Section */}
        <div className="text-center py-16 px-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-4 animate-fade-in-down">
                Capacitação Profissional para <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500">o Futuro</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 mb-8">
                Nossa missão é fornecer conhecimento acessível e de alta qualidade sobre setores vitais da economia, impulsionando sua carreira para o próximo nível.
            </p>
            <a href="/#cursos" className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                Explorar Cursos
            </a>
        </div>


        {/* News Section */}
        <div id="noticias">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8 text-center">Notícias e Atualizações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-t-4 border-orange-400">
                    <h3 className="font-semibold text-xl mb-2">Lançamento da Plataforma</h3>
                    <p className="text-gray-600">É com grande entusiasmo que lançamos a MozupAcademy! Nosso primeiro curso sobre Petróleo e Gás já está disponível para inscrição. Fique atento para mais novidades e cursos em breve.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-t-4 border-orange-400">
                    <h3 className="font-semibold text-xl mb-2">Perspectivas para 2024</h3>
                    <p className="text-gray-600">Analistas preveem um ano de transformações no setor de energia. Nosso curso introdutório oferece a base perfeita para entender as tendências e oportunidades que estão por vir.</p>
                </div>
            </div>
        </div>
      
        {/* Courses Section */}
        <div id="cursos">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8 text-center">Nossos Cursos</h2>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => {
                    const isEnrolled = enrolledCourses.includes(course.id);
                    return (
                        <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-b-4 border-orange-500">
                            <div className="p-6 relative">
                                <div className="absolute -top-5 right-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-full shadow-lg">
                                    <BookOpenIcon />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">{course.title}</h3>
                                <p className="text-gray-600 mb-4 h-24 overflow-hidden">{course.description}</p>
                            </div>
                            <div className="p-6 bg-gray-50 mt-auto">
                                {isEnrolled ? (
                                    <Link to={`/course/${course.id}`} className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                                        Continuar Curso
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => handleEnroll(course.id)}
                                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                                    >
                                        Inscrever-se
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                </div>
            ) : (
                <p className="text-gray-500 text-center">Nenhum curso disponível no momento.</p>
            )}
        </div>
    </div>
  );
};

export default HomePage;