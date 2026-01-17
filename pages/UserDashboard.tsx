
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import CompleteProfileModal from '../components/CompleteProfileModal';
import { useI18n } from '../contexts/I18nContext';

interface EnrolledCourse extends Course {
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

    const isProfileComplete = !!(profile && profile.company_name && profile.phone_number && profile.sexo);
    
    const fetchEnrolledCourses = useCallback(async () => {
        if (!userId) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoadingCourses(true);
        try {
            const { data: enrollments, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('user_id', userId)
                .abortSignal(signal);

            if (enrollmentsError) {
                if (signal.aborted) return;
                throw enrollmentsError;
            }
            if (signal.aborted) return;

            if (!enrollments || enrollments.length === 0) {
                setEnrolledCourses([]);
                return;
            }
            
            const courseIds = enrollments.map(e => e.course_id);
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .in('id', courseIds)
                .abortSignal(signal);

            if (coursesError) {
                if (signal.aborted) return;
                throw coursesError;
            }
            if (signal.aborted || !coursesData) return;

            const coursePromises = coursesData.map(async (course) => {
                const { count: module_count } = await supabase
                    .from('modules')
                    .select('*', { count: 'exact', head: true })
                    .eq('course_id', course.id)
                    .abortSignal(signal);

                const { data: moduleIdsForCourse, error: miError } = await supabase.from('modules').select('id').eq('course_id', course.id).abortSignal(signal);
                if (miError) {
                    if (signal.aborted) return null;
                    throw miError;
                }
                const moduleIds = moduleIdsForCourse?.map(m => m.id) || [];
                
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('module_id', { count: 'exact' })
                    .eq('user_id', userId)
                    .in('module_id', moduleIds)
                    .abortSignal(signal);
                
                if (signal.aborted) return null;

                return {
                    ...course,
                    module_count: module_count || 0,
                    completed_modules_count: progressData?.length || 0,
                };
            });
            
            const results = await Promise.all(coursePromises);
            const finalCourses = results.filter(Boolean) as EnrolledCourse[];
            if (!signal.aborted) {
                setEnrolledCourses(finalCourses);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError' && !signal.aborted) {
                console.error("Error fetching enrolled courses:", error.message || error);
            }
        } finally {
            if (!signal.aborted) {
                setLoadingCourses(false);
            }
        }
    }, [userId]);

    useEffect(() => {
        if (!authLoading && isProfileComplete) {
            fetchEnrolledCourses();
        } else if (!isProfileComplete) {
            setLoadingCourses(false);
        }
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
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
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900">{t('user.dashboard.title')}</h1>
                <p className="text-xl text-gray-600 mt-2">{t('user.dashboard.welcome', { name: profile?.full_name || user?.email })}</p>
            </div>

            <div className="bg-brand-light p-8 rounded-xl shadow-lg border border-brand-moz/20">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('user.dashboard.myCourses')}</h2>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrolledCourses.map(course => {
                            const progress = course.module_count > 0 ? (course.completed_modules_count / course.module_count) * 100 : 0;
                            
                            let courseTitle = course.title;
                            let courseDescription = course.description;
                            if (language === 'en' && course.title === 'Introdução ao Petróleo, Gás Natural e Gás Natural Liquefeito') {
                                courseTitle = 'Introduction to Petroleum, Natural Gas, and Liquefied Natural Gas';
                                courseDescription = 'A comprehensive introduction to the oil and gas industry, covering key concepts and processes related to petroleum, natural gas, and LNG production and distribution.';
                            }
                            
                            return (
                            <div key={course.id} className="bg-white border rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800 mb-2">{courseTitle}</h3>
                                    <p className="text-gray-500 text-sm mb-4 h-16 overflow-hidden">{courseDescription}</p>
                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-brand-moz h-2 rounded-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{t('user.dashboard.course.modulesCompleted', { completed: course.completed_modules_count, total: course.module_count })}</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/course/${course.id}`}
                                    className="mt-6 block w-full text-center bg-brand-moz text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-up transition-all shadow-md hover:shadow-lg"
                                >
                                    {progress > 0 ? t('user.dashboard.course.continue') : t('user.dashboard.course.start')}
                                </Link>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-brand-up/30 rounded-xl bg-white">
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
