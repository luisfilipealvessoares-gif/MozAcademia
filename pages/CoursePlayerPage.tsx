import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { Module, UserProgress, Course, QuizQuestion, QuizAttempt } from '../types';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);
const PlayCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
    </svg>
);

const QuizComponent: React.FC<{ courseId: string; onQuizComplete: (passed: boolean) => void }> = ({ courseId, onQuizComplete }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number|null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const { user } = useAuth();
    const { t } = useI18n();
  
    useEffect(() => {
      const fetchQuestions = async () => {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('course_id', courseId);
        if (data) {
          // FIX: Cast data to 'any' to resolve the type mismatch between Supabase's 'Json'
          // type for the 'options' field and the application's expected 'string[]' type.
          setQuestions(data as any);
          setAnswers(new Array(data.length).fill(null));
        }
      };
      fetchQuestions();
    }, [courseId]);
  
    const handleAnswer = (optionIndex: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setAnswers(newAnswers);
    };
  
    const handleSubmit = async () => {
        if (!user) return;
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correct_option_index) {
                correctAnswers++;
            }
        });
        const finalScore = (correctAnswers / questions.length) * 100;
        setScore(finalScore);
        setShowResults(true);

        const passed = finalScore >= 70;

        await supabase.from('quiz_attempts').insert({
            user_id: user.id,
            course_id: courseId,
            score: finalScore,
            passed: passed,
        });

        onQuizComplete(passed);
    };
  
    if (showResults) {
      const passed = score >= 70;
      return (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border">
          <h3 className="text-3xl font-bold mb-4">{t('quiz.resultsTitle')}</h3>
          <p className="text-xl mb-2">{t('quiz.yourFinalScore')}</p>
          <p className={`text-6xl font-bold mb-6 ${passed ? 'text-brand-moz' : 'text-red-500'}`}>{score.toFixed(0)}%</p>
          {passed ? (
            <p className="text-brand-up font-semibold text-lg">{t('quiz.passedMessage')}</p>
          ) : (
            <p className="text-red-600 font-semibold text-lg">{t('quiz.failedMessage')}</p>
          )}
        </div>
      );
    }
  
    const currentQuestion = questions[currentQuestionIndex];
    const currentOptions = currentQuestion?.options || [];
  
    return currentQuestion ? (
      <div className="p-8 bg-white rounded-xl shadow-lg border">
        <p className="text-sm font-semibold text-brand-moz mb-2">{t('quiz.questionLabel', {current: currentQuestionIndex + 1, total: questions.length})}</p>
        <h3 className="text-2xl font-bold mb-6">{currentQuestion.question_text}</h3>
        <div className="space-y-4">
          {currentOptions.map((option, index) => (
            <label key={index} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[currentQuestionIndex] === index ? 'border-brand-moz bg-brand-light' : 'border-gray-200 hover:border-brand-moz/50'}`}>
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                checked={answers[currentQuestionIndex] === index}
                onChange={() => handleAnswer(index)}
                className="h-5 w-5 text-brand-up focus:ring-brand-moz"
              />
              <span className="ml-4 text-lg text-gray-800">{option}</span>
            </label>
          ))}
        </div>
        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} 
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold"
          >
            {t('quiz.previous')}
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
              className="px-6 py-2 bg-brand-moz text-white rounded-lg font-semibold shadow-sm hover:bg-brand-up"
            >
              {t('quiz.next')}
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={answers.includes(null)}
              className="px-6 py-2 bg-brand-moz text-white rounded-lg font-semibold shadow-sm hover:bg-brand-up disabled:bg-brand-moz disabled:opacity-50"
            >
              {t('quiz.finish')}
            </button>
          )}
        </div>
      </div>
    ) : <div>{t('quiz.loading')}</div>;
};

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const { t, language } = useI18n();
    const navigate = useNavigate();
    const userId = user?.id;

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const [activeModule, setActiveModule] = useState<Module | null>(null);
    const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [view, setView] = useState<'video' | 'quiz' | 'certificate'>('video');
    const [quizPassed, setQuizPassed] = useState(false);
    const [certificateRequested, setCertificateRequested] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const logActivity = useCallback(async (moduleId: string) => {
        if (!userId || !courseId) return;
        await supabase.from('activity_log').insert({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            activity_type: 'MODULE_VIEWED',
        });
    }, [userId, courseId]);

    useEffect(() => {
        let isActive = true;
        const generateSignedUrl = async () => {
            if (activeModule && activeModule.video_url) {
                setSignedVideoUrl(null);
                setVideoError(null);
                let videoPath = activeModule.video_url;
                if (videoPath.startsWith('http')) {
                    try {
                        const url = new URL(videoPath);
                        videoPath = decodeURIComponent(url.pathname.split('/course_videos/')[1]);
                    } catch (e) {
                        console.error("Invalid video URL format:", videoPath);
                        if (isActive) setVideoError("Formato de URL do vídeo inválido.");
                        return;
                    }
                }
                const { data, error } = await supabase.storage.from('course_videos').createSignedUrl(videoPath, 3600);
                
                if (isActive) {
                    if (error) {
                        console.error("Error creating signed URL:", error.message);
                        setVideoError(t('course.player.videoLoadError'));
                    } else {
                        setSignedVideoUrl(data.signedUrl);
                    }
                }
            }
        };
        generateSignedUrl();
        return () => {
            isActive = false;
        };
    }, [activeModule, t]);

    useEffect(() => {
        let isActive = true;
        const initializeCourseState = async () => {
            if (!userId || !courseId) return;
            setLoading(true);
            setFetchError(null);

            try {
                const [courseRes, modulesRes, progressRes, attemptRes] = await Promise.all([
                    supabase.from('courses').select('*').eq('id', courseId).single(),
                    supabase.from('modules').select('*').eq('course_id', courseId).order('order'),
                    supabase.from('user_progress').select('module_id').eq('user_id', userId),
                    supabase.from('quiz_attempts').select('passed').eq('user_id', userId).eq('course_id', courseId).order('completed_at', { ascending: false }).limit(1).single()
                ]);
                
                if (!isActive) return;

                const { data: courseData, error: courseError } = courseRes;
                if (courseError) throw courseError;
                setCourse(courseData);

                const { data: modulesData, error: modulesError } = modulesRes;
                if (modulesError) throw modulesError;
                const modulesList = modulesData || [];
                setModules(modulesList as Module[]);

                const { data: progressData, error: progressError } = progressRes;
                if (progressError) throw progressError;
                const completedIds = progressData ? progressData.map(p => p.module_id) : [];
                setCompletedModules(completedIds);
                
                const { data: attemptData, error: attemptError } = attemptRes;
                if (attemptError && attemptError.code !== 'PGRST116') throw attemptError;

                const allModulesCompleted = modulesList.length > 0 && completedIds.length === modulesList.length;

                if (attemptData?.passed) {
                    setQuizPassed(true);
                    setView('certificate');
                    const { data: certReq } = await supabase.from('certificate_requests').select('id').eq('user_id', userId).eq('course_id', courseId).single();
                    if (certReq) setCertificateRequested(true);
                } else if (allModulesCompleted) {
                    setView('quiz');
                } else {
                    const firstUncompletedModule = modulesList.find(m => !completedIds.includes(m.id));
                    const initialModule = firstUncompletedModule || modulesList[0] || null;
                    if (initialModule) {
                        setActiveModule(initialModule);
                        setView('video');
                        logActivity(initialModule.id);
                    }
                }
            } catch (error: any) {
                console.error("Failed to load course data:", error.message);
                if (isActive) {
                    setFetchError(t('course.player.dataLoadError'));
                }
            } finally {
                if (isActive) setLoading(false);
            }
        };

        initializeCourseState();
        
        return () => {
            isActive = false;
        };
    }, [userId, courseId, navigate, logActivity, t]);

    const handleSelectModule = (module: Module) => {
        setActiveModule(module);
        setView('video');
        logActivity(module.id);
    };

    const handleModuleComplete = async (moduleId: string) => {
        if (!userId || completedModules.includes(moduleId)) return;
    
        await supabase.from('user_progress').insert({ user_id: userId, module_id: moduleId });
        const newCompleted = [...completedModules, moduleId];
        setCompletedModules(newCompleted);
    
        const currentModuleIndex = modules.findIndex(m => m.id === moduleId);
        const isLastModule = currentModuleIndex === modules.length - 1;

        if (!isLastModule && currentModuleIndex !== -1) {
          const nextModule = modules[currentModuleIndex + 1];
          setActiveModule(nextModule);
          logActivity(nextModule.id);
        } else {
          setView('quiz');
        }
    };
    
    const handleQuizComplete = (passed: boolean) => {
        if(passed) {
            setQuizPassed(true);
            setView('certificate');
        }
    };

    const handleRequestCertificate = async () => {
        if (!userId || !courseId) return;
        const { error } = await supabase.from('certificate_requests').insert({user_id: userId, course_id: courseId});
        if(!error) {
            setCertificateRequested(true);
            alert(t('course.player.requestSuccess'));
        } else {
            alert(t('course.player.requestError'));
        }
    };

    if (loading) return (
      <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-moz"></div>
      </div>
    );

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
              <div className="bg-white p-8 rounded-xl shadow-lg border max-w-lg">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{t('course.player.errorTitle')}</h2>
                <p className="text-gray-700 mb-6">{fetchError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-brand-moz text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-up transition"
                >
                    {t('course.player.retry')}
                </button>
              </div>
            </div>
        );
    }

    const totalModules = modules.length;
    const progressPercentage = totalModules > 0 ? (completedModules.length / totalModules) * 100 : 0;
    
    const moduleTranslations: { [key: string]: string } = {
        'Módulo 1: Introdução ao Petróleo e Gás': 'Module 1: Introduction to Oil and Gas',
        'Módulo 2: Introdução ao Gás Natural Liquefeito (GNL)': 'Module 2: Introduction to Liquefied Natural Gas (LNG)',
        'Módulo 3: Indústria de Petróleo e Gás em Moçambique': 'Module 3: Oil and Gas Industry in Mozambique'
    };
    
    const getTranslatedTitle = (originalTitle: string) => {
        return language === 'en' ? (moduleTranslations[originalTitle] || originalTitle) : originalTitle;
    };

    let courseTitle = course?.title || '';
    if (language === 'en' && course?.title === 'Introdução ao Petróleo, Gás Natural e Gás Natural Liquefeito') {
        courseTitle = 'Introduction to Petroleum, Natural Gas, and Liquefied Natural Gas';
    }

    return (
        <div className="bg-brand-light -mx-8 -my-8 p-8 rounded-xl">
            <Link to="/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-brand-up hover:text-brand-moz transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                {t('course.player.backToDashboard')}
            </Link>
            <div className="mb-8 p-6 bg-gradient-to-r from-brand-moz to-brand-up rounded-xl shadow-lg text-white">
                <p className="font-semibold opacity-90 tracking-wider">{t('course.player.course')}</p>
                <h1 className="text-4xl font-extrabold drop-shadow-md">{courseTitle}</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <main className="lg:col-span-3">
                    {view === 'video' && activeModule && (
                        <div className="bg-white p-4 rounded-xl shadow-lg border">
                            <div 
                                className="aspect-w-16 aspect-h-9 bg-black flex justify-center items-center rounded-lg overflow-hidden"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {signedVideoUrl ? (
                                    <video 
                                        key={signedVideoUrl} 
                                        controls 
                                        autoPlay 
                                        className="w-full h-full" 
                                        onEnded={() => handleModuleComplete(activeModule.id)}
                                        controlsList="nodownload"
                                        onContextMenu={(e) => e.preventDefault()}
                                    >
                                        <source src={signedVideoUrl} type="video/mp4" />
                                        {t('course.player.videoNotSupported')}
                                    </video>
                                ) : videoError ? (
                                    <div className="text-red-400 p-4 text-center">
                                        <p className="font-semibold">{videoError}</p>
                                        <p className="text-sm text-gray-400 mt-2">{t('course.player.videoSupportContact')}</p>
                                    </div>
                                ) : (
                                    <div className="text-white flex items-center space-x-2">
                                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                      <span>{t('course.player.loadingVideo')}</span>
                                    </div>
                                )}
                            </div>
                             <div className="p-4">
                                <h2 className="text-2xl font-bold mt-2">{getTranslatedTitle(activeModule.title)}</h2>
                            </div>
                        </div>
                    )}
                    {view === 'quiz' && courseId && (
                        <div>
                            <button
                                onClick={() => {
                                    const lastModule = modules.length > 0 ? modules[modules.length - 1] : null;
                                    if (lastModule) {
                                        handleSelectModule(lastModule);
                                    }
                                }}
                                className="flex items-center gap-2 mb-4 font-semibold text-brand-up hover:text-brand-moz transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                {t('course.player.backToLastModule')}
                            </button>
                            <QuizComponent courseId={courseId} onQuizComplete={handleQuizComplete} />
                        </div>
                    )}
                    {view === 'certificate' && quizPassed && (
                        <div className="bg-white p-8 rounded-xl shadow-lg border text-center">
                            <h2 className="text-4xl font-bold text-brand-up mb-4">{t('course.player.congratulations')}</h2>
                            <p className="text-xl mb-6">{t('course.player.courseComplete', { title: courseTitle })}</p>
                            {certificateRequested ? (
                                <p className="text-blue-600 font-semibold text-lg">{t('course.player.certificateRequested')}</p>
                            ) : (
                                <button onClick={handleRequestCertificate} className="bg-brand-moz text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-up transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    {t('course.player.requestCertificate')}
                                </button>
                            )}
                        </div>
                    )}
                </main>
                <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border">
                    <h3 className="text-xl font-bold mb-4">{t('course.player.progress')}</h3>
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div className="bg-brand-moz h-2.5 rounded-full" style={{width: `${progressPercentage}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 text-center">{t('course.player.modulesCompleted', { completed: completedModules.length, total: totalModules })}</p>

                    <h3 className="text-xl font-bold mb-4">{t('course.player.modules')}</h3>
                    <ul className="space-y-2">
                    {modules.map((module, index) => {
                        const isCompleted = completedModules.includes(module.id);
                        const isLocked = index > 0 && !completedModules.includes(modules[index - 1].id);
                        const isActive = activeModule?.id === module.id && view === 'video';
                        const moduleTitle = getTranslatedTitle(module.title);
                        
                        let Icon;
                        let iconClasses = "w-5 h-5 mr-3 ";
                        if (isActive) {
                          Icon = PlayCircleIcon;
                          iconClasses += "text-brand-moz";
                        } else if (isCompleted) {
                          Icon = CheckCircleIcon;
                           iconClasses += "text-brand-moz";
                        } else if (isLocked) {
                          Icon = LockIcon;
                          iconClasses += "text-gray-400";
                        }

                        return (
                        <li key={module.id}>
                            <button
                            onClick={() => !isLocked && handleSelectModule(module)}
                            disabled={isLocked}
                            className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${
                                isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-brand-light'
                            } ${isActive ? 'bg-brand-light ring-2 ring-brand-moz font-semibold text-brand-up' : 'text-gray-700'}`}
                            >
                            {Icon && <Icon className={iconClasses} />}
                            <span className="flex-1 truncate">{index + 1}. {moduleTitle}</span>
                            </button>
                        </li>
                        );
                    })}
                    <li className="mt-4 pt-4 border-t">
                        <button 
                            disabled={completedModules.length !== modules.length}
                            onClick={() => setView('quiz')}
                            className="w-full text-left p-3 rounded-lg flex items-center font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                             <LockIcon className={`w-5 h-5 mr-3 ${completedModules.length !== modules.length ? 'text-gray-400' : 'text-gray-700'}`}/>
                            {t('course.player.finalQuiz')}
                        </button>
                    </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default CoursePlayerPage;
