



import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { Module, UserProgress, Course, QuizQuestion, QuizAttempt } from '../types';
import Module1FinalQuiz from '../components/Module1FinalQuiz';
import Module2FinalQuiz from '../components/Module2FinalQuiz';
import Module3FinalQuiz from '../components/Module3FinalQuiz';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
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
      const controller = new AbortController();
      const { signal } = controller;

      const fetchQuestions = async () => {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('course_id', courseId)
          .abortSignal(signal);
        
        if (error) {
            if (error.name !== 'AbortError') {
                console.error("Error fetching quiz questions:", error);
            }
            return;
        }

        if (data) {
          setQuestions(data as any);
          setAnswers(new Array(data.length).fill(null));
        }
      };
      
      fetchQuestions();

      return () => {
          controller.abort();
      };
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
    const { user, profile } = useAuth();
    const { t, language } = useI18n();
    const navigate = useNavigate();
    const userId = user?.id;
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

    // In-video quiz state
    const [inVideoQuizActive, setInVideoQuizActive] = useState(false);
    const [activeQuizType, setActiveQuizType] = useState<'security' | 'layers' | 'pgChain' | 'seismicSurvey' | 'epiQuiz' | 'module1Final' | 'module2Final' | 'module3Final' | null>(null);
    const [securityQuizComplete, setSecurityQuizComplete] = useState(false);
    const [layersQuizComplete, setLayersQuizComplete] = useState(false);
    const [pgChainQuizComplete, setPgChainQuizComplete] = useState(false);
    const [seismicSurveyQuizComplete, setSeismicSurveyQuizComplete] = useState(false);
    const [epiQuizComplete, setEpiQuizComplete] = useState(false);
    const [module1FinalQuizComplete, setModule1FinalQuizComplete] = useState(false);
    const [module2FinalQuizComplete, setModule2FinalQuizComplete] = useState(false);
    const [module3FinalQuizComplete, setModule3FinalQuizComplete] = useState(false);
    const [videoQuizShowSuccess, setVideoQuizShowSuccess] = useState(false);
    const [videoQuizAttempts, setVideoQuizAttempts] = useState(0);
    const [videoQuizFeedback, setVideoQuizFeedback] = useState<string | null>(null);
    
    // Quiz 1 (Security) State
    const [selectedSecurityAnswer, setSelectedSecurityAnswer] = useState<number | null>(null);
    
    // Quiz 2 (Layers) State
    const [selectedLayers, setSelectedLayers] = useState<string[]>(['', '', '', '']);
    const layersOptions = ["Rocha Geradora", "Petróleo e Gás", "Rocha Reservatório", "Rocha Capeadora / Selo"];
    
    // Quiz 3 (PG Chain) State
    const [pgChainAnswers, setPgChainAnswers] = useState<string[]>(['', '', '', '', '']);
    const [showPgChainAnswers, setShowPgChainAnswers] = useState(false);
    const pgChainQuestions = [
        "Produção de tintas e diluentes:",
        "Distribuição de gás doméstico:",
        "Perfuração de poços de P&G:",
        "Uso de gasolina / diesel:",
        "Extração do petróleo:"
    ];
    const pgChainOptions = ["Upstream", "Midstream", "Downstream"];
    
    // Quiz 4 (Seismic Survey) State
    const [selectedSeismicAnswer, setSelectedSeismicAnswer] = useState<number | null>(null);
    const [showSeismicAnswerHint, setShowSeismicAnswerHint] = useState(false);
    const seismicSurveyOptions = [
        "Medir a profundidade do oceano",
        "Analisar a composição química da água",
        "Identificar armadilhas de hidrocarbonetos",
        "Estudar a vida marinha"
    ];

    // Quiz 5 (EPI) State
    const [selectedEpiAnswer, setSelectedEpiAnswer] = useState<boolean | null>(null);

    // State for seek blocking
    const [seekMessage, setSeekMessage] = useState<string | null>(null);
    const lastPlayerTimeRef = useRef<number>(0);
    
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

    // Navigation blocking logic
    const isModuleIncomplete = view === 'video' && activeModule && !completedModules.includes(activeModule.id);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isModuleIncomplete) {
                event.preventDefault();
                event.returnValue = t('user.course.exitWarning');
                return t('user.course.exitWarning');
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isModuleIncomplete, t]);

    // Robust audio pause and visual visibility effect
    useEffect(() => {
        if (inVideoQuizActive && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.muted = true; // Safety to stop sound
            
            const pauseInterval = setInterval(() => {
                if (videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                    videoRef.current.muted = true;
                }
            }, 50);

            return () => {
                clearInterval(pauseInterval);
                if (videoRef.current) videoRef.current.muted = false;
            };
        }
    }, [inVideoQuizActive]);

    const logActivity = useCallback(async (moduleId: string) => {
        if (!userId || !courseId) return;
        await supabase.from('activity_log').insert({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            activity_type: 'MODULE_VIEWED',
        });
    }, [userId, courseId]);

    const handleVideoTimeUpdate = () => {
        if (!videoRef.current || inVideoQuizActive) return;

        const currentTime = videoRef.current.currentTime;
        const lastTime = lastPlayerTimeRef.current;

        // --- SEEK BLOCKING LOGIC ---
        let quizZones = [];
        if (activeModule?.title.includes("Módulo 1")) {
             quizZones = [
                { trigger: 36, isComplete: securityQuizComplete, quizType: 'security' as const, resume: 42 },
                { trigger: 172, isComplete: layersQuizComplete, quizType: 'layers' as const, resume: 181 },
                { trigger: 247, isComplete: pgChainQuizComplete, quizType: 'pgChain' as const, resume: 258 },
                { trigger: 408, isComplete: seismicSurveyQuizComplete, quizType: 'seismicSurvey' as const, resume: 421 },
                { trigger: 721, isComplete: epiQuizComplete, quizType: 'epiQuiz' as const, resume: 730 },
                { trigger: 756, isComplete: module1FinalQuizComplete, quizType: 'module1Final' as const, resume: 767 },
            ];
        } else if (activeModule?.title.includes("Módulo 2")) {
            quizZones = [
                { trigger: 601, isComplete: module2FinalQuizComplete, quizType: 'module2Final' as const, resume: 607 },
            ];
        } else if (activeModule?.title.includes("Módulo 3")) {
            quizZones = [
                { trigger: 993, isComplete: module3FinalQuizComplete, quizType: 'module3Final' as const, resume: 1000 },
            ];
        }

        const isSeekingForward = currentTime > lastTime + 2;
        if (isSeekingForward) {
            const jumpedOverQuiz = quizZones.find(zone => !zone.isComplete && zone.trigger > lastTime && zone.trigger < currentTime);
            if (jumpedOverQuiz) {
                videoRef.current.currentTime = lastTime;
                setSeekMessage("Caro aluno, em breve terá um quiz para resolver. Paciência.");
                const timer = setTimeout(() => setSeekMessage(null), 3000);
                return; 
            }
        }
        lastPlayerTimeRef.current = currentTime;
        // --- END OF SEEK BLOCKING LOGIC ---

        // Gating logic to prevent seeing "hidden" content
        for (const zone of quizZones) {
            if (currentTime > zone.trigger + 1 && currentTime < zone.resume) {
                if (zone.isComplete) {
                    videoRef.current.currentTime = zone.resume;
                    return;
                } else {
                    videoRef.current.currentTime = zone.trigger;
                    return;
                }
            }
        }

        // Triggering logic for quizzes
        for (const zone of quizZones) {
            if (currentTime >= zone.trigger && currentTime < zone.trigger + 1) {
                if (document.fullscreenElement) document.exitFullscreen();
                videoRef.current.pause();
                setActiveQuizType(zone.quizType);
                setInVideoQuizActive(true);
                return; // Exit after triggering a quiz
            }
        }
    };

    const handleConfirmVideoQuiz = () => {
        if (activeQuizType === 'security') {
            if (selectedSecurityAnswer === 0) { // A) Fogo
                setVideoQuizShowSuccess(true);
                setVideoQuizAttempts(0);
                setVideoQuizFeedback(null);
                setSecurityQuizComplete(true);
            } else {
                setVideoQuizAttempts(prev => prev + 1);
                setVideoQuizFeedback("A resposta não está correta. Tente identificar o risco principal.");
            }
        } else if (activeQuizType === 'layers') {
            const correctOrder = ["Rocha Geradora", "Petróleo e Gás", "Rocha Reservatório", "Rocha Capeadora / Selo"];
            const isCorrect = selectedLayers.every((val, index) => val === correctOrder[index]);

            if (isCorrect) {
                setVideoQuizShowSuccess(true);
                setVideoQuizAttempts(0);
                setVideoQuizFeedback(null);
                setLayersQuizComplete(true);
            } else {
                setVideoQuizAttempts(prev => prev + 1);
                setVideoQuizFeedback("A ordem das camadas não está correta. Tente novamente!");
            }
        } else if (activeQuizType === 'pgChain') {
            const correctAnswers = ['Downstream', 'Downstream', 'Upstream', 'Downstream', 'Upstream'];
            const isCorrect = pgChainAnswers.every((answer, index) => answer === correctAnswers[index]);

            if (isCorrect) {
                setVideoQuizShowSuccess(true);
                setVideoQuizAttempts(0);
                setVideoQuizFeedback(null);
                setPgChainQuizComplete(true);
                setShowPgChainAnswers(false);
            } else {
                const newAttempts = videoQuizAttempts + 1;
                setVideoQuizAttempts(newAttempts);
                if (newAttempts >= 2) {
                    setShowPgChainAnswers(true);
                    setVideoQuizFeedback("Aqui estão as respostas correctas. Reveja-as antes de continuar.");
                } else {
                    setVideoQuizFeedback("Algumas respostas estão incorrectas. Tente novamente!");
                }
            }
        } else if (activeQuizType === 'seismicSurvey') {
            if (selectedSeismicAnswer === 2) { // Correct answer index
                setVideoQuizShowSuccess(true);
                setVideoQuizAttempts(0);
                setVideoQuizFeedback(null);
                setSeismicSurveyQuizComplete(true);
                setShowSeismicAnswerHint(false);
            } else {
                const newAttempts = videoQuizAttempts + 1;
                setVideoQuizAttempts(newAttempts);
                if (newAttempts >= 2) {
                    setShowSeismicAnswerHint(true);
                    setVideoQuizFeedback("A resposta está incorreta. Veja a resposta correta no canto.");
                } else {
                    setVideoQuizFeedback("Resposta incorreta. Tente novamente!");
                }
            }
        } else if (activeQuizType === 'epiQuiz') {
            if (selectedEpiAnswer === false) { // Correct answer
                setVideoQuizShowSuccess(true);
                setVideoQuizAttempts(0);
                setVideoQuizFeedback(null);
                setEpiQuizComplete(true);
            } else {
                setVideoQuizAttempts(prev => prev + 1);
                setVideoQuizFeedback("Incorreto. O uso de Equipamentos de Proteção Individual (EPI) é obrigatório por lei em situações de trabalho que ofereçam riscos à saúde e segurança do trabalhador.");
            }
        }
    };

    const handleResumeVideoAfterQuiz = () => {
        setInVideoQuizActive(false);
        setVideoQuizShowSuccess(false);
        setVideoQuizAttempts(0);
        setVideoQuizFeedback(null);
        setShowPgChainAnswers(false);
        setShowSeismicAnswerHint(false);

        const resumeAt = (time: number) => {
            if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.currentTime = time;
                videoRef.current.play();
            }
        };

        if (activeQuizType === 'security') resumeAt(42);
        else if (activeQuizType === 'layers') resumeAt(181);
        else if (activeQuizType === 'pgChain') resumeAt(258);
        else if (activeQuizType === 'seismicSurvey') resumeAt(421);
        else if (activeQuizType === 'epiQuiz') resumeAt(730);
        else if (activeQuizType === 'module1Final') {
            setModule1FinalQuizComplete(true);
            resumeAt(767); // 12:47
        }
        else if (activeQuizType === 'module2Final') {
            setModule2FinalQuizComplete(true);
            resumeAt(607); // 10:07
        }
        else if (activeQuizType === 'module3Final') {
            setModule3FinalQuizComplete(true);
            resumeAt(1000); // 16:40
        }
        
        setActiveQuizType(null);
    };

    useEffect(() => {
        if (!isProfileComplete) {
            setLoading(false);
            return;
        }

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
    }, [activeModule, t, isProfileComplete]);

    useEffect(() => {
        if (!isProfileComplete) return;

        const controller = new AbortController();
        const { signal } = controller;

        const initializeCourseState = async () => {
            if (!userId || !courseId) return;
            setLoading(true);
            setFetchError(null);

            try {
                const [courseRes, modulesRes, progressRes, attemptRes, certReqRes] = await Promise.all([
                    supabase.from('courses').select('*').eq('id', courseId).single().abortSignal(signal),
                    supabase.from('modules').select('*').eq('course_id', courseId).order('order').abortSignal(signal),
                    supabase.from('user_progress').select('module_id').eq('user_id', userId).abortSignal(signal),
                    supabase.from('quiz_attempts').select('passed').eq('user_id', userId).eq('course_id', courseId).order('completed_at', { ascending: false }).limit(1).single().abortSignal(signal),
                    supabase.from('certificate_requests').select('id').eq('user_id', userId).eq('course_id', courseId).single().abortSignal(signal)
                ]);

                if (signal.aborted) return;

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

                const { data: certReqData, error: certReqError } = certReqRes;
                if (certReqError && certReqError.code !== 'PGRST116') throw certReqError;
                if (certReqData) setCertificateRequested(true);

                const allModulesCompleted = modulesList.length > 0 && completedIds.length === modulesList.length;

                if (attemptData?.passed) {
                    setQuizPassed(true);
                    setView('certificate');
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
                if (error.name !== 'AbortError') {
                    console.error("Failed to load course data:", error.message);
                    setFetchError(t('course.player.dataLoadError'));
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        initializeCourseState();
        
        return () => {
            controller.abort();
        };
    }, [userId, courseId, navigate, logActivity, t, isProfileComplete]);

    const handleSelectModule = (module: Module) => {
        if (isModuleIncomplete && activeModule && module.id !== activeModule.id) {
            if (!window.confirm(t('user.course.changeModuleWarning'))) {
                return;
            }
        }
        setActiveModule(module);
        setView('video');
        setSecurityQuizComplete(false);
        setLayersQuizComplete(false);
        setPgChainQuizComplete(false);
        setSeismicSurveyQuizComplete(false);
        setEpiQuizComplete(false);
        setModule1FinalQuizComplete(false);
        setModule2FinalQuizComplete(false);
        setModule3FinalQuizComplete(false);
        setInVideoQuizActive(false);
        setVideoQuizShowSuccess(false);
        setVideoQuizAttempts(0);
        setVideoQuizFeedback(null);
        setActiveQuizType(null);
        setShowPgChainAnswers(false);
        setShowSeismicAnswerHint(false);
        setSelectedSeismicAnswer(null);
        setSelectedEpiAnswer(null);
        lastPlayerTimeRef.current = 0;
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
    
    if (!isProfileComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border max-w-lg">
                    <h2 className="text-2xl font-bold text-brand-up mb-4">{t('course.player.profileIncomplete.title')}</h2>
                    <p className="text-gray-700 mb-6">{t('course.player.profileIncomplete.message')}</p>
                    <Link
                        to="/profile"
                        className="bg-brand-moz text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-up transition shadow-md"
                    >
                        {t('course.player.profileIncomplete.button')}
                    </Link>
                </div>
            </div>
        );
    }

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
                        <div className="bg-white p-4 rounded-xl shadow-lg border relative overflow-hidden">
                            <div 
                                ref={containerRef}
                                className="aspect-w-16 aspect-h-9 bg-black flex justify-center items-center rounded-lg overflow-hidden relative"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {signedVideoUrl ? (
                                    <video 
                                        ref={videoRef}
                                        key={signedVideoUrl} 
                                        controls 
                                        autoPlay 
                                        className="w-full h-full" 
                                        onEnded={() => handleModuleComplete(activeModule.id)}
                                        onTimeUpdate={handleVideoTimeUpdate}
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

                                {seekMessage && (
                                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40 animate-fadeInUp" style={{animationDuration: '0.3s'}}>
                                        <p className="text-white text-lg font-semibold text-center">{seekMessage}</p>
                                    </div>
                                )}


                                {/* In-Video Quiz Overlay */}
                                {inVideoQuizActive && (
                                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-white overflow-y-auto bg-black/50">
                                        {activeQuizType === 'module1Final' ? (
                                            <Module1FinalQuiz onComplete={handleResumeVideoAfterQuiz} />
                                        ) : activeQuizType === 'module2Final' ? (
                                            <Module2FinalQuiz onComplete={handleResumeVideoAfterQuiz} />
                                        ) : activeQuizType === 'module3Final' ? (
                                            <Module3FinalQuiz onComplete={handleResumeVideoAfterQuiz} />
                                        ) : videoQuizShowSuccess ? (
                                            <div className="text-center space-y-8 animate-fadeIn max-w-lg bg-black/75 backdrop-blur-3xl p-10 rounded-3xl border border-white/20 shadow-2xl">
                                                <div className="bg-white rounded-full p-4 inline-block shadow-2xl animate-bounce">
                                                    <CheckCircleIcon className="w-20 h-20 text-brand-up" />
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-4xl font-black uppercase tracking-widest text-white">Parabéns!</h3>
                                                    <p className="text-xl font-medium opacity-90 text-white">Você concluiu o desafio com sucesso.</p>
                                                </div>
                                                <button 
                                                    onClick={handleResumeVideoAfterQuiz}
                                                    className="bg-white text-brand-up font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-all shadow-xl flex items-center gap-3 mx-auto active:scale-95 text-lg"
                                                >
                                                    Continuar vídeo <span className="text-2xl font-bold ml-1">→</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="max-w-lg w-full space-y-6 bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20">
                                                <div className="text-center">
                                                    <span className="bg-white/10 py-2 px-5 rounded-full text-sm font-bold uppercase tracking-widest">Desafio Mozup</span>
                                                </div>
                                                
                                                {activeQuizType === 'security' && (
                                                    <div className="space-y-4">
                                                        <p className="text-lg font-bold text-white text-center">Qual é o maior risco de segurança numa instalação de gás natural?</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                            {["A) Fogo", "B) Queda", "C) Ruído", "D) Calor"].map((opt, idx) => (
                                                                <button key={idx} onClick={() => { setSelectedSecurityAnswer(idx); setVideoQuizFeedback(null); }} className={`p-3 rounded-lg border-2 transition-all font-semibold text-base ${selectedSecurityAnswer === idx ? 'bg-brand-moz text-white border-transparent scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-transparent'}`}>
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {activeQuizType === 'layers' && (
                                                    <div className="space-y-4">
                                                        <p className="text-lg font-bold text-white leading-tight text-center">Associe as camadas geológicas (da mais profunda para a mais superficial).</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                                            {[1, 2, 3, 4].map((num, idx) => (
                                                                <div key={idx} className="space-y-1">
                                                                    <label className="text-xs font-bold uppercase tracking-wider text-white/70">Camada {num} {num === 1 ? '↓' : num === 4 ? '↑' : ''}</label>
                                                                    <select value={selectedLayers[idx]} onChange={(e) => { const newLayers = [...selectedLayers]; newLayers[idx] = e.target.value; setSelectedLayers(newLayers); setVideoQuizFeedback(null); }} className="w-full bg-slate-800/50 text-white p-2.5 rounded-lg font-semibold border border-white/20 focus:border-brand-moz focus:ring-brand-moz outline-none text-sm shadow-inner">
                                                                        <option value="">Selecione...</option>
                                                                        {layersOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                                                    </select>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {activeQuizType === 'pgChain' && (
                                                    <div className="space-y-4 text-left">
                                                        <p className="text-lg font-bold text-white leading-tight text-center pb-2">Selecione a etapa da cadeia de P&G para cada atividade.</p>
                                                        {pgChainQuestions.map((question, qIndex) => (
                                                            <div key={qIndex} className="bg-white/10 p-3 rounded-lg">
                                                                <p className="font-semibold text-white mb-2 text-sm">{question}</p>
                                                                {showPgChainAnswers ? (
                                                                    <p className="text-sm font-bold text-green-300">Resposta Correcta: {['Downstream', 'Downstream', 'Upstream', 'Downstream', 'Upstream'][qIndex]}</p>
                                                                ) : (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {pgChainOptions.map((option, oIndex) => (
                                                                            <button key={oIndex} onClick={() => { const newAnswers = [...pgChainAnswers]; newAnswers[qIndex] = option; setPgChainAnswers(newAnswers); setVideoQuizFeedback(null); }} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${pgChainAnswers[qIndex] === option ? 'bg-brand-moz text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}>
                                                                                {option}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {activeQuizType === 'seismicSurvey' && (
                                                    <div className="space-y-4 relative">
                                                        <p className="text-lg font-bold text-white text-center">Qual o objetivo das pesquisas sísmicas?</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                            {seismicSurveyOptions.map((opt, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => { setSelectedSeismicAnswer(idx); setVideoQuizFeedback(null); }}
                                                                    className={`p-3 rounded-lg border-2 transition-all font-semibold text-sm ${selectedSeismicAnswer === idx ? 'bg-brand-moz text-white border-transparent scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-transparent'}`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {showSeismicAnswerHint && (
                                                            <div className="absolute -top-2 -right-2 bg-green-600 text-white p-2 rounded-lg text-xs font-bold animate-fadeIn border-2 border-white/50">
                                                                Resposta: {seismicSurveyOptions[2]}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {activeQuizType === 'epiQuiz' && (
                                                    <div className="space-y-4">
                                                        <p className="text-lg font-bold text-white text-center">A afirmação "A utilização de EPI é opcional" é verdadeira ou falsa?</p>
                                                        <div className="flex justify-center gap-4 text-left">
                                                            <button
                                                                onClick={() => { setSelectedEpiAnswer(true); setVideoQuizFeedback(null); }}
                                                                className={`p-3 rounded-lg border-2 transition-all font-semibold text-base w-32 ${selectedEpiAnswer === true ? 'bg-brand-moz text-white border-transparent scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-transparent'}`}
                                                            >
                                                                Verdadeiro
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedEpiAnswer(false); setVideoQuizFeedback(null); }}
                                                                className={`p-3 rounded-lg border-2 transition-all font-semibold text-base w-32 ${selectedEpiAnswer === false ? 'bg-brand-moz text-white border-transparent scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-transparent'}`}
                                                            >
                                                                Falso
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}


                                                {videoQuizFeedback && (
                                                    <div className="bg-red-500/90 text-white p-3 rounded-lg font-semibold border-2 border-white/20 text-center">
                                                        {videoQuizFeedback}
                                                    </div>
                                                )}

                                                <div className="space-y-4 pt-4">
                                                     {showPgChainAnswers ? (
                                                        <button onClick={handleResumeVideoAfterQuiz} className="w-full bg-white text-brand-moz font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-xl active:scale-95 text-base uppercase tracking-wider">
                                                            Continuar Vídeo
                                                        </button>
                                                    ) : (
                                                        <button onClick={handleConfirmVideoQuiz} disabled={(activeQuizType === 'security' && selectedSecurityAnswer === null) || (activeQuizType === 'layers' && selectedLayers.includes('')) || (activeQuizType === 'pgChain' && pgChainAnswers.includes('')) || (activeQuizType === 'seismicSurvey' && selectedSeismicAnswer === null) || (activeQuizType === 'epiQuiz' && selectedEpiAnswer === null)} className="w-full bg-white text-brand-moz font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-xl active:scale-95 disabled:opacity-50 text-base uppercase tracking-wider">
                                                            Confirmar Resposta
                                                        </button>
                                                    )}

                                                    {videoQuizAttempts >= 2 && activeQuizType !== 'pgChain' && (
                                                        <div className="bg-white/10 p-3 rounded-lg text-left border border-white/20 backdrop-blur-md animate-fadeIn">
                                                            <p className="text-xs font-bold uppercase tracking-wider mb-1 border-b border-white/10 pb-1">Dica:</p>
                                                            <p className="text-sm font-medium">
                                                                {activeQuizType === 'security' 
                                                                    ? "Pense em qual elemento químico do gás natural (metano) reage mais perigosamente com oxigênio e calor."
                                                                    : "A Rocha Geradora fica no fundo, o Petróleo sobe para o Reservatório e o Selo segura tudo no topo."
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                <button onClick={handleRequestCertificate} className="bg-brand-moz text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-up transition-all shadow-md hover:shadow-lg">
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