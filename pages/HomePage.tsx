


import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);
const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.25a6.01 6.01 0 00-1.5-11.25m0 11.25A6.01 6.01 0 0110.5 6m1.5 6.75A6.01 6.01 0 0013.5 6m0 12v-5.25m0 0a6.01 6.01 0 001.5-11.25a6.01 6.01 0 00-1.5-11.25" />
    </svg>
);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const HomePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle scrolling to anchor links
    if (!loading && location.hash === '#cursos') {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location, loading]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError.message);
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
        console.error('Error fetching enrollments:', enrollmentsError.message);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const getCourseImage = (courseTitle: string) => {
    if (courseTitle === 'Introdução ao Petróleo, Gás Natural e Gás Natural Liquefeito') {
        return 'https://i.postimg.cc/dQrTLGxs/retrato-de-engenheiros-durante-as-horas-de-trabalho-no-local-de-trabalho-(1).jpg';
    }
    // Default image for other courses
    return 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=870&q=80';
  };

  if (loading && courses.length === 0) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
        </div>
    );
  }

  return (
    <div className="space-y-24 md:space-y-32">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 px-4 bg-gray-800 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" alt="Profissionais em reunião" className="absolute inset-0 w-full h-full object-cover"/>
            <div className="relative z-20">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
                    {t('home.hero.title')} <span className="text-brand-moz">{t('home.hero.title.highlight')}</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mb-8 drop-shadow-md">
                    {t('home.hero.subtitle')}
                </p>
                <Link to="/#cursos" className="inline-block bg-brand-moz text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-brand-up transition-all duration-300 shadow-xl hover:shadow-2xl">
                    {t('home.hero.button')}
                </Link>
            </div>
        </section>
        
        {/* Courses Section */}
        <section id="cursos">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12 text-center">{t('home.courses.title')}</h2>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => {
                        const isEnrolled = enrolledCourses.includes(course.id);
                        
                        let courseTitle = course.title;
                        let courseDescription = course.description;
                        if (language === 'en' && course.title === 'Introdução ao Petróleo, Gás Natural e Gás Natural Liquefeito') {
                            courseTitle = 'Introduction to Petroleum, Natural Gas, and Liquefied Natural Gas';
                            courseDescription = 'A comprehensive introduction to the oil and gas industry, covering key concepts and processes related to petroleum, natural gas, and LNG production and distribution.';
                        }

                        return (
                            <div key={course.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group">
                                {/* Image Container with Branding Tag */}
                                <div className="relative">
                                    <img 
                                        src={getCourseImage(course.title)} 
                                        alt={courseTitle} 
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {course.title === 'Introdução ao Petróleo, Gás Natural e Gás Natural Liquefeito' && (
                                        <div className="absolute top-0 left-0 bg-brand-up text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-br-lg shadow-md">
                                            {t('home.courses.new')}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Content Container that grows to fill space */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{courseTitle}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{courseDescription}</p>
                                    
                                    {/* Button container, pushed to the bottom */}
                                    <div className="mt-auto pt-4">
                                        {isAdmin ? (
                                            <Link to={`/admin/courses/${course.id}`} className="block w-full text-center bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg">
                                                {t('home.courses.manage')}
                                            </Link>
                                        ) : isEnrolled ? (
                                            <Link to={`/course/${course.id}`} className="block w-full text-center bg-brand-moz text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-up transition-all duration-300 shadow-md hover:shadow-lg">
                                                {t('home.courses.continue')}
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(course.id)}
                                                className="w-full bg-brand-moz text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-up transition-all duration-300 shadow-md hover:shadow-lg"
                                            >
                                                {t('home.courses.enroll')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500 text-center">{t('home.courses.noCourses')}</p>
            )}
        </section>

        {/* Why Us Section */}
        <section id="porque-nos" className="bg-brand-light py-20 px-8 rounded-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12 text-center">{t('home.whyUs.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <div className="inline-block bg-brand-moz/10 text-brand-moz p-4 rounded-full mb-4">
                        <BookOpenIcon className="h-8 w-8"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.card1.title')}</h3>
                    <p className="text-gray-600">{t('home.whyUs.card1.text')}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <div className="inline-block bg-brand-moz/10 text-brand-moz p-4 rounded-full mb-4">
                        <LightBulbIcon className="h-8 w-8"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.card2.title')}</h3>
                    <p className="text-gray-600">{t('home.whyUs.card2.text')}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <div className="inline-block bg-brand-moz/10 text-brand-moz p-4 rounded-full mb-4">
                        <ChartBarIcon className="h-8 w-8"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.card3.title')}</h3>
                    <p className="text-gray-600">{t('home.whyUs.card3.text')}</p>
                </div>
            </div>
        </section>
    </div>
  );
};

export default HomePage;