import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import CompleteProfileModal from '../components/CompleteProfileModal';
import { useI18n } from '../contexts/I18nContext';

interface EnrolledCourse extends Course {
    modules: {
        id: string;
        title: string;
        order: number;
        completed: boolean;
    }[];
    module_count: number;
    completed_modules_count: number;
}

const UserDashboard: React.FC = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { t, language } = useI18n();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const userId = user?.id;
    const abortControllerRef = useRef<AbortController | null>(null);

    const isProfileComplete = !!(
        profile &&
        profile.company_name &&
        profile.phone_number &&
        profile.sexo &&
        profile.endereco &&
        profile.provincia &&
        profile.pais &&
        profile.atividade_comercial &&
        profile.idade
    );
    
    const fetchEnrolledCourses = useCallback(async () => {
        if (!userId) return;

        setLoadingCourses(true);
        try {
            const { data: enrollments, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('user_id', userId);

            if (enrollmentsError) {
                throw enrollmentsError;
            }

            if (!enrollments || enrollments.length === 0) {
                setEnrolledCourses([]);
                return;
            }
            
            const courseIds = enrollments.map(e => e.course_id);
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .in('id', courseIds);

            if (coursesError) {
                throw coursesError;
            }
            if (!coursesData) return;

            const coursePromises = coursesData.map(async (course) => {
                // Fetch modules for this course
                const { data: modulesData, error: modulesError } = await supabase
                    .from('modules')
                    .select('id, title, order')
                    .eq('course_id', course.id)
                    .order('order', { ascending: true });

                if (modulesError) {
                    throw modulesError;
                }

                const modulesList = modulesData || [];
                const moduleIds = modulesList.map(m => m.id);
                
                // Fetch user progress for these modules
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('module_id')
                    .eq('user_id', userId)
                    .in('module_id', moduleIds);
                
                const completedModuleIds = new Set(progressData?.map(p => p.module_id) || []);

                const modulesWithStatus = modulesList.map(m => ({
                    ...m,
                    completed: completedModuleIds.has(m.id)
                }));

                return {
                    ...course,
                    modules: modulesWithStatus,
                    module_count: modulesList.length,
                    completed_modules_count: completedModuleIds.size,
                };
            });
            
            const results = await Promise.all(coursePromises);
            const finalCourses = results.filter(Boolean) as EnrolledCourse[];
            setEnrolledCourses(finalCourses);
        } catch (error: any) {
            console.error("Error fetching enrolled courses:", error.message || error);
        } finally {
            setLoadingCourses(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!authLoading && isProfileComplete) {
            fetchEnrolledCourses();
        } else if (!isProfileComplete) {
            setLoadingCourses(false);
        }
    }, [isProfileComplete, authLoading, fetchEnrolledCourses]);

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
            </div>
        );
    }
    
    if (!isProfileComplete) {
        return <CompleteProfileModal />;
    }
    
    if (loadingCourses) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('user.dashboard.title')}</h1>
                <p className="text-base text-gray-600 mt-1">
                    {t('user.dashboard.welcome', { name: profile?.full_name || user?.email })}
                    {!profile?.full_name && (
                        <span className="text-xs ml-2 font-normal">
                            (<Link to="/profile" className="text-brand-up hover:underline">{t('user.dashboard.completeProfilePrompt')}</Link>)
                        </span>
                    )}
                </p>
            </div>

            <div className="bg-brand-light p-5 rounded-xl shadow-lg border border-brand-moz/20">
                <h2 className="text-lg font-bold mb-4 text-gray-800">{t('user.dashboard.myCourses')}</h2>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {enrolledCourses.map(course => {
                            const progress = course.module_count > 0 ? (course.completed_modules_count / course.module_count) * 100 : 0;
                            
                            let courseTitle = course.title;
                            let courseDescription = course.description;
                            if (language === 'en' && course.title === 'Introdução ao Petróleo, Gás Natural e Gás Natural Liquefeito') {
                                courseTitle = 'Introduction to Petroleum, Natural Gas, and Liquefied Natural Gas';
                                courseDescription = 'A comprehensive introduction to the oil and gas industry, covering key concepts and processes related to petroleum, natural gas, and LNG production and distribution.';
                            }
                            
                            let hasStarted = progress > 0;
                            if (!hasStarted && course.modules.length > 0 && userId) {
                                const firstModuleId = course.modules[0].id;
                                const savedProgress = localStorage.getItem(`video_progress_${userId}_${firstModuleId}`);
                                if (savedProgress) {
                                    const time = parseFloat(savedProgress);
                                    if (!isNaN(time) && time > 5) { // Consider started if watched more than 5 seconds
                                        hasStarted = true;
                                    }
                                }
                            }
                            
                            return (
                            <div key={course.id} className="bg-white border rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                                <div>
                                    <h3 className="font-bold text-base text-gray-800 mb-2">{courseTitle}</h3>
                                    <p className="text-gray-500 text-xs mb-4 h-12 overflow-hidden">{courseDescription}</p>
                                    <div className="space-y-1.5">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className="bg-brand-moz h-1.5 rounded-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{t('user.dashboard.course.modulesCompleted', { completed: course.completed_modules_count, total: course.module_count })}</p>
                                    </div>

                                    {/* Module List */}
                                    <div className="mt-4 space-y-3">
                                        {course.modules.map((module, index) => {
                                            const isNextToWatch = !module.completed && (index === 0 || course.modules[index - 1].completed);
                                            let partialProgress = 0;
                                            if (isNextToWatch && userId) {
                                                const savedProgress = localStorage.getItem(`video_progress_${userId}_${module.id}`);
                                                const savedDuration = localStorage.getItem(`video_duration_${userId}_${module.id}`);
                                                if (savedProgress && savedDuration) {
                                                    const current = parseFloat(savedProgress);
                                                    const total = parseFloat(savedDuration);
                                                    if (!isNaN(current) && !isNaN(total) && total > 0) {
                                                        partialProgress = Math.min(100, Math.max(0, (current / total) * 100));
                                                    }
                                                }
                                            }

                                            return (
                                            <div key={module.id} className="flex flex-col gap-1">
                                                <div className="flex items-center text-xs text-gray-600">
                                                    {module.completed ? (
                                                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <div className={`w-4 h-4 border-2 rounded-full mr-2 flex-shrink-0 ${isNextToWatch ? 'border-brand-moz' : 'border-gray-300'}`}></div>
                                                    )}
                                                    <span className={`${module.completed ? "line-through opacity-75" : ""} ${isNextToWatch ? "font-semibold text-brand-up" : ""} truncate`}>
                                                        {language === 'en' && module.title.includes('Módulo 1') ? 'Module 1: Introduction...' : 
                                                         language === 'en' && module.title.includes('Módulo 2') ? 'Module 2: LNG...' : 
                                                         language === 'en' && module.title.includes('Módulo 3') ? 'Module 3: Industry in Moz...' : 
                                                         module.title}
                                                    </span>
                                                </div>
                                                {partialProgress > 0 && (
                                                    <div className="ml-6 w-24 bg-gray-200 rounded-full h-1">
                                                        <div className="bg-brand-moz h-1 rounded-full" style={{width: `${partialProgress}%`}}></div>
                                                    </div>
                                                )}
                                            </div>
                                        )})}
                                    </div>
                                </div>
                                <Link
                                    to={`/course/${course.id}`}
                                    className="mt-4 block w-full text-center bg-brand-moz text-white py-2 px-4 rounded-lg font-semibold hover:bg-brand-up transition-all shadow-sm hover:shadow-md text-sm"
                                >
                                    {hasStarted ? t('user.dashboard.course.continue') : t('user.dashboard.course.start')}
                                </Link>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-brand-up/30 rounded-xl bg-white">
                         <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('user.dashboard.noCourses.title')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('user.dashboard.noCourses.subtitle')}</p>
                        <div className="mt-6">
                            <Link to="/#cursos" className="inline-flex items-center rounded-md bg-brand-moz px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-up">
                                {t('user.dashboard.noCourses.button')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;